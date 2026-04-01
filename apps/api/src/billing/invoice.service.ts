import {
  Injectable,
  Inject,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import Stripe from 'stripe';
import { prisma, UsageEventType } from '@hotelcheckin/database';
import { STRIPE_PROVIDER, TIER_CONFIG } from './billing.constants';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitAmountCad: number;
  totalCad: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  organizationName: string;
  billingAddress?: string;
  periodStart: Date;
  periodEnd: Date;
  tierName: string;
  monthlyPriceCad: number;
  lineItems: InvoiceLineItem[];
  overageChargesCad: number;
  subtotalCad: number;
  taxRatePct: number;
  taxCad: number;
  totalDueCad: number;
  generatedAt: Date;
}

export interface OverageResult {
  organizationId: string;
  tier: string;
  allowance: number;
  used: number;
  overageUnits: number;
  overageRatePerUnit: number;
  overageAmountCad: number;
  isOverage: boolean;
  periodStart: Date;
  periodEnd: Date;
}

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(@Inject(STRIPE_PROVIDER) private readonly stripe: Stripe) {}

  /**
   * Calculate overage for an organization within a billing period.
   */
  async calculateOverage(
    organizationId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<OverageResult> {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `No subscription found for organization ${organizationId}`,
      );
    }

    const tierConfig = TIER_CONFIG[subscription.tier];

    // Sum all pre-check events in the period
    const usageAgg = await prisma.usageRecord.aggregate({
      where: {
        organizationId,
        eventType: UsageEventType.PRE_CHECK_COMPLETED,
        periodStart: { gte: periodStart },
        periodEnd: { lte: periodEnd },
      },
      _sum: { count: true },
    });

    const used = usageAgg._sum.count ?? 0;
    const overageUnits = Math.max(0, used - subscription.annualCheckInAllowance);
    const overageAmountCad = overageUnits * tierConfig.overagePerUnit;

    return {
      organizationId,
      tier: subscription.tier,
      allowance: subscription.annualCheckInAllowance,
      used,
      overageUnits,
      overageRatePerUnit: tierConfig.overagePerUnit,
      overageAmountCad,
      isOverage: overageUnits > 0,
      periodStart,
      periodEnd,
    };
  }

  /**
   * Generate an invoice for an organization for a given period.
   * Returns invoice metadata plus an HTML string for PDF rendering.
   */
  async generateInvoice(
    organizationId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<{ html: string; metadata: InvoiceData }> {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      throw new NotFoundException(`Organization ${organizationId} not found`);
    }

    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `No subscription found for organization ${organizationId}`,
      );
    }

    const tierConfig = TIER_CONFIG[subscription.tier];

    // Gather usage breakdown by event type
    const usageByType = await prisma.usageRecord.groupBy({
      by: ['eventType'],
      where: {
        organizationId,
        periodStart: { gte: periodStart },
        periodEnd: { lte: periodEnd },
      },
      _sum: { count: true },
    });

    const usageMap: Record<string, number> = {};
    for (const row of usageByType) {
      usageMap[row.eventType] = row._sum.count ?? 0;
    }

    const preChecks = usageMap[UsageEventType.PRE_CHECK_COMPLETED] ?? 0;
    const emailsSent = usageMap[UsageEventType.EMAIL_SENT] ?? 0;
    const smsSent = usageMap[UsageEventType.SMS_SENT] ?? 0;

    const overage = await this.calculateOverage(
      organizationId,
      periodStart,
      periodEnd,
    );

    const monthlyPriceCad = tierConfig.monthlyPrice / 100; // convert cents to dollars

    const lineItems: InvoiceLineItem[] = [
      {
        description: `${subscription.tier} Plan — Base Subscription`,
        quantity: 1,
        unitAmountCad: monthlyPriceCad,
        totalCad: monthlyPriceCad,
      },
      {
        description: `Pre-Check-In Completions (${subscription.annualCheckInAllowance.toLocaleString()} included)`,
        quantity: preChecks,
        unitAmountCad: 0,
        totalCad: 0,
      },
      {
        description: 'Email Notifications Sent',
        quantity: emailsSent,
        unitAmountCad: 0,
        totalCad: 0,
      },
      {
        description: 'SMS Notifications Sent',
        quantity: smsSent,
        unitAmountCad: 0,
        totalCad: 0,
      },
    ];

    if (overage.isOverage) {
      lineItems.push({
        description: `Overage — ${overage.overageUnits.toLocaleString()} additional check-ins @ $${tierConfig.overagePerUnit.toFixed(2)} CAD each`,
        quantity: overage.overageUnits,
        unitAmountCad: tierConfig.overagePerUnit,
        totalCad: overage.overageAmountCad,
      });
    }

    const subtotalCad = monthlyPriceCad + overage.overageAmountCad;
    const taxRatePct = 5; // GST 5%
    const taxCad = subtotalCad * (taxRatePct / 100);
    const totalDueCad = subtotalCad + taxCad;

    const invoiceNumber = `INV-${org.id.slice(0, 8).toUpperCase()}-${periodStart.toISOString().slice(0, 7).replace('-', '')}`;

    const metadata: InvoiceData = {
      invoiceNumber,
      organizationName: org.name,
      billingAddress: undefined,
      periodStart,
      periodEnd,
      tierName: subscription.tier,
      monthlyPriceCad,
      lineItems,
      overageChargesCad: overage.overageAmountCad,
      subtotalCad,
      taxRatePct,
      taxCad,
      totalDueCad,
      generatedAt: new Date(),
    };

    const html = this.generateInvoicePdf(metadata);

    this.logger.log(
      `Generated invoice ${invoiceNumber} for org ${organizationId}: $${totalDueCad.toFixed(2)} CAD`,
    );

    return { html, metadata };
  }

  /**
   * Build an HTML invoice template that can be printed to PDF by the browser.
   */
  generateInvoicePdf(data: InvoiceData): string {
    const fmt = (n: number) =>
      n.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

    const fmtDate = (d: Date) =>
      d.toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

    const lineItemRows = data.lineItems
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0;">${item.description}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: right;">${item.quantity.toLocaleString()}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: right;">${item.unitAmountCad > 0 ? fmt(item.unitAmountCad) : '—'}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 500;">${item.totalCad > 0 ? fmt(item.totalCad) : '—'}</td>
      </tr>`,
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1a1a2e;
      background: #fff;
      font-size: 14px;
      line-height: 1.5;
    }
    .invoice-wrapper {
      max-width: 800px;
      margin: 40px auto;
      padding: 48px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 32px;
      border-bottom: 2px solid #2563eb;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-badge {
      width: 40px; height: 40px; border-radius: 8px;
      background: #2563eb; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 14px;
    }
    .brand-name { font-size: 20px; font-weight: 700; color: #1e3a8a; }
    .brand-tagline { font-size: 12px; color: #6b7280; }
    .invoice-meta { text-align: right; }
    .invoice-number { font-size: 22px; font-weight: 700; color: #1e3a8a; }
    .invoice-date { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .bill-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 36px;
      gap: 32px;
    }
    .bill-block { flex: 1; }
    .bill-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 6px; }
    .bill-value { font-size: 15px; font-weight: 600; color: #111827; }
    .bill-sub { font-size: 13px; color: #6b7280; margin-top: 2px; }
    .period-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: #eff6ff; border: 1px solid #bfdbfe;
      color: #1d4ed8; border-radius: 6px;
      padding: 4px 12px; font-size: 13px; font-weight: 500;
      margin-bottom: 36px;
    }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #f8fafc; }
    thead th {
      padding: 10px 12px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
      border-bottom: 2px solid #e5e7eb;
    }
    thead th:not(:first-child) { text-align: right; }
    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }
    .totals-table { width: 280px; }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 14px;
      color: #374151;
    }
    .totals-row.tax { color: #6b7280; font-size: 13px; }
    .totals-row.total {
      padding: 12px 0 0;
      margin-top: 8px;
      border-top: 2px solid #1e3a8a;
      font-size: 16px;
      font-weight: 700;
      color: #1e3a8a;
    }
    .overage-notice {
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 24px;
      font-size: 13px;
      color: #9a3412;
    }
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #9ca3af;
    }
    .print-btn {
      display: block;
      margin: 24px auto;
      padding: 10px 24px;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <!-- Header -->
    <div class="header">
      <div class="brand">
        <div class="brand-badge">HC</div>
        <div>
          <div class="brand-name">HotelCheckIn</div>
          <div class="brand-tagline">Guest Experience Platform</div>
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-number">INVOICE</div>
        <div style="font-size: 15px; font-weight: 600; color: #374151; margin-top: 4px;">${data.invoiceNumber}</div>
        <div class="invoice-date">Generated: ${fmtDate(data.generatedAt)}</div>
      </div>
    </div>

    <!-- Bill To / Plan -->
    <div class="bill-section">
      <div class="bill-block">
        <div class="bill-label">Bill To</div>
        <div class="bill-value">${data.organizationName}</div>
        ${data.billingAddress ? `<div class="bill-sub">${data.billingAddress}</div>` : ''}
      </div>
      <div class="bill-block">
        <div class="bill-label">Subscription Plan</div>
        <div class="bill-value">${data.tierName} Tier</div>
        <div class="bill-sub">${fmt(data.monthlyPriceCad)} CAD / month</div>
      </div>
      <div class="bill-block" style="text-align: right;">
        <div class="bill-label">Amount Due</div>
        <div style="font-size: 24px; font-weight: 700; color: #1e3a8a;">${fmt(data.totalDueCad)}</div>
        <div class="bill-sub">CAD (incl. GST)</div>
      </div>
    </div>

    <!-- Billing Period -->
    <div class="period-badge">
      Billing Period: ${fmtDate(data.periodStart)} — ${fmtDate(data.periodEnd)}
    </div>

    ${
      data.overageChargesCad > 0
        ? `<div class="overage-notice">
        <strong>Overage Notice:</strong> Your usage exceeded the included allowance this billing period.
        Additional charges of ${fmt(data.overageChargesCad)} CAD have been applied.
      </div>`
        : ''
    }

    <!-- Line Items -->
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: right;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${lineItemRows}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
      <div class="totals-table">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>${fmt(data.subtotalCad)}</span>
        </div>
        ${
          data.overageChargesCad > 0
            ? `<div class="totals-row">
          <span>Overage Charges</span>
          <span>${fmt(data.overageChargesCad)}</span>
        </div>`
            : ''
        }
        <div class="totals-row tax">
          <span>GST (${data.taxRatePct}%)</span>
          <span>${fmt(data.taxCad)}</span>
        </div>
        <div class="totals-row total">
          <span>Total Due (CAD)</span>
          <span>${fmt(data.totalDueCad)}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div>HotelCheckIn — Canadian Guest Experience Platform</div>
      <div>${data.invoiceNumber} · ${fmtDate(data.generatedAt)}</div>
    </div>
  </div>

  <button class="print-btn no-print" onclick="window.print()">Print / Save as PDF</button>
</body>
</html>`;
  }

  /**
   * Fetch invoice list from Stripe for the organization's customer.
   */
  async getInvoiceHistory(
    organizationId: string,
    limit?: number,
    startingAfter?: string,
  ) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      throw new NotFoundException(`Organization ${organizationId} not found`);
    }

    if (!org.stripeCustomerId) {
      return { data: [], hasMore: false };
    }

    const params: Stripe.InvoiceListParams = {
      customer: org.stripeCustomerId,
      limit: limit ?? 10,
    };

    if (startingAfter) {
      params.starting_after = startingAfter;
    }

    const invoices = await this.stripe.invoices.list(params);

    return {
      data: invoices.data.map((inv) => ({
        id: inv.id,
        number: inv.number,
        status: inv.status,
        amountDueCad: (inv.amount_due ?? 0) / 100,
        amountPaidCad: (inv.amount_paid ?? 0) / 100,
        currency: inv.currency,
        periodStart: inv.period_start
          ? new Date(inv.period_start * 1000)
          : null,
        periodEnd: inv.period_end ? new Date(inv.period_end * 1000) : null,
        invoicePdfUrl: inv.invoice_pdf,
        hostedInvoiceUrl: inv.hosted_invoice_url,
        createdAt: new Date(inv.created * 1000),
      })),
      hasMore: invoices.has_more,
    };
  }

  /**
   * Fetch a single invoice from Stripe by invoice ID.
   */
  async getInvoiceById(stripeInvoiceId: string) {
    const invoice = await this.stripe.invoices.retrieve(stripeInvoiceId);

    return {
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      amountDueCad: (invoice.amount_due ?? 0) / 100,
      amountPaidCad: (invoice.amount_paid ?? 0) / 100,
      currency: invoice.currency,
      periodStart: invoice.period_start
        ? new Date(invoice.period_start * 1000)
        : null,
      periodEnd: invoice.period_end
        ? new Date(invoice.period_end * 1000)
        : null,
      lineItems: invoice.lines?.data?.map((line) => ({
        description: line.description,
        amount: (line.amount ?? 0) / 100,
        quantity: line.quantity,
      })),
      invoicePdfUrl: invoice.invoice_pdf,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      createdAt: new Date(invoice.created * 1000),
    };
  }
}

/**
 * CASL (Canada's Anti-Spam Legislation) footer generator.
 * Every commercial electronic message must include:
 * - Sender identification (hotel name)
 * - Physical mailing address
 * - Unsubscribe mechanism
 *
 * Reference: Canada's Anti-Spam Legislation (S.C. 2010, c. 23)
 */

export interface CaslFooterOptions {
  hotelName: string;
  address: string;
  unsubscribeUrl: string;
}

/**
 * Unified CASL footer — returns both HTML and plain-text variants.
 * Bilingual (EN + FR) regardless of locale.
 */
export function generateCaslFooter(
  hotelName: string,
  address: string,
  unsubscribeUrl: string,
  _locale?: string,
): { html: string; text: string } {
  const opts: CaslFooterOptions = { hotelName, address, unsubscribeUrl };
  return {
    html: generateCaslFooterHtml(opts),
    text: generateCaslFooterPlainText(opts),
  };
}

export function generateCaslFooterHtml(options: CaslFooterOptions): string {
  const { hotelName, address, unsubscribeUrl } = options;

  return `
<div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;font-size:12px;color:#666;line-height:1.5;">
  <p>
    This message was sent by <strong>${hotelName}</strong><br/>
    ${address}
  </p>
  <p>
    You received this email because you have an upcoming reservation with us.
    If you no longer wish to receive these messages, you can
    <a href="${unsubscribeUrl}" style="color:#0066cc;">unsubscribe here</a>.
  </p>
  <hr style="border:none;border-top:1px solid #e0e0e0;margin:12px 0;"/>
  <p>
    Ce message a été envoyé par <strong>${hotelName}</strong><br/>
    ${address}
  </p>
  <p>
    Vous recevez ce courriel en raison d'une réservation à venir chez nous.
    Si vous ne souhaitez plus recevoir ces messages, vous pouvez
    <a href="${unsubscribeUrl}" style="color:#0066cc;">vous désabonner ici</a>.
  </p>
</div>`.trim();
}

export function generateCaslFooterPlainText(options: CaslFooterOptions): string {
  const { hotelName, address, unsubscribeUrl } = options;

  return [
    '---',
    `This message was sent by ${hotelName}`,
    address,
    `To unsubscribe: ${unsubscribeUrl}`,
    '',
    '---',
    `Ce message a été envoyé par ${hotelName}`,
    address,
    `Pour vous désabonner: ${unsubscribeUrl}`,
  ].join('\n');
}

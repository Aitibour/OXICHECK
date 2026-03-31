# Hotel Pre-Check-In SaaS — Full Product Plan
*Last updated: 2026-03-31 | Incorporates gap analysis review*

---

## 1. Product Scope

Build a hotel pre-check-in SaaS with no hardware required.

Core flow: PMS integration → 48h pre-arrival email/SMS → guest self-check web app → hotel dashboard → optional upsell/payment

- Support multi-property hotels and hotel groups
- Prioritize web app first, mobile later if needed
- Bilingual (French/English) from day one — required for Quebec properties under Bill 96
- White-label: hotels present the guest flow under their own brand (custom domain, logo, brand colors, tone of voice)
- "Built for Canada" positioning: Canadian data residency, Law 25 compliance, CASL compliance — actively marketed as a differentiator vs. US competitors

**Product narrative (before/after):**
Today, a 50-room boutique hotel in Montreal handles Friday afternoon arrivals with a front desk queue, manual ID checks, paper registration cards, and upsells pitched verbally. With this product: guests arrive having already completed their profile, reviewed policies, selected upsells, and optionally provided a payment method. Front desk time drops from 4–6 minutes per guest to under 1 minute. Upsell revenue that was never captured now appears automatically.

---

## 2. Core Modules

- Admin portal for platform team
- Hotel portal for operations/front desk
- Guest pre-check-in web flow (bilingual EN/FR, WCAG 2.1 AA compliant)
- PMS integration middleware
- Upsell engine with visual rule builder
- Payment integration layer
- Billing/subscription engine (**MVP requirement — Phase 1, not Phase 4**)
- Communication templates and ESP layer
- Reporting and analytics with industry benchmarks
- Security and audit layer
- Sandbox/test tenant environment
- Customer success tooling (onboarding tracker, knowledge base)

---

## 3. Architecture Direction

- Cloud-native SaaS on **Azure Canada Central (primary)** and **Azure Canada East (DR only)**
- Canadian data residency is non-negotiable and a stated sales feature — no tenant data replicates to US Azure regions
- Separate frontend, backend API, integration middleware, and database layers
- Multi-tenant architecture by hotel/account
- API-first design so PMS and future channels can connect cleanly
- Event-driven jobs for emails, reminders, sync, billing, and notifications
- Infrastructure as code (Bicep or Terraform) for all Azure resources — all environments must be reproducible from code
- Bilingual i18n architecture built into guest flow and all guest-facing surfaces from day one

---

## 4. Database Management

- Azure-managed PostgreSQL (Azure Canada Central)
- Separate production, staging, and development environments
- Tenant isolation strategy: schema-per-tenant or row-level security with tenant ID enforced at ORM layer — validate multi-tenant isolation in Phase 1 before any hotel data is ingested
- Encrypt data at rest (Azure Transparent Data Encryption) and in transit (TLS 1.2+)
- Backup, point-in-time recovery (RPO 1h target), and disaster recovery to Canada East
- Retention, archival, and deletion policies defined per data category:
  - Guest personal data: deleted or anonymized within 90 days of checkout unless hotel contract requires longer
  - ID images: deleted within 24 hours of check-in completion (see Section 9)
  - Payment tokens: deleted per gateway contract terms
  - Audit logs: retained 7 years for compliance
- Log all DBA/admin access and sensitive operations
- Schema covers: guest data, booking data, upsells, payments, billing usage, audit events, communication logs

---

## 5. User Authentication

Separate authentication for:
- Platform admins
- Hotel staff
- Guest users (token-based, no account creation required)

- Use secure identity provider or enterprise-grade auth service (e.g., Auth0, Clerk, or custom JWT with refresh token rotation)
- MFA required for platform admins and hotel managers (General Manager and above)
- Role-based access control by organization, property, and function

**Hotel staff role taxonomy:**

| Role | Access |
|------|--------|
| Property Owner | Full access including billing, all properties |
| General Manager | Full operational access, no billing |
| Front Desk Supervisor | Dashboard, manual check-in, guest profile view |
| Front Desk Agent | Check-in queue, limited guest PII view |
| Revenue Manager | Upsell catalog, reporting, no guest PII |

- Session management, timeout, password policy, and account recovery
- Optional SSO later for large hotel groups

---

## 6. Security

- Security-by-design from day one
- Privacy agreement and data processing documentation (DPA) for every hotel client, including Canadian data residency confirmation
- Principle of least privilege for users, admins, and services
- Centralized audit logs for login, data access, config changes, integrations, and billing events
- Secure secrets management (Azure Key Vault)
- WAF, rate limiting, DDoS protection (Azure Front Door), and vulnerability scanning
- **Security testing cadence:**
  - Automated vulnerability scanning integrated into CI/CD pipeline (GitHub Advanced Security or OWASP ZAP on every PR merge)
  - Full pen test before pilot launch
  - Annual pen test post-launch
  - Targeted testing whenever a new integration (payment gateway, PMS connector) is added
  - Severity classification and remediation SLAs: Critical = 48h, High = 2 weeks, Medium = 30 days
- Incident response and breach notification process (72-hour notification required under Law 25 for Quebec-relevant incidents)
- Compliance review: PIPEDA, Quebec Law 25, CASL, PCI DSS impact, Accessible Canada Act/AODA

**WCAG 2.1 AA compliance** is required for the guest web application — designed in from the start, not retrofitted. Required under Canada's Accessible Canada Act and Ontario's AODA.

---

## 7. API Security

- Secure all APIs with strong authentication and authorization
- OAuth2/API keys/service accounts for integrations
- TLS 1.2+ for all traffic
- Input validation and payload sanitization on all endpoints
- Rate limiting and abuse protection (per-tenant and global)
- Key rotation with managed scopes and permissions
- Log every integration request and response outcome
- API versioning from day one
- Webhook verification (HMAC signatures) and replay protection (idempotency keys)

---

## 8. PMS Integration Strategy

Build a middleware layer between PMS APIs and the platform API. Normalize reservation, guest, stay, and room data into one internal model.

**Target PMS vendors (priority order):**

| Priority | Vendor | Rationale |
|----------|--------|-----------|
| 1 | **Cloudbeds** | Largest Canadian independent user base; modern REST API; acts as both PMS and channel manager for many properties |
| 2 | **Mews** | Fastest-growing in Canada; acquired Hotello Montreal (Jan 2026); modern API; strong boutique/lifestyle positioning |
| 3 | **RoomKeyPMS** | Canadian-built; strong in BC/Western Canada |
| 4 | **Maestro PMS** | Canadian-built; used by many full-service independents; older API, higher integration effort |

- Apply for sandbox API access to Cloudbeds and Mews before development begins
- Map the full reservation data flow for each target PMS: where does the booking originate, how quickly does it reach the PMS, what are known sync delays
- For all-in-one platforms like Cloudbeds, treat them as the source of truth — do not layer a separate channel manager integration on top
- Support pull and push patterns depending on PMS capability
- Handle mapping, retries, sync errors, and fallback queues
- Define go-live checklist per PMS
- Onboarding timeline target: 7–14 days where PMS API access is ready
- **Channel manager risk:** Reservations from OTAs (Booking.com, Expedia) may arrive via channel manager with sync lag. Document per-vendor sync delay and build grace periods into the 48h pre-check trigger logic to avoid triggering on reservations that haven't fully synced.

---

## 9. Guest Pre-Check Workflow

- Trigger pre-check communication 48 hours before arrival (account for PMS sync lag — see Section 8)
- Guest completes: profile, stay details, policies acknowledgment, optional requests
- **Bilingual (EN/FR):** Hotel sets default language; guest can override at any point in the flow
- **ID handling:** Collect ID image for staff review, then automatically delete within 24 hours of check-in completion. This model is defensible under PIPEDA and avoids sub-processor requirements. Guest must give explicit consent to ID collection with stated retention period before upload.
- Optional: signature, payment pre-authorization (see Section 11)
- Save completion status back to dashboard (completed / partial / not-started)
- Front desk always retains a manual check-in path — never dependent on guest having completed pre-check

**Manual fallback procedures** must be documented for hotel staff for each failure scenario:
1. Platform down entirely → staff use PMS directly; pre-check data not required
2. PMS sync stale → front desk sees warning banner; process as walk-in check-in
3. Guest link expired → front desk regenerates link or processes manually
4. Guest arrives without completing pre-check → front desk captures same data via hotel portal form
5. Payment pre-auth failed → front desk collects payment on arrival via their existing terminal

All fallback procedures must be available as a printed one-page quick reference card for each hotel property.

---

## 10. Upsell Module

- Configurable catalog by property
- Supported categories: breakfast, spa, airport pickup, room upgrade, early check-in, late checkout, parking, celebration packages
- **Rules engine data model:**
  - Available attributes: arrival day of week, nights stayed, room category, rate code, booking source (OTA vs. direct), lead time, guest type
  - Logic operators: AND/OR, equals/not equals, greater/less than
  - Actions: show offer, suppress offer, apply dynamic pricing
  - Visual rule builder in hotel admin portal — no JSON or code configuration required
- Track offer views, conversions, and revenue per offer and per property from day one
- Personalization with AI deferred to post-launch phase

**Industry benchmarks (display in dashboards as reference lines):**
- Room upgrade offer conversion: 3–8%
- Early check-in offer conversion: 10–20%
- Breakfast package: 8–15%
- Airport pickup: 5–10%

---

## 11. Client Payment Gateway Integration

- Keep hotel as payment owner — do not become merchant of record in MVP
- **Supported gateways for MVP:** Stripe and Moneris (covers majority of Canadian independent hotels)
- **PCI DSS approach:** Use hosted payment page model (Stripe Payment Links or Moneris Hosted Pay Page) so card data never touches your servers, keeping you outside PCI DSS card data scope
- Get a written QSA PCI scope assessment before launching payment features — document this for hotel clients
- Three models:
  1. Pay on site (no payment captured in pre-check flow)
  2. Pay via hotel's existing gateway (hotel configures their gateway credentials in admin portal)
  3. Payment request/tokenization before arrival (hosted payment page, token passed to hotel's gateway)
- Clearly separate payment status from booking status in dashboard and API
- Additional gateways (Square, Global Payments) in Phase 3+ based on customer demand

---

## 12. Compliance — Canadian Legal Requirements

This section is a non-negotiable MVP requirement.

### PIPEDA (Federal)
- Governs collection, use, and disclosure of personal information in commercial activities across Canada
- Basis for all privacy consent language in the guest flow
- Mandatory breach notification within a reasonable time (no fixed window, but immediately practicable)

### Quebec Law 25 (Bill 64)
- Fully in force since September 2023; applies to all Quebec residents regardless of where your company is incorporated
- **Before onboarding any Quebec hotel:**
  - Appoint a designated Privacy Officer
  - Complete a Privacy Impact Assessment (PIA) for the platform
  - Build a working Data Subject Request (DSR) workflow: deletion, portability, access requests
  - Publish a bilingual (EN/FR) privacy policy
  - Implement explicit consent with stated purpose before collecting any personal information
- 72-hour mandatory breach notification to Quebec's Commission d'accès à l'information (CAI)
- Penalties: up to 4% of worldwide turnover or $25M CAD

### CASL (Canada's Anti-Spam Legislation)
- Governs all commercial electronic messages sent to Canadian recipients — applies to pre-check-in emails, SMS, and any upsell content within those messages
- **Consent basis:** Booking confirmation from the hotel establishes an existing business relationship = implied consent under CASL for transactional messages (pre-check flow)
- **Upsell content within pre-check messages counts as commercial content** — require explicit opt-in for marketing messages; keep transactional and commercial content clearly separated or use explicit consent
- Every message must include: sender identification, hotel's physical mailing address, and a functional unsubscribe mechanism
- Get a Canadian lawyer to review all email/SMS templates before pilot launch

### Bill C-27 (Federal — CPPA)
- Successor to PIPEDA; not yet fully in force as of March 2026 but monitor progress — aligns closely with Law 25 requirements, so Law 25 compliance provides a head start

### PCI DSS
- Hosted payment page model keeps you out of card data scope (see Section 11)
- Confirm PCI scope in writing from a QSA before any payment features launch

---

## 13. Billing Model for Your SaaS

- Dynamic pay-as-you-go pricing based on yearly check-in volume
- **Billing engine is Phase 1, not Phase 4** — you cannot sign hotel client contracts without a working billing system
- 3–4 pricing tiers by annual pre-check volume:

| Tier | Annual Volume | Notes |
|------|--------------|-------|
| Tier 1 — Starter | up to X check-ins/year | Low-volume boutique properties |
| Tier 2 — Growth | X–Y check-ins/year | Mid-volume independents |
| Tier 3 — Scale | Y–Z check-ins/year | High-volume properties |
| Tier 4 — Enterprise | Z+ or multi-property group | Custom pricing, dedicated support |

- Base annual subscription + usage allowance per tier
- Overage charged when yearly volume exceeds tier threshold
- Define billable event precisely: a completed pre-check submission (not a sent email, not a login)
- Optional setup/integration fee for complex PMS cases (e.g., legacy PMS with limited API)
- **Billing engine Phase 1 scope:** subscription creation, usage metering per tenant, invoice generation, Stripe billing integration, usage dashboard for hotel admins

---

## 14. Communication Templates and ESP Layer

**MVP template set:**
1. Pre-check-in invitation (email + SMS) — triggered 48h before arrival
2. Reminder (email + SMS) — sent 24h before arrival to non-completers only
3. Post-completion confirmation (email) — sent immediately when guest finishes pre-check
4. (Phase 4) Post-stay follow-up — checkout confirmation + review prompt

**Customization model:**
- Hotels can edit: subject lines, body text, logo, brand colors, tone of voice, sender name
- Hotels cannot remove: unsubscribe link, sender physical address, sender identification (CASL requirements)
- Hotels can set custom sending domain (e.g., `checkin@hotelname.com`) via DNS configuration support

**Technical requirements:**
- Send through dedicated ESP: Postmark or SendGrid (not shared IP pools)
- Mandatory SPF, DKIM, and DMARC authentication configured for each hotel's sending domain
- Test all templates against spam filters (Mail Tester, GlockApps) before launch
- Track delivery, open, click, and unsubscribe rates per template per property
- All templates available in EN and FR; hotel sets default language; guest can override

---

## 15. Reporting and KPI Tracking

**Hotel dashboard KPIs with industry benchmark reference lines:**

| KPI | Benchmark |
|-----|-----------|
| Pre-check completion rate | 30–60% (email-triggered flows) |
| Check-in time reduction | 2–4 min/guest |
| Room upgrade conversion | 3–8% |
| Early check-in conversion | 10–20% |
| Breakfast package conversion | 8–15% |
| Email open rate | 45–65% (transactional) |
| PMS sync health | < 1% error rate |
| Payment pre-auth success | > 95% |

**Dashboard levels:**
- Property dashboard: all KPIs for a single property
- Portfolio dashboard: aggregated view for multi-property groups
- Platform admin dashboard: all tenants, billing health, PMS sync health

**Compliance and audit reports:**
- Data access logs (exportable for Law 25 DSR responses)
- Consent records per guest
- Communication send/delivery logs
- Billing and usage reports

**Benchmarking roadmap:** Launch with industry benchmarks as reference lines. After 50+ properties, replace with anonymized percentile data from your own network — this creates a retention mechanism (hotels depend on your benchmarking data).

---

## 16. Sandbox and Test Environment

- Dedicated sandbox tenant environment available throughout the customer lifecycle
- **During sales:** prospects connect their PMS test/sandbox credentials and run the full pre-check flow with test reservations before signing
- **During onboarding:** integration testing against real PMS sandbox; no risk to live reservations
- **Post-go-live:** hotel staff can test new upsell rules, template changes, and workflow configurations before pushing to production

Sandbox is logically isolated from production. Data in sandbox is never included in billing usage calculations.

---

## 17. Onboarding Process

**Week-by-week timeline with acceptance criteria:**

| Week | Activities | Acceptance Criteria |
|------|------------|---------------------|
| Week 1 | Collect hotel profile, room count, PMS credentials; initiate API connection; configure sandbox tenant | PMS API connection established; test reservations visible in platform |
| Week 2 | Validate PMS field mapping; configure email/SMS templates; set up upsell catalog; configure branding | At least 5 test reservations processed end-to-end; all upsell categories configured |
| Week 3 | Staff training (GM, Front Desk Supervisor, Revenue Manager); run pilot with real upcoming reservations | All staff roles trained; front desk fallback procedures distributed; 3+ live pre-check completions |
| Week 4 | Go-live confirmation; production API activated; monitoring alerts enabled | Hotel GM sign-off on go-live checklist; first billing period started |

**Ownership:**
- What the hotel must provide: PMS API credentials, payment gateway credentials (if payment enabled), logo/brand assets, upsell catalog content, staff contact list
- What your team provides: PMS connection, template setup, sandbox testing, training materials, go-live support

**Shared tracker:** Use a shared Notion or Airtable onboarding board per hotel — hotel can see progress at each stage.

**Stall handling:** If onboarding stalls due to PMS vendor API access delays (common), pause the onboarding clock, communicate proactively to the hotel, and follow up directly with the PMS vendor. Document known PMS vendor API access lead times per vendor.

---

## 18. Offboarding Process

- Disable tenant access
- Revoke all API keys and integration tokens
- Turn off PMS sync
- Export customer data if contract requires it (Law 25 data portability obligation)
- Apply retention policy per data category (see Section 4)
- Execute deletion policy after retention window expires
- Keep audit evidence of deprovisioning (7-year retention for compliance)
- Confirm deletion in writing to the hotel if requested

---

## 19. Customer Success and Support Model

**Support tiers:**

| Tier | Channel | Response SLA |
|------|---------|-------------|
| Critical (platform down, data breach) | Phone + email | 1 hour |
| High (pre-check flow not working, PMS sync failed) | Email + chat | 4 hours |
| Medium (dashboard issues, template errors) | Email | 1 business day |
| Low (how-to questions, feature requests) | Email + knowledge base | 3 business days |

**First 90 days (high-touch):**
- Named contact for each new hotel (founder or first CS hire)
- Weekly check-in call for first 30 days
- Shared onboarding tracker (see Section 17)
- Proactive monitoring: alert if pre-check completion rate drops > 20% below baseline

**Self-serve resources (build before first hotel goes live):**
- Knowledge base with written guides and video walkthroughs for hotel dashboard, template editing, upsell rule builder, and staff management
- Printed fallback procedures quick reference card (see Section 9)

**Capacity planning:** One CS person can manage 20–30 accounts if the product is stable. Plan headcount based on customer count milestones.

---

## 20. SLA and Uptime Commitments

These must be defined before signing any hotel client contract.

| Commitment | Target |
|------------|--------|
| Platform uptime | 99.9% (< 8.7h downtime/year) |
| RTO (full platform failure) | 4 hours |
| RPO (maximum data loss) | 1 hour |
| Guest flow degraded mode | Available even if backend sync is delayed |
| Planned maintenance window | Communicated 72h in advance; scheduled off-peak (Tuesday 2–4am ET) |

**Service credits:** Define credit schedule for SLA breaches in hotel client contracts (e.g., 10% monthly credit for < 99.5% uptime in a billing month).

**Guest flow degraded mode:** If PMS sync fails, the guest flow must remain accessible using the last known reservation data. Front desk sees a "sync delayed" warning. The guest experience is not interrupted.

---

## 21. Testing Strategy

**Testing pyramid:**

| Layer | Scope | Target Coverage | Tool |
|-------|-------|----------------|------|
| Unit tests | Billing calculations, upsell rule engine, data normalization | 80%+ on business logic | Jest / Vitest |
| Integration tests | PMS connectors, payment gateway adapters, email delivery | All integration adapters | Jest + PMS sandbox |
| E2E tests | Guest pre-check flow, hotel dashboard critical paths | All critical user journeys | Playwright |
| Synthetic monitoring | Guest check-in flow end-to-end against a test reservation | Every 15 minutes in production | Playwright + Azure Monitor |

- Integration tests run against PMS sandbox environments on every merge to main
- E2E tests run on every PR; full suite runs nightly
- Any PMS vendor API change triggers automatic integration test re-run

---

## 22. CI/CD and DevOps

- GitHub Actions or Azure DevOps pipeline from day one
- Environments: development → staging → production
- PR review required before merging to main (minimum 1 reviewer)
- Automated tests run on every PR
- Infrastructure as code: Bicep or Terraform for all Azure resources
- Blue/green or canary deployments for the guest-facing flow — no downtime during releases
- Release process: staging validation and sign-off required before every production deployment
- Rollback procedure defined and tested before pilot launch
- Automated vulnerability scanning on every PR merge (GitHub Advanced Security or OWASP ZAP)

---

## 23. Monitoring, Alerting, and Observability

**Three pillars before production launch:**

1. **Structured logs** — Azure Monitor / Application Insights for all services
2. **Metrics** — Request latency, error rates, PMS sync lag, email delivery rate, pre-check completion funnel drop-offs per step
3. **Distributed traces** — For the PMS integration middleware and payment adapter layer

**Alerting thresholds (PagerDuty or Azure Monitor alerts):**
- PMS sync failure after 2 consecutive retries → High alert
- Email delivery failure rate > 5% → High alert
- Guest flow completion rate drops > 20% below 7-day baseline → Medium alert
- API error rate > 2% for any endpoint → High alert
- Platform response time p95 > 3s → Medium alert

**On-call rotation:** Define before pilot launch. At minimum the founder is on-call. Define escalation path for infrastructure issues.

---

## 24. Go-To-Market and Customer Acquisition

**Ideal Customer Profile (ICP) — Year 1:**
- 30–120 room independent hotels
- Located in Ontario, British Columbia, or Quebec
- Currently using Cloudbeds, Mews, or Maestro PMS
- GM or owner with some technology awareness
- Not currently using a digital pre-check-in product
- Estimated total addressable accounts in this ICP: 500–1,500 properties

**Sales motion:**
1. **Design partners (pre-launch):** 3–5 hotels from founder's professional network; co-development agreement; reduced pricing in exchange for feedback, real PMS sandbox access, and a publishable case study
2. **Association partnerships:** TIAO (Tourism Industry Association of Ontario), Go2HR (BC), AAHOA Canada members, Tourism HR Canada — these provide credibility and referral pipeline
3. **PMS vendor partnerships:** Apply to Cloudbeds and Mews partner/marketplace programs — inbound leads from their customer bases
4. **Direct outbound:** Target list of 300–500 properties in ICP; outbound sequence via email + LinkedIn

**Sales cycle expectations:**
- Warm referrals (professional network): 4–8 weeks
- Cold outbound: 2–4 months
- Association-sourced: 6–10 weeks

**Differentiation to lead with in every sales conversation:**
1. Built for Canada: Canadian data residency, Law 25 compliant, CASL compliant — US competitors are not
2. Bilingual EN/FR: natively supports Quebec properties
3. Upsell engine included: not just check-in — direct revenue impact
4. 7–14 day onboarding: no lengthy IT projects

---

## 25. Post-Stay Workflow *(Phase 4–5)*

- Automatic checkout confirmation email (with receipt if payment was processed)
- Review prompt sent 2–4 hours after checkout:
  - Guest satisfaction score (1–10) captured first
  - Score ≥ 8: route to Google review link (prioritized) or TripAdvisor
  - Score < 8: route to internal feedback form; alert hotel GM; do not route to public review sites
- Optional: loyalty/return visit offer with promo code
- Post-stay data feeds back into upsell performance analytics (was a guest who purchased a breakfast package more likely to leave a positive review?)

---

## 26. Roadmap Items *(Not MVP)*

- **Apple Wallet / Google Wallet passes** — Generate .pkpass or Google Wallet object for check-in confirmation (no NFC hardware required on your side). Increasingly expected at lifestyle hotels.
- **AI-powered upsell personalization** — Use guest history and stay data to rank upsell offers per guest. Deferred post-launch once you have sufficient conversion data.
- **SSO for large hotel groups**
- **Channel manager direct integration** (SiteMinder, RateGain) for properties where channel manager is not the PMS
- **Mobile app** (React Native) — after web app is validated with design partners
- **Sustainability/ESG tracking module** — growing demand from corporate travel accounts

---

## 27. Hiring Plan and Team Requirements

**Minimum team to reach pilot:**

| Role | Responsibility | When Needed |
|------|---------------|------------|
| Full-stack developer (cloud/API experience) | Build core platform, PMS integrations, guest flow | From day one |
| Founder (CS/onboarding lead) | Customer success, onboarding, sales | From day one |
| Canadian privacy/tech lawyer (retainer) | CASL/Law 25/PIPEDA review, contract templates, PIA | Before any Quebec hotel onboarded |

**Phase 2+ hiring (based on customer count):**
- Second developer at 10+ hotels
- Dedicated CS/onboarding person at 20+ hotels
- Part-time bookkeeper/finance at 25+ hotels

---

## 28. Financial Model Requirements

Build a 24-month financial model before committing to development scope or fundraising. Must cover:

- Azure infrastructure cost per tenant (per month, by tier)
- Developer hours to complete one PMS integration (initial + ongoing maintenance)
- Developer hours to onboard one hotel (sandbox setup, template config, go-live support)
- MRR projections at 10 / 25 / 50 / 100 hotels
- Breakeven point (MRR needed to cover operating costs)
- Cash required to reach first 25 paying customers
- Runway analysis for bootstrap vs. seed-funded scenarios
- Unit economics: LTV/CAC by acquisition channel

---

## 29. Delivery Phases

**Phase 1 — Foundation**
Architecture, Azure Canada Central infrastructure, IaC, CI/CD pipeline, multi-tenant security baseline, DBA setup, auth system with hotel staff role taxonomy, billing engine foundation (subscription + metering + Stripe integration), sandbox environment

**Phase 2 — Core Product**
PMS middleware for Cloudbeds (single integration, fully tested), minimum viable guest pre-check web flow (bilingual EN/FR, WCAG 2.1 AA, profile + policies + completion status), hotel dashboard (read-only completion view), communication templates layer with CASL-compliant templates

*Gate: At least one design partner hotel can test with real reservations before Phase 3 begins.*

**Phase 3 — Upsell and Payments**
Upsell engine with visual rule builder, Stripe and Moneris payment integration (hosted payment page model), second PMS integration (Mews), enhanced hotel dashboard (upsell catalog management, completion details), notifications layer

**Phase 4 — Billing and Reporting**
Full billing engine (tier management, overage, invoicing, hotel admin billing dashboard), reporting dashboards with industry benchmarks, post-stay workflow module, Law 25 DSR workflow

**Phase 5 — Hardening and Launch**
Full pen test, security review, SLA validation, pilot rollout with design partners, customer success processes, knowledge base, support runbooks, hotel contract templates finalized

---

## 30. Non-Negotiables for the Developer Team

- Multi-tenant security must be validated in Phase 1 before any hotel data is ingested
- **Billing engine is Phase 1** — cannot sign hotel clients without it
- Canadian data residency (Azure Canada Central) is mandatory — never relax this
- PMS integration layer must be isolated from core app logic
- Payment responsibility boundaries must be clear — hosted payment page only for MVP
- Every sensitive action must be logged (login, data access, config changes, PMS sync events, billing changes)
- Manual fallback must exist and be documented for every hotel failure scenario
- Security, privacy (Law 25, CASL), backup, and recovery are part of MVP — not later phases
- Bilingual (EN/FR) architecture is built into the guest flow from Phase 2 — not added after
- WCAG 2.1 AA compliance is a design and development requirement for the guest web app — not an afterthought
- CASL-compliant templates must be lawyer-reviewed before any live email is sent to a real guest

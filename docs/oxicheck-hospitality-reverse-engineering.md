# Reverse-Engineering an Inspection SaaS for Hospitality
## Practical blueprint for building a hospitality-focused subscription + pay-as-you-go platform

> Prepared: March 31, 2026  
> Scope: Reverse-engineer the likely product/system behind `oxicheck.com` and adapt the model into a hospitality industry SaaS

---

## Important caveat

`oxicheck.com` did not expose a reliably crawlable live product experience during this review, and public search results for "Oxicheck" currently point to an unrelated oxygen-information platform. Because of that, this teardown is based on:

- The visible product pattern common to inspection/quality-control SaaS
- Publicly available competitor signals from products like OrangeQC
- Standard architecture and workflow patterns used by field inspection platforms

That means the sections below are a mix of:

- **Observed**: features visible in public competitor pages
- **Inferred**: the most likely technical/product design behind such a solution

---

## 1. What the original solution most likely is

The solution pattern appears to be a **mobile-first quality inspection and corrective action platform** for operational teams. In plain terms, it replaces paper audits and spreadsheets with:

- digital checklists
- scored inspections
- photos and comments
- issue/ticket creation
- scheduling
- dashboards and reports
- client/team notifications

This kind of product is typically sold to organizations that need recurring inspections across many locations, supervisors, and service teams.

### Core value proposition

- Standardize inspections across sites
- Catch problems before customers do
- Create accountability with proof of work
- Turn inspections into reports, tickets, and trends

---

## 2. Likely user roles

A solution like this usually serves 5 roles:

1. **Admin**
   - creates account structure
   - manages forms, users, permissions, billing

2. **Operations Manager**
   - assigns sites and teams
   - defines service standards
   - monitors scores, trends, SLA breaches

3. **Inspector / Supervisor**
   - completes audits on mobile
   - adds notes, photos, scores
   - opens corrective actions

4. **Frontline Team / Housekeeping / Maintenance**
   - receives tasks
   - resolves issues
   - uploads completion proof

5. **Client / Property Stakeholder**
   - views reports
   - tracks open issues
   - receives branded summaries

---

## 3. Reverse-engineered feature set

### A. Mobile inspections

Most likely capabilities:

- custom forms and templates
- yes/no, pass/fail, score, text, photo, signature fields
- room/area/site selection
- offline data capture
- auto-sync when online
- GPS and timestamp capture

### B. Scheduling and assignments

- recurring audits by property, floor, zone, or room type
- assignee-specific task lists
- due dates and overdue logic
- shift or route planning

### C. Corrective action workflow

- convert failed line item into ticket
- assign owner and due date
- attach photo evidence
- notify relevant team
- mark resolved / reopened / verified

### D. Dashboards and reporting

- score by site, inspector, category, timeframe
- open vs closed issues
- trend lines for recurring failures
- exportable PDF or CSV reports
- branded reports for customers or management

### E. Communication

- email or in-app alerts
- reminders for overdue actions
- summary notifications after audits

### F. Multi-site administration

- organization -> region -> property -> building -> floor -> zone hierarchy
- role-based access control
- white-label or branded portal

---

## 4. Likely system architecture behind the product

This is the most probable architecture for a modern version of the solution.

### Frontend

- **Web admin app** for setup, dashboards, reporting, billing
- **Mobile app** for inspections and ticket resolution

Best-fit stack:

- Web: `Next.js` or `React`
- Mobile: `React Native` or `Flutter`
- Design system: reusable form components + reporting widgets

### Backend

- REST or GraphQL API
- authentication + RBAC
- workflow engine for forms, schedules, and ticket states
- reporting service
- notification service

Best-fit stack:

- `Node.js` with `NestJS` or `Express`
- or `Python` with `FastAPI`

### Database

- `PostgreSQL` for core relational data
- `Redis` for queues/caching
- object storage for images and report assets

### Infrastructure

- `AWS` or `Azure`
- `S3`/Blob storage for photos and PDFs
- message queue for notifications/report generation
- background jobs for recurring schedules, reminders, exports

### Integrations

- email provider
- SMS/WhatsApp optional
- PMS / CMMS / workforce tools
- BI connectors
- SSO for larger operators

---

## 5. Reverse-engineered core data model

The likely minimum entities are:

- `organizations`
- `properties`
- `areas`
- `rooms`
- `users`
- `roles`
- `inspection_templates`
- `template_sections`
- `template_items`
- `inspection_schedules`
- `inspection_runs`
- `inspection_answers`
- `attachments`
- `scores`
- `issues`
- `issue_comments`
- `issue_status_history`
- `notifications`
- `audit_logs`
- `subscriptions`
- `usage_events`

### Relationship logic

- One organization has many properties
- One property has many areas/rooms
- One template can be reused across many properties
- One inspection run belongs to one property and one assignee
- One failed inspection item can create one or more issues
- Usage events feed billing and analytics

---

## 6. How to adapt this into a hospitality product

For hospitality, the winning move is not just "inspection software for hotels." It should become an **operations quality layer** across housekeeping, rooms, maintenance, public areas, food safety, and brand standards.

### Hospitality-specific use cases

1. **Room inspection**
   - post-clean room checks
   - stayover quality checks
   - VIP arrival readiness
   - out-of-order verification

2. **Housekeeping QA**
   - bathroom, linen, minibar, amenities, dust, odor checks
   - room attendant scorecards
   - floor supervisor rounds

3. **Maintenance**
   - HVAC, lighting, plumbing, locks, TV, Wi-Fi issues
   - preventive inspection routes
   - room down / room back workflows

4. **Public area inspections**
   - lobby, elevators, gym, pool, washrooms, corridors

5. **Food and beverage compliance**
   - opening and closing checklists
   - HACCP temperature logs
   - sanitation checks

6. **Brand and management audits**
   - SOP compliance
   - franchise standard audits
   - mystery-shop style scoring

7. **Guest recovery**
   - convert operational failure into service recovery task
   - track complaint source, root cause, resolution time

---

## 7. Recommended hospitality product positioning

### Product concept

**A hotel operations quality platform** that helps operators inspect rooms, detect service failures, assign corrective actions, and prove property standards in real time.

### Best target customers

- independent hotels
- boutique hotel groups
- serviced apartments
- resorts
- limited-service hotel chains
- third-party hotel management companies

### Why hospitality will buy

- reduce guest complaints
- speed room turnaround
- improve housekeeping consistency
- reduce room downtime
- create documentation for ownership/brand audits
- improve training and accountability

---

## 8. Recommended feature set for Version 1

Build the first version around 4 tightly connected modules.

### Module 1: Inspections

- mobile room and area inspections
- customizable hotel templates
- pass/fail + weighted scoring
- photo proof
- offline mode

### Module 2: Corrective actions

- create maintenance or housekeeping issue from failed item
- assign to person/team
- due date + priority + SLA
- completion proof photo

### Module 3: Dashboard and reports

- room quality score by property/floor/attendant
- recurring failure hotspots
- open issues by aging
- executive daily report

### Module 4: Billing and account management

- subscription plan management
- usage tracking
- invoice history
- add-on purchases

---

## 9. Subscription + pay-as-you-go pricing model

This is where the hospitality adaptation becomes stronger than the original model.

### Recommended hybrid pricing

Charge a **base subscription** for platform access and then layer **usage-based billing** on operational volume.

### Why hybrid beats flat SaaS pricing

- hotels vary dramatically by room count and inspection volume
- seasonal properties dislike high fixed commitments
- management companies want predictable base pricing with scalable usage
- pay-as-you-go works well for temporary staffing surges and peak season

### Proposed pricing structure

#### Plan A: Starter

- CAD $99/month per property
- includes:
  - 3 users
  - 300 inspections/month
  - 100 issue tickets/month
  - 3 standard templates

Overages:

- CAD $0.20 per extra inspection
- CAD $0.35 per extra ticket

#### Plan B: Growth

- CAD $249/month per property
- includes:
  - 10 users
  - 1,500 inspections/month
  - 500 issue tickets/month
  - advanced dashboards
  - branded reports

Overages:

- CAD $0.12 per extra inspection
- CAD $0.20 per extra ticket

#### Plan C: Group / Enterprise

- CAD $599+/month for first property group
- centralized admin
- portfolio dashboards
- SSO
- API access
- PMS integration
- custom SLA

Usage options:

- volume commit or pure metered usage

### Optional pay-as-you-go only model

For very small operators:

- CAD $0 base
- CAD $0.45 per inspection
- CAD $0.60 per ticket
- CAD $15 per active user/month
- report exports charged in bundles or included after threshold

This can be powerful as a self-serve acquisition path, but margins are better with a base subscription.

### Best commercial model

The strongest offer is:

- **Low base subscription**
- **metered operational usage**
- **premium add-ons**

Add-ons:

- PMS integration
- multilingual forms
- advanced analytics
- AI summaries
- WhatsApp/SMS notifications
- white-label branding

---

## 10. Hospitality workflows that should be unique

To avoid becoming a generic inspection app, add hospitality-native workflows.

### A. Room-ready workflow

- housekeeping marks room cleaned
- supervisor inspects
- failed item creates rework task
- room status updated when passed

### B. Guest complaint workflow

- complaint logged from front desk or guest messaging
- issue routed to housekeeping or engineering
- timer starts
- manager verifies resolution

### C. Preventive maintenance workflow

- recurring room asset checks
- issues tagged by asset type
- repeat asset failures surfaced by room number/vendor/model

### D. Executive morning brief

- rooms inspected yesterday
- fail rate by floor
- top recurring defects
- rooms blocked by unresolved issue
- average resolution time

---

## 11. AI features worth adding after MVP

Do not start with too much AI. Add it where it clearly saves labor.

### High-value AI additions

- summarize inspection issues by shift or property
- auto-generate GM daily brief
- suggest root causes from repeated failure patterns
- recommend template items based on property type
- classify photo evidence
- draft guest recovery notes from issue logs

### AI features to avoid early

- generic chatbot with no operational context
- speculative predictive maintenance without enough data
- free-text-only inspection flow

---

## 12. Technical architecture for the hospitality version

### Recommended stack

- Web: `Next.js`
- Mobile: `React Native`
- API: `NestJS`
- DB: `PostgreSQL`
- Queue: `BullMQ` + `Redis`
- Storage: `S3`
- Auth: `Clerk`, `Auth0`, or custom JWT
- Billing: `Stripe`
- Analytics: `PostHog` + warehouse later

### Service boundaries

1. **Identity service**
   - auth
   - RBAC
   - org/property membership

2. **Inspection service**
   - templates
   - schedules
   - runs
   - answers
   - scoring

3. **Issue service**
   - tickets
   - assignment
   - SLA logic
   - resolution states

4. **Reporting service**
   - dashboards
   - PDFs
   - exports
   - portfolio summaries

5. **Billing service**
   - plans
   - metering
   - usage aggregation
   - invoices

6. **Integration service**
   - PMS connectors
   - webhook handling
   - external sync jobs

### Integration priorities for hospitality

Priority order:

1. `Cloudbeds`
2. `Mews`
3. `WebRezPro`
4. `Maestro`
5. `Opera` for larger groups later

The main reason to integrate PMS is to pull:

- room status
- housekeeping status
- occupancy context
- arrivals / departures
- out-of-order rooms

---

## 13. MVP build plan

### Phase 1: 8-12 weeks

Build:

- multi-property account model
- inspection template builder
- mobile room inspection flow
- issue creation from failed items
- dashboard with core KPIs
- Stripe subscription billing
- usage metering

### Phase 2: 6-8 weeks

Build:

- recurring schedules
- branded PDF reports
- SLA timers
- role-specific views
- portfolio reporting

### Phase 3: 8-12 weeks

Build:

- PMS integration
- guest complaint workflows
- AI summaries
- multilingual support

---

## 14. Suggested database entities for billing

Because pay-as-you-go is central, billing must be designed from day one.

Add these entities:

- `plans`
- `subscriptions`
- `subscription_items`
- `usage_meters`
- `usage_events`
- `billing_periods`
- `invoices`
- `invoice_line_items`
- `credit_balances`
- `overage_rules`

### Metering events to track

- inspections submitted
- issue tickets created
- active users
- report exports
- SMS/WhatsApp notifications sent
- PMS sync volume if needed

---

## 15. Risks and how to avoid them

### Risk 1: Becoming too generic

If the product looks like a general form app, hotels will not pay premium pricing.

Avoid by:

- shipping hotel-specific templates
- room-status workflows
- housekeeping and engineering use cases first

### Risk 2: Billing complexity

Usage billing can become messy if not event-driven.

Avoid by:

- storing immutable usage events
- aggregating per billing period
- keeping billing metrics very simple in V1

### Risk 3: Too much configuration

Inspection products often become bloated and slow to implement.

Avoid by:

- starting with opinionated hotel templates
- limiting custom field types at launch
- using default scoring models

### Risk 4: Weak mobile UX

If supervisors cannot complete inspections quickly, adoption fails.

Avoid by:

- designing for one-hand use
- minimizing taps
- supporting offline first
- making photo capture frictionless

---

## 16. Best wedge into the market

The best initial wedge is:

**Housekeeping quality assurance + room-ready inspections for independent and boutique hotels**

Why this wedge works:

- very frequent operational pain
- visible impact on guest satisfaction
- measurable ROI
- easy to explain
- easy to pilot in one property
- expands naturally into maintenance and public area audits

---

## 17. Go-to-market motion

### Best first customers

- 30-150 room independent hotels
- 2-20 property boutique groups
- third-party hotel operators

### Best sales angle

Sell outcomes, not software:

- fewer guest complaints
- faster room release
- fewer missed maintenance issues
- documented quality for owners and brands

### Land-and-expand path

1. Start with one property
2. Roll out housekeeping inspections
3. Add maintenance ticketing
4. Add executive reporting
5. Expand across portfolio

---

## 18. Final recommendation

The right move is **not** to clone a generic inspection app exactly.

The better business is to build a **hospitality operations quality platform** with:

- mobile inspections
- corrective actions
- hotel-native workflows
- portfolio reporting
- hybrid subscription + pay-as-you-go billing

### Recommended commercial offer

- Base subscription per property
- Metered usage for inspections/tickets
- Premium add-ons for PMS integration, analytics, and AI

### Recommended MVP thesis

If you can help a hotel answer these 4 questions every day, you have a strong product:

1. Which rooms or areas failed quality today?
2. Who owns the fix?
3. How long has it been open?
4. What patterns are hurting guest experience most?

---

## 19. If building this now, the exact V1 I would launch

### Product name direction

- RoomReady
- StayCheck
- HousePulse
- RoomOps

### V1 package

- Mobile housekeeping inspections
- Room and public area audit templates
- Corrective action ticketing
- Daily manager report
- Stripe billing with included usage + overages

### Launch pricing

- CAD $99/property/month
- includes 300 inspections
- CAD $0.20 per extra inspection
- CAD $29/month maintenance workflow add-on
- CAD $79/month PMS integration add-on

This is simple enough to sell, simple enough to bill, and narrow enough to implement quickly.

---

## 20. Founder Notes Applied: Better Approach

Your meeting notes materially improve the strategy because they show this was not just an inspection platform. It was closer to a **guest pre-check-in and upsell middleware SaaS** connected to hotel PMS systems.

That changes the recommended approach.

### What the founder notes reveal

Based on your notes, the original solution likely had these defining traits:

- self-funded with early Microsoft support
- Azure-hosted backend with DBA and security support
- no on-premise hardware
- PMS integration through an API middleware layer
- guest-facing pre-check email sent around 48 hours before arrival
- web app used by the hotel team to manage workflows
- 3 check-in or pre-check workflows
- built-in upsell opportunities before and during arrival
- emphasis on queue reduction at the front desk
- sustainability value through less paper and printing

This means the strongest hospitality version is not:

- only room inspections

It is:

- **a guest journey operations platform combining pre-check-in, front-desk acceleration, upsell, and hotel workflow automation**

---

## 21. Revised Product Positioning

### Best positioning statement

**A SaaS pre-arrival and check-in acceleration platform for hotels that connects to any PMS, reduces front-desk queue time, increases upsell revenue, and digitizes arrival workflows without new hardware.**

This is a much better commercial story than a generic QA platform because it directly touches:

- guest experience
- revenue uplift
- operational speed
- paper reduction

### Why this positioning is stronger

- easier ROI story for hotel owners
- easier demo narrative
- easier integration wedge
- more obvious annual subscription value
- upsell revenue can subsidize software cost

---

## 22. Recommended Core Product Model

The adapted solution should have 4 connected layers.

### Layer 1: PMS integration layer

- hotel PMS API connects to your middleware
- middleware normalizes reservation and guest data
- your platform exposes a unified internal API to the app

This matches your note:

- PMS API data goes to OXICHECK API
- API middleware sits between hotel systems and the product

### Layer 2: Guest pre-check-in flow

- automated pre-check email 48 hours before arrival
- guest opens branded web flow
- confirms details
- fills required fields
- accepts policies
- optionally enters arrival info
- optionally pays or authorizes payment depending on hotel setup
- sees personalized upsell offers

### Layer 3: Hotel operations console

- team dashboard for arrivals
- pre-check completion status
- missing documents or steps
- workflow exceptions
- front-desk readiness status
- upsell conversion dashboard

### Layer 4: Revenue and intelligence layer

- upsell catalog and conversion tracking
- reporting on queue reduction
- digital completion rates
- guest segmentation
- repeat guest personalization

---

## 23. Better MVP Scope

Your notes suggest the MVP should be narrower and more commercial than a broad operations platform.

### Recommended MVP

Build an MVP around:

1. PMS integration middleware
2. 48-hour pre-check email
3. guest self-check web app
4. hotel operations dashboard
5. upsell engine
6. annual subscription billing

### What the MVP should do

- pull arrival reservations from PMS
- trigger pre-check email automatically 48 hours before arrival
- allow guest to complete pre-arrival steps
- surface completion status to the hotel
- push the relevant data back through middleware or expose it for hotel workflow use
- offer breakfast, spa, pickup, room upgrades, and extras

### What to avoid in MVP

- deep AI assistant features
- too many PMS integrations at once
- advanced mobile apps before web flow proves conversion
- complicated payment orchestration across many gateway scenarios

---

## 24. Best Workflow Design

Your notes mention 3 checking workflows. The best way to productize that is:

### Workflow 1: Pre-check completed

- guest receives email
- completes all required steps online
- front desk sees guest as ready
- arrival time at desk is minimized

### Workflow 2: Pre-check partial

- guest starts but does not finish
- reminder sent
- hotel dashboard flags missing items
- team completes the rest at arrival

### Workflow 3: No pre-check

- guest ignores email
- standard check-in remains available
- front desk still uses the platform dashboard

This gives hotels a safe rollout path with no operational risk.

---

## 25. Upsell Strategy

The founder notes make upsell a core value driver, not an add-on.

### Best upsell categories

- breakfast
- airport pickup
- spa
- early check-in
- late checkout
- room upgrade
- parking
- celebration package

### Why upsell matters commercially

If the hotel can generate incremental revenue before arrival, software cost becomes easier to justify.

Your examples are exactly the right framing:

- breakfast at CAD/USD 25-50
- spa upsells
- pickup at 15
- room upgrades at 100

### Better ROI framing

Do not sell only on software efficiency.

Sell on combined value:

- faster check-in
- fewer queues
- more upsell revenue
- less paper and printing
- better guest satisfaction

### Recommended ROI formula

Annual platform value =

- front-desk time saved
- print and paper cost reduced
- added upsell revenue
- improved guest satisfaction / conversion impact

The strongest sales hook is often:

- one upsell campaign can pay for the annual subscription

---

## 26. Security and Compliance Approach

Your notes show security was part of the early trust model.

### Recommended security story

- Azure-hosted SaaS
- Azure-managed database
- encrypted data in transit and at rest
- privacy agreement and cloud security commitments from day one
- strict role-based access
- auditable API access
- clear offboarding controls

### Better enterprise-ready wording

Instead of saying only "DBA on Azure," position it as:

- **Microsoft Azure-hosted architecture with managed database, access control, and documented privacy handling**

This sounds more credible in hotel procurement.

### Offboarding process

Your note suggests:

- Microsoft DBA-controlled access
- API turned off on termination

For a stronger SaaS posture, define offboarding as:

- tenant disabled
- API keys revoked
- data export offered
- retention period applied
- deletion policy executed per contract

That is more complete and easier to defend contractually.

---

## 27. Onboarding Model

Your notes provide a very usable onboarding process.

### Recommended onboarding journey

1. Hotel confirms room count, PMS, and API availability
2. Your team configures property profile
3. PMS API connection is mapped into middleware
4. Pre-check templates and upsell catalog are configured
5. Test reservations are validated
6. Hotel signs off on go-live
7. Production API is activated

### Recommended onboarding timeline

Your note says roughly 7 to 14 days for live API, which is excellent positioning.

Sell it as:

- **Typical onboarding: 7-14 days depending on PMS readiness**

That is a strong commercial promise for independent hotels.

---

## 28. Payment Strategy

Your meeting notes show this area needs to stay flexible.

### Best payment options

1. Guest pays hotel directly on-site
2. Hotel uses its own payment gateway
3. Platform passes payment intent into hotel-approved flow

### Best MVP decision

Do not become a merchant-of-record in V1.

Instead:

- let the hotel remain the payment owner
- integrate with hotel gateway where possible
- keep payment optional in early versions

This reduces legal, PCI, and operational complexity.

---

## 29. Best Pricing Model Based on the Founder Notes

The founder notes mention annual subscription and MVP pricing. That fits the product very well.

### Recommended pricing model

Use:

- annual SaaS subscription
- tiering by room count
- optional setup fee
- optional integration fee for difficult PMS cases
- optional revenue-share or premium fee on upsell module later

### Suggested commercial packaging

#### Essential

- annual subscription
- pre-check web app
- email automation
- dashboard
- basic upsells

#### Professional

- includes richer upsells
- branded flows
- advanced reporting
- more workflow rules

#### Enterprise / Group

- multi-property management
- custom PMS work
- portfolio reporting
- SLA

### Alternative monetization option

If upsell conversion is strong, you could also test:

- low annual base fee
- plus percentage of upsell revenue generated

But for MVP, fixed annual pricing is easier to sell and support.

---

## 30. AI Direction

Your note about AI is useful, but it should be scoped carefully.

### Best AI use cases

- personalize pre-arrival messaging for repeat guests
- suggest relevant upsells based on stay pattern
- detect repeat client preferences
- automate response tone and language
- support loyalty or affiliate-style recommendation logic

### Best way to phrase it

Do not lead with generic AI.

Lead with:

- **personalized pre-arrival conversations and smarter upsell recommendations for repeat guests**

That is more concrete and commercially meaningful.

### AI should come after workflow stability

First make sure:

- PMS data is clean
- pre-check completion works
- upsell catalog performs

Then add AI-driven personalization.

---

## 31. Stronger Final Recommendation

Using your founder notes, the better approach is:

### Build this as a hospitality guest-arrival SaaS, not an inspection clone

The winning product should be:

- PMS-connected
- Azure-hosted
- self-serve for guests
- web-based for hotel teams
- focused on pre-check-in acceleration
- designed to drive upsell revenue
- sold on annual subscription

### Best one-sentence strategy

**Create a no-hardware hotel SaaS that connects to any PMS, sends a 48-hour pre-arrival digital check-in, reduces front-desk queues, and increases ancillary revenue through personalized upsells.**

### Best MVP business case

The hotel buys because it gets:

- faster arrivals
- less manual front-desk work
- lower paper use
- better guest experience
- new upsell revenue

### Best implementation sequence

1. One PMS integration first
2. Middleware API
3. 48-hour pre-check email and web flow
4. hotel dashboard
5. breakfast / pickup / upgrade upsells
6. annual subscription packaging
7. AI personalization later


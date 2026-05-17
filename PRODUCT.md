# Product

## Register

product

## Users

Three distinct roles, each in a different physical context:

- **Students** — university students, primarily on mobile, on-the-go when they spot a broken fixture (cracked light, leaking tap, dead Wi-Fi). Need a fast submission flow, clear confirmation that the report landed, and easy status tracking without having to open a laptop.
- **Staff / Technicians** — at a desk, managing an incoming queue of assigned issues. Need efficient triage, status updates, and history access. Density matters; they scan many items per session.
- **Admin** — at a desk, overseeing the whole system. Analytics, user management, ticket overview. Needs summary data and control actions, not granular task detail.

## Product Purpose

A campus maintenance issue-reporting and resolution platform for universities. Students report problems (electrical, plumbing, Wi-Fi, etc.), technicians resolve them, admins oversee the pipeline. Success looks like: a student reports an issue in under 60 seconds, gets a clear status trail, and the issue reaches a technician without manual follow-up.

## Brand Personality

Calm, reliable, civic. The interface should feel like a well-run public service: trustworthy and official without being bureaucratic or cold. Confidence that something is being handled, not anxiety about whether the report went through.

Voice: plain, direct, no jargon. Functional copy that respects the user's time.

## References

- **Zomato / Swiggy order tracking** — clear progressive status flow, one dominant state visible at a glance, no noise around it.
- **Government service portals (functional ones)** — structured, legible, serious without being intimidating.

## Anti-references

- Social media apps: no algorithmic feeds, no engagement metrics, no infinite scroll.
- Gaming UIs: no neon accents, no particle effects, no dramatic dark theatrics.
- SaaS marketing dashboards: no hero-metric templates, no gradient-filled stat cards.

## Design Principles

1. **Status clarity above all.** Every screen tells the user exactly where their issue stands. One dominant state, no ambiguity. Students should never wonder "did it go through?"

2. **Mobile-first, outdoor-legible.** Students submit on-the-go in direct sunlight. Contrast, touch targets, and scan-ability take priority over visual sophistication. If it's hard to read outside, it's wrong.

3. **Role-appropriate density.** Students need simplicity and reassurance. Staff need information density and workflow efficiency. Admin needs overview and control. Don't flatten all three into one generic screen pattern.

4. **Official without bureaucratic grey.** Civic reliability doesn't mean cold or clinical. The interface can be warm and clear without becoming casual or playful.

5. **Trust through visible outcomes.** Every action produces a visible, legible result. No silent submissions. No ambiguous loading states. No mystery about what happens next.

## Accessibility & Inclusion

- WCAG AA as the minimum across all role surfaces.
- Outdoor sunlight legibility: aim for contrast ratios that comfortably exceed AA minimums (target AAA on body text where feasible), since students use this on mobile in bright conditions.
- Touch targets: minimum 44x44px for all interactive elements on student-facing surfaces.
- Reduced motion: respect `prefers-reduced-motion` (already partially implemented in CSS).
- Color-blind accommodation: never use color alone to convey ticket status; pair with a label, icon, or pattern.

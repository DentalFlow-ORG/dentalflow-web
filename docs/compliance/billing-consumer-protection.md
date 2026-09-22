# Billing transparency — current behavior and review checklist

Reviewed 2026-09-20. Technical facts below do not determine consumer-law applicability, refund rights or legal compliance; approve terms with qualified review for the actual commercial offer.

Current flow: seven-day local trial without creating a paid Stripe subscription; OWNER starts checkout or manages portal; selected plan/interval validated server-side; sync checks clinic ownership; plan changes request prorations; cancellation schedules paid-period end. Past-due access is blocked. [RN-013](../requirements/business-rules.md) is the canonical rule.

Known discrepancies: static public promotional amounts vs expired backend default campaign; configured scarcity counters are not live uptake; support/custom-domain flags do not prove fulfillment; Professional dictation quota conflicts with Premium endpoint gate; WhatsApp fallback limits and delivery accounting need clear customer wording. Full matrix/proposal: [product decisions](../product/decisions.md).

- [ ] Match displayed monthly/annual amounts and discount basis with actual Stripe price IDs/coupons.
- [ ] State trial duration, first paid action, renewal, cancellation, proration and failed-payment access clearly.
- [ ] Define downgrade-over-limit behavior without silently deleting users or clinical data.
- [ ] Publish real support, complaint and legally reviewed refund processes.
- [ ] Verify checkout return, duplicate events, portal changes/cancel and failed-payment recovery in Stripe test mode.
- [ ] Confirm provider customer emails; no custom renewal/cancellation mail scheduler was verified in DentalFlow.
- [ ] Protect raw Stripe event/customer metadata with access and retention controls.

Do not interpret a mocked Stripe test as a provider transaction. Execute [the backend checklist](../../../dentalflow-api/AGENTS.md#9-stripe) for billing behavior changes. No price, coupon, refund policy or plan entitlement was changed in this audit.

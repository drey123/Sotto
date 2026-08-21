# Outbid.lol reverse-engineering notes

This directory records a clean-room analysis of the publicly observable behavior and architecture of outbid.lol. It does **not** copy proprietary source code, private backend code, credentials, or payment logic.

## What the public site does

Outbid is a pay-to-rank public leaderboard. A submitted product URL or X handle is placed according to the amount paid. A higher bid takes a higher rank; the caller does not need an account. The site currently exposes the leaderboard, live activity, trending listings, click counts, and a simple outbid flow.

Observed rules:

- New bids use whole dollars with a published minimum.
- A bid determines rank.
- Existing listings can be raised by submitting the same URL/handle again.
- The site exposes the current amount needed to claim a rank.
- Equal bids are ordered by placement time.
- Tracking query strings are stripped from listing URLs.
- Some platform links are keyed by their path.
- The site rejects chat/invite links and certain content categories.
- Clicks are redirected to the submitted destination.

## Publicly observable stack clues

The site footer says it is brought to you by supastarter.dev. Supastarter's current public documentation describes a Next.js/React/TypeScript/Tailwind full-stack starter with a backend/API layer, database support, payments, analytics, and monitoring. This is a strong clue about the starting architecture, but it is not proof of every implementation detail in Outbid.

Public site behavior and current public documentation also indicate:

- A hosted web application rather than a static page.
- Persistent listing/rank data.
- Payment confirmation as the event that claims a rank.
- Analytics for visitors and outbound clicks.
- Error monitoring.
- Rate limiting/abuse controls.

Do not treat third-party clone privacy pages as authoritative evidence of Outbid's private implementation.

## Likely request/data model

A minimal implementation needs roughly:

```text
listing
  id
  normalized_target
  display_target
  title
  description
  bid_amount
  created_at
  updated_at
  click_count / click events

payment
  checkout/order reference
  listing reference
  amount
  status
  applied_at

ranking
  derived from bid_amount + tie-break ordering
```

The important architectural insight is that the leaderboard itself is almost trivial. The hard parts are the edges around it:

```text
submit target
    -> normalize/validate target
    -> create checkout
    -> payment webhook
    -> atomically apply bid
    -> recompute rank
    -> publish/update board
    -> redirect clicks + measure traffic
```

## Concurrency lesson

The critical operation is not the UI. It is the payment-to-rank transition.

Two people can attempt to claim/raise the same rank at nearly the same time. The backend therefore needs an atomic/transactional write so a payment webhook cannot silently overwrite a newer bid or apply the same payment twice.

A good implementation should make the payment event idempotent and make the bid update conditional/transactional.

## What is worth learning for Sotto

The useful lesson is not the visual design. It is how much product can be created from a tiny deterministic core plus a few carefully designed edges.

Outbid's apparent complexity is mostly:

1. one core state model;
2. one ranking function;
3. one payment state transition;
4. one redirect/analytics path;
5. a very small public UI.

This is exactly the kind of architecture worth studying when hunting for small products: **tiny core + strong feedback loop + immediate monetization + public state.**

## What we should NOT copy blindly

- The exact UI/code.
- Proprietary source from a commercial starter kit.
- Private API endpoints or backend implementation.
- Payment/webhook secrets or credentials.
- The exact branding or copy.

Instead, if we build an experiment from the idea, implement the behavior independently and improve the mechanism.

## Current research questions

- What makes the pay-to-rank loop viral rather than merely functional?
- Which part is actually valuable: traffic, public status, competition, novelty, or social proof?
- Can the same mechanic create a durable product rather than a short-lived viral event?
- What is the smallest backend needed to make the loop trustworthy?
- What variants create recurring demand without turning into a generic ad marketplace?
- Which parts of the system can be made substantially better than the original?

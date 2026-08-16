# Sotto

## Status

Early product/research stage. This document is a living source of truth for the current direction; experiments and research may change it.

## Core idea

Sotto is an anonymous confession/discovery platform.

People can leave secrets or confessions anonymously. Other people discover them, select them, read them, react to them, and may eventually pay for optional access to content or experiences that have demonstrated value.

The unusual part is the presentation: instead of treating the product as a conventional vertical feed, Sotto explores a spatial 3D environment containing distinct content objects. The 3D environment is a presentation/discovery layer; the confession, reading, reaction and access loop remains the core product.

## Current user loop

1. Enter Sotto.
2. Contribute a confession/secret.
3. Enter the discovery environment.
4. Encounter/select a confession object.
5. Transition into its focused reading state.
6. Read the available content, including progressive/blurred reveal where appropriate.
7. React to the content.
8. Continue discovering.
9. Optional paid access can unlock content or an additional layer when the value proposition is clear.

This loop is a hypothesis, not a claim that a particular psychological mechanism will guarantee retention.

## Product principles

- The experience should feel extremely modern, polished and frictionless.
- Discovery should retain an element of unpredictability.
- The interface should be simple even when the underlying system is sophisticated.
- Progressive disclosure should reduce visual weight without unnecessarily removing information.
- The reading experience is more important than decorative 3D complexity.
- The spatial environment should support discovery rather than become a conventional game unless later research proves otherwise.
- Privacy is a core product property, not a marketing add-on.
- Avoid collecting identity information that is not necessary for the product.
- Aggregate behavioural analytics may be useful for improving discovery, but individual surveillance is not the objective.
- Do not assume psychological effects are guaranteed. Test them.
- Do not add architecture until the problem proves that the complexity is necessary.

## Privacy direction

The intended direction is anonymous participation without requiring email, password or phone-number accounts for ordinary use. Client-generated secrets/keys may be used for user-controlled access to submitted content.

The system should minimize retained network, device and content metadata. Uploaded media should be processed to remove unnecessary metadata before permanent storage where technically appropriate.

If end-to-end encryption is used, the exact consequences for moderation, search, ranking, analytics and payments must be documented before implementation. A payment processor may necessarily receive transaction information; payment privacy and confession anonymity are separate concerns.

## What we are not deciding yet

- Exact monetization mechanism.
- Exact discovery/navigation interaction.
- Exact 3D world geometry.
- Whether every user must contribute before browsing or whether contribution unlocks deeper functionality.
- Exact ranking algorithm.
- Exact media limits.
- Final brand identity beyond the working name Sotto.

## Research philosophy

Sotto follows the Random Thinking methodology: inspect existing open-source implementations, extract useful primitives, challenge conventional architecture, recombine ideas, build the smallest useful experiment, benchmark it, and only then expand the system.

We are specifically using `cortiz2894/stylized-components` as one source of reusable 3D/rendering primitives rather than treating it as the product architecture.

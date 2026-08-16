# Sotto Design System & UX Constitution

## Purpose

This document defines the design rules for Sotto. It is intentionally a living document. Values may change after visual research, prototypes and user testing.

The goal is not to make the interface merely “modern.” The goal is to make every interaction feel deliberate, quiet, tactile, fast and exceptionally polished.

## Design north star

**Monochrome, metallic, spatial, restrained.**

The interface should feel closer to a finely engineered physical object than a conventional social-media website.

Avoid visual noise, gratuitous gradients, excessive glassmorphism, generic dashboard styling and animation that exists only to demonstrate animation.

## Visual hierarchy

The product has two visual layers:

1. **Environment** — 3D spatial surroundings and discovery objects.
2. **Content UI** — the 2D reading and interaction interface.

The environment is **not currently defined as black, dark, light, realistic, abstract, architectural, natural, or any other specific setting**. That choice must come from visual research and prototypes.

The content UI has the stronger current visual direction: monochrome/metallic, refined and tactile. This does **not** mean the surrounding environment must use the same palette.

The environment should provide spatial context and discovery while keeping content legible. Content takes priority whenever the user is reading.

## Color direction

### Content UI / card direction

Primary working palette:

- near-black
- black
- graphite
- dark metallic grey
- silver/white typography
- restrained cool blue as an accent/material response

Blue should feel like a metallic reflection or state transition rather than a permanently saturated UI color.

These are directions for the card/content interface, **not a decision for the entire 3D environment**.

Use semantic design tokens rather than scattered raw color values. This follows the useful principle in shadcn/ui's current styling guidance: semantic tokens make themes and states consistent. urlshadcn styling guidancehttps://github.com/shadcn-ui/ui/blob/main/skills/shadcn/rules/styling.md

### Environment

No final palette has been selected. Research should explore how different environments affect:

- card visibility
- spatial depth
- atmosphere
- perceived quality
- navigation
- reading transitions
- visual fatigue

## Typography

Typography must prioritize reading comfort over spectacle.

Rules:

- establish a small, deliberate type scale
- avoid unnecessary font variation
- use weight to establish hierarchy before introducing additional colors
- keep line lengths comfortable in reading mode
- never sacrifice legibility for the monochrome aesthetic

The final typeface choices should be researched and tested rather than selected arbitrarily.

## Spacing

Use a consistent spacing scale and design tokens. Components should not invent arbitrary spacing values.

Initial design scale to test:

`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96`

This is a starting hypothesis, not a permanent rule. The actual card geometry and spatial composition should determine which values survive.

## Geometry

The rectangular confession object is a primary visual primitive.

It should have:

- controlled proportions
- subtle depth
- carefully tuned edge treatment
- restrained radius where appropriate
- believable lighting
- clear selected/focused states

The 3D object should still read as a coherent object when viewed from an angle.

## Metallic treatment

Metal should be produced through controlled lighting, gradients/reflections and material response rather than simply applying a grey gradient.

Blue may travel across a surface as a moving reflection or state change.

Avoid permanent glowing neon edges unless an experiment demonstrates that they improve comprehension or interaction.

## Motion

Motion should communicate state and spatial continuity.

Important transitions:

- object hover/focus
- object selection
- environment → reading state
- reading expansion
- progressive reveal
- reaction feedback
- closing/returning to environment

Motion should generally use spring/physics-like easing where appropriate rather than arbitrary linear movement.

Motion is a functional part of the interface: it should tell the user what changed and where the content went.

Motion's official React library provides springs, gestures, layout transitions and scroll-linked effects; it is a candidate implementation source, not a mandatory dependency. urlMotion for Reacthttps://github.com/motiondivision/motion

## Existing open-source design knowledge to study

### shadcn/ui

Useful for:

- semantic tokens
- component composition
- spacing discipline
- accessible primitives
- copy-owned component code

It is open source/open code and its current repository contains explicit styling rules around semantic colors, spacing and component composition. urlshadcn/uihttps://github.com/shadcn-ui/ui

### Motion

Useful for:

- springs
- layout transitions
- gesture interactions
- enter/exit transitions
- scroll-linked effects

It is a candidate source for motion primitives rather than a reason to add an animation dependency everywhere. urlMotionhttps://github.com/motiondivision/motion

### Aceternity UI

Useful ideas worth studying:

- 3D card interaction
- cursor-following spotlight
- moving borders
- shimmer
- copy-owned animation components

Its copy-paste approach is particularly relevant to this project because it lets us inspect and modify the implementation rather than accepting a large opaque dependency. We should selectively borrow techniques rather than adopting its visual language wholesale. urlAceternity UI source/skill referencehttps://github.com/TerminalSkills/skills/blob/main/skills/aceternity-ui/SKILL.md

### Material Web

Useful concept:

- design tokens as the foundation of a component system.

We should study token architecture without adopting Material's visual appearance. urlMaterial Web design tokenshttps://github.com/material-components/material-web/blob/main/docs/intro.md

## 3D source and environment research

`cortiz2894/stylized-components` is a source of reusable 3D/rendering primitives. We should inspect and adapt individual ideas/code where appropriate rather than treating the repository as our application framework.

Relevant primitives already identified include procedural surface scattering, instancing, shader-based surfaces and event-driven water/ripple effects.

The environment is a **composition of possible open-source primitives**, not a requirement to create a world from zero. Other repositories should be researched for complementary terrain, atmosphere, particles, simulation, procedural geometry, lighting, interaction and spatial-navigation techniques.

The existence of a useful primitive does not determine the final environment. We should compare alternatives and prototype before committing to a visual setting.

## UX rules

### Discovery

The user should be able to understand where and what they can interact with without turning the environment into a conventional game HUD.

### Selection

Selection should feel immediate but not abrupt. The user should understand exactly which object they selected.

### Reading

Reading is a priority state. Reduce environmental motion and visual competition while preserving spatial continuity.

### Expansion

Expansion should be continuous. Avoid replacing a card with an unrelated modal if a spatially continuous transition can communicate the same state more naturally.

### Closing

The user should be able to return to discovery without losing orientation.

### Touch

Do not design desktop hover interactions as if they automatically work on mobile. Every important interaction needs an intentional touch equivalent.

## Accessibility

- Never rely on color alone for state.
- Never rely on hover alone for essential actions.
- Text must remain readable against the environment.
- Reduced-motion preferences must be respected.
- 3D navigation needs an accessible fallback.

## Anti-patterns

Reject:

- arbitrary spacing
- generic SaaS cards
- excessive glass panels
- rainbow gradients
- constant motion
- animations without state meaning
- tiny low-contrast text
- hover-only functionality
- visual complexity that does not improve comprehension
- importing a library simply because it is popular
- choosing a black/void environment merely because it is easy
- forcing the card palette onto the entire environment without evidence

## Design process

For every major visual decision:

1. Find existing high-quality implementations.
2. Identify the underlying technique.
3. Determine whether the technique solves our actual problem.
4. Prototype it.
5. Compare it against simpler alternatives.
6. Keep the smallest implementation that produces the desired result.

The design system should evolve from evidence and prototypes, not from a giant upfront list of arbitrary rules.

# Design Research

The goal is not to collect fashionable UI libraries. We are looking for implementation techniques that improve Sotto's actual interaction quality.

## Research areas

### Design tokens

Study semantic-token systems such as shadcn/ui and Material Web. The useful idea is to define meaning (`surface`, `text`, `muted`, `focus`, `accent`) instead of scattering raw values through components.

### Interaction primitives

Study Motion for spring-based state changes, gesture handling, layout transitions and reduced-motion support.

Also investigate accessible primitive systems such as Radix UI and React Aria. Their value is mostly interaction/accessibility engineering rather than visual style.

### 3D card techniques

Inspect implementations rather than screenshots for:

- perspective response
- pointer-following tilt
- depth/lighting response
- selection focus
- object-to-content transitions
- shader-based material changes
- efficient hit testing

### Spatial UI

Research experimental WebGL/WebGPU interfaces, digital galleries, game-jam interfaces and information landscapes. Do not assume a conventional scroll feed or a conventional first-person camera is the correct interaction model.

## Current visual hypothesis

The card/content interface should be monochrome and metallic, with restrained cool-blue material/state changes. The environment remains undecided and should be researched independently.

## Important constraint

A library is not automatically a design solution. For each candidate:

1. Inspect source.
2. Identify the primitive.
3. Measure/observe its cost.
4. Prototype the primitive in isolation.
5. Decide whether owning the code is better than taking a dependency.

## Sources to inspect

- https://github.com/shadcn-ui/ui
- https://github.com/motiondivision/motion
- https://github.com/radix-ui/primitives
- https://github.com/adobe/react-spectrum
- https://github.com/material-components/material-web
- https://github.com/Aceternity/aceternity-ui

These are research sources, not commitments to dependencies or visual styles.

# Sotto Technical Plan

## Phase 0 — Research before implementation

### 0.1 3D/rendering archaeology

Inspect `cortiz2894/stylized-components` source and shaders deeply.

Extract:

- procedural surface sampling
- deterministic placement
- instancing patterns
- shader/material techniques
- water/ripple/event effects
- performance decisions

Then inspect other open-source 3D/game/WebGL/WebGPU projects for orthogonal primitives rather than collecting complete frameworks.

### 0.2 UI/UX archaeology

Research current open-source implementations for:

- design tokens
- spacing systems
- typography systems
- cards
- progressive disclosure
- modal-to-content transitions
- gesture interaction
- spring motion
- 3D UI
- accessibility
- reduced motion

Candidate sources include shadcn/ui, Motion, Material Web and selectively Aceternity UI. Their techniques should be evaluated rather than copied visually.

### 0.3 Browser constraints

Test:

- WebGL2 baseline
- WebGPU availability
- mobile GPU behaviour
- texture/media costs
- 3D scene memory
- frame-time budget
- input latency

## Phase 1 — Visual laboratory

Build a tiny isolated playground containing:

1. black environment
2. one 3D rectangular object
3. metallic material
4. controlled blue reflection/state
5. pointer/touch interaction
6. selection transition
7. 2D reading surface
8. expansion/collapse
9. return transition

No backend.

No real user data.

No payments.

No analytics.

The purpose is to determine whether the interaction language feels good.

## Phase 2 — Card/reading prototype

Implement:

- confession content model
- teaser state
- selected state
- reading state
- progressive reveal
- reactions
- smooth transitions
- keyboard/touch accessibility

Use local mock data.

## Phase 3 — Spatial discovery prototype

Experiment with multiple navigation models without committing to one:

- drag/pan
- orbit
- camera movement
- depth/zoom
- pointer-driven spatial response
- touch gestures

Measure usability and performance.

## Phase 4 — Real content pipeline

Only after the interaction survives testing:

- anonymous submission
- content persistence
- client-generated control keys
- media processing
- metadata stripping
- encrypted storage design
- aggregate reactions

## Phase 5 — Privacy architecture

Document the exact data visible to:

- browser
- edge/CDN
- application server
- database
- object storage
- analytics system
- payment provider

Then implement the minimum architecture consistent with the privacy promise.

## Phase 6 — Behavioural experimentation

Test competing loops rather than assuming one is psychologically superior.

Examples:

- contribution required before discovery
- discovery before contribution
- contribution unlocks deeper discovery
- fully free reading vs progressive locked content
- different reveal treatments
- different ranking signals

Measure aggregate behaviour.

## Phase 7 — Payments

Only after users demonstrate willingness to engage with the content should we test payment mechanics.

Payment must remain decoupled from author identity wherever possible.

## Architecture principle

Prefer a small number of understandable primitives.

Do not introduce:

- recommendation infrastructure
- AI classification
- microservices
- vector databases
- complex event pipelines
- unnecessary state-management layers

until an experiment demonstrates that they are needed.

## Initial frontend direction

A React/TypeScript browser application is the current working assumption.

Three.js / React Three Fiber are candidates for the spatial layer.

DOM/CSS remains the preferred medium for text-heavy reading UI unless a specific reason proves otherwise.

The 3D layer should not own content semantics merely because content is displayed inside a 3D environment.

## Initial infrastructure direction

Cloudflare is a candidate for edge/application/object-storage infrastructure. Exact services are intentionally deferred until the privacy and prototype requirements are clearer.

## Success criteria for the first technical milestone

A user should be able to:

1. enter
2. see a spatial field
3. identify/select an object
4. transition smoothly into its content
5. read comfortably
6. interact with the content
7. return to the spatial field

while the experience remains fast and coherent on desktop and a representative mobile device.

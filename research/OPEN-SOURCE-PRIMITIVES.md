# Open-Source Primitive Research

This is a living technical archaeology log. We are not selecting a final world yet.

## `cortiz2894/stylized-components`

### Confirmed useful primitives

- Procedural surface scattering / deterministic placement.
- Grass-field generation from supplied ground geometry.
- Instanced vegetation/geometry.
- Procedural water surface and animated ripple effects.
- Sky/environment components.
- Shader-based visual effects.

### Technical insight

The project demonstrates that a visually rich environment does not require every visible element to be individually authored. Geometry can become a substrate from which procedural detail is generated.

Its scattering implementation samples triangles by area and uses deterministic seeded randomness. This is useful both for repeatability and for keeping authoring requirements low.

Its water implementation uses procedural shader functions rather than requiring animated texture sequences. The project also demonstrates layered rendering: seabed, water, depth intersection, wave simulation, sparkles and ripple events can be composed from independent passes. citeturn0search0

### Sotto implication

Treat these as independent primitives. Do not import the repository as an application framework and do not assume its visual style defines Sotto's world.

## `Yousuf-developer/Viscose-carousel`

### Confirmed useful primitives

- Continuous ring-based spatial arrangement.
- Card position/orientation derived from a shared ring state.
- Hover-driven changes to nearby cards.
- Custom plane shaders and texture-atlas techniques.
- Motion/geometry relationships between objects.

The repository separates the ring into modules for atlas data, parameters, projects, text, tags and shaders. Its main carousel implementation is a large custom interaction system rather than a generic UI component. citeturn67file0

### Sotto implication

Do not copy the carousel metaphor. Extract the more interesting primitive: **objects can react as a group when the user approaches one object**.

Our current prototype applies this as local spatial repulsion: nearby whisper objects yield, rotate and separate when the pointer approaches them. This creates a physical relationship between objects instead of a conventional hover highlight.

## `amilich/isometric-city`

### Confirmed useful primitives

- Native HTML5 Canvas rendering without an external game engine.
- Isometric world representation.
- Depth sorting and layer management.
- Autonomous simulation systems.
- Pathfinding/crowd-style movement.
- Save/load state architecture.
- Responsive touch controls.

The project demonstrates that a rich spatial simulation can be built with a comparatively direct rendering layer instead of automatically requiring a full 3D engine. Its README explicitly describes Canvas rendering, depth sorting, dynamic traffic/pedestrian simulation and responsive controls. citeturn0search1

### Sotto implication

This challenges the assumption that every part of Sotto's eventual world must be Three.js geometry. Some future environmental layers may be cheaper as Canvas/2.5D or ordinary DOM/CSS.

More importantly, the simulation idea is transferable: instead of cars navigating a city, **whisper objects can have their own slow spatial behaviour**—drifting, clustering, separating, becoming prominent or remaining peripheral.

## Cross-pollination hypothesis

The current prototype combines ideas rather than copying applications:

`spatial card field` + `local object reaction` + `procedural environment` + `slow simulation`

This is deliberately not yet a product definition. It is an experiment to discover whether the combination itself produces a compelling interaction.

## Current prototype primitives

The current Sotto visual lab implements:

- three concentric moving whisper fields
- physical rectangular whisper objects
- local pointer-induced repulsion
- object tilt and proximity response
- orbit motion
- atmospheric fog and a spatial floor
- instanced ambient particles
- metallic object materials
- selection/focus transition
- reading state
- locked/reveal state
- local voting
- local anonymous whisper submission
- responsive mouse/touch camera controls

These are prototype mechanisms, not production architecture.

## Research candidates

The next research pass should inspect source code, not screenshots, for:

- WebGPU particle systems
- GPU simulations
- procedural worlds
- water/fluid systems
- spatial navigation
- instancing/culling systems
- shader-based post-processing
- game-jam interaction systems
- unusual browser-native 3D interfaces
- Canvas/2.5D rendering systems

For every candidate record:

1. Repository/license.
2. Exact primitive worth extracting.
3. How it works.
4. What the author eliminated or simplified.
5. Performance characteristics.
6. Whether it can coexist with our rendering stack.
7. Whether the technique is actually useful or merely visually impressive.

## Performance research questions

- How many objects can the target browser/device class render at acceptable frame rate?
- When should objects be instanced?
- When should objects be merged?
- What can remain HTML/CSS instead of entering the 3D renderer?
- Can distant content use cheaper representations?
- Can the environment stream progressively?
- Which effects are shader-cheap versus fill-rate expensive?
- How much memory do textures, GLBs and media consume?
- Can quality scale dynamically with device/GPU capability?

## Current conclusion

We should now build a **complete interaction laboratory**, not a final product. The purpose is to combine the strongest primitives we have found and discover what kind of experience naturally emerges. Only after the resulting experience is compelling should we decide exactly what users come to Sotto to do.

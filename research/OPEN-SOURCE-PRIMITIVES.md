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

Its water implementation uses procedural shader functions rather than requiring animated texture sequences.

### Sotto implication

Treat these as independent primitives. Do not import the repository as an application framework and do not assume its visual style defines Sotto's world.

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

We should build the first visual prototype before selecting a complete environment. The card/content object is the atomic visual unit; the world should be assembled around what that object actually needs.

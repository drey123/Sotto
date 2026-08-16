# Performance Budget

Performance is a product requirement from the first visual prototype.

## Principles

- Do not render what the user cannot see.
- Do not create one heavyweight DOM/JS object per distant 3D object when instancing or GPU data can represent the same information.
- Cap device pixel ratio rather than blindly rendering at native high-DPI resolution.
- Lazy-load large 3D assets and media.
- Prefer compressed textures and appropriate mipmaps for 3D textures.
- Keep expensive fragment-shader work proportional to the visible pixels it affects.
- Dispose GPU resources when scenes/assets leave the active experience.
- Keep the reading UI mostly ordinary HTML/CSS so text remains cheap and accessible.
- Measure before optimizing.

## Initial prototype targets

These are engineering targets, not promises:

- Fast first meaningful UI before the full spatial scene is ready.
- Avoid blocking the main thread during asset preparation.
- Maintain responsive pointer/touch interaction on target mobile and desktop devices.
- Cap renderer pixel ratio during the prototype.
- Record frame-time and memory observations for each major visual experiment.

## Research evidence

MDN's WebGL best-practices guidance emphasizes batching draw calls, texture compression, mipmaps, careful VRAM budgeting, smaller render backbuffers when appropriate, avoiding synchronous GPU stalls, and doing suitable work in vertex rather than fragment shaders.

Three.js `InstancedMesh` is specifically designed to render many objects sharing geometry/material with different transforms while reducing draw calls.

Three.js `WebGPURenderer` is designed as a modern renderer with a WebGL 2 fallback, making it worth testing for future GPU-heavy systems without making WebGPU the only supported path.

## Sources

- https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
- https://threejs.org/docs/pages/InstancedMesh.html
- https://threejs.org/docs/pages/WebGPU.html
- https://github.com/mrdoob/three.js/blob/dev/manual/pages/webgpurenderer.html

## Important architectural question

Do not move the whole application to WebGPU merely because it is newer. Test the actual card/environment workload. Use WebGPU where GPU compute or the renderer materially improves the experience; keep a graceful WebGL path where practical.

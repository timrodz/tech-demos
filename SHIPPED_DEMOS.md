# Shipped Demos

A record of all technical demos shipped in this repository.

## Demos

| Name | Date | Description | Run Command | Live URL | Notes |
|------|------|-------------|-------------|----------|-------|
| demo-1-vgpu-uv-gradient | 2026-10-06 | Animated UV gradient shader using WebGPU and vgpu | `bun run demo-1` | [View Live](https://timrodz.github.io/tech-demos/demo-1/) | First demo: showcases shader fundamentals with time-based animation and wave composition to create living gradients. Chosen to demonstrate pure GPU rendering with minimal dependencies. |
| demo-2-compute-particles | 2026-10-06 | GPU-accelerated particle physics simulation using WebGPU compute shaders | `npm run demo-2` | [View Live](https://timrodz.github.io/tech-demos/demo-2/) | Demonstrates compute shader capabilities: 10,000+ particles with GPU physics simulation (gravity, velocity, collision detection). Chosen to showcase WebGPU compute paradigm vs. demo-1's fragment shaders. Raw WebGPU API to reveal storage buffers, workgroup dispatch, and compute/render pass coordination. |

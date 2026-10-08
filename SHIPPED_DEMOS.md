# Shipped Demos

A record of all technical demos shipped in this repository.

## Demos

| Name | Date | Description | Run Command | Live URL | Notes |
|------|------|-------------|-------------|----------|-------|
| demo-1-vgpu-uv-gradient | 2026-10-06 | Animated UV gradient shader using WebGPU and vgpu | `bun run demo-1` | [View Live](https://tech-demos.timrodz.dev/demo-1/) | First demo: showcases shader fundamentals with time-based animation and wave composition to create living gradients. Chosen to demonstrate pure GPU rendering with minimal dependencies. |
| demo-2-compute-particles | 2026-10-06 | GPU-accelerated particle physics simulation using WebGPU compute shaders | `npm run demo-2` | [View Live](https://tech-demos.timrodz.dev/demo-2/) | Demonstrates compute shader capabilities: 10,000+ particles with GPU physics simulation (gravity, velocity, collision detection). Chosen to showcase WebGPU compute paradigm vs. demo-1's fragment shaders. Raw WebGPU API to reveal storage buffers, workgroup dispatch, and compute/render pass coordination. |
| demo-3-streaming-markdown | 2026-10-07 | Side-by-side comparison of naive markdown rendering vs Vercel's streamdown for AI streaming | `bun run demo-3` | [View Live](https://tech-demos.timrodz.dev/demo-3/) | Exposes markdown rendering glitches during token-by-token streaming (unterminated bold, half-open code fences, broken links, malformed tables). Naive renderer (marked) vs streaming-aware renderer (streamdown). Chosen because streaming markdown is the most common AI frontend bug. Uses React + Vite, local pre-written content, no API calls. |
| demo-4-guardrailed-generative-ui | 2026-10-08 | Catalog-constrained generative UI using Vercel Labs json-render with streaming and guardrails | `bun run demo-4` | [View Live](https://tech-demos.timrodz.dev/demo-4/) | Demonstrates safe AI-generated UIs with json-render's catalog system. Pre-recorded JSON spec streams in token-by-token, progressively rendering dashboard components (cards, metrics, buttons, lists). Includes guardrail test: toggle to inject an off-catalog component and watch it get rejected mid-stream. Uses React + Vite, @json-render/react v0.21.0, Zod schemas, no API calls. Chosen because generative UI is the next frontier for AI applications, and safe rendering requires guardrails. |

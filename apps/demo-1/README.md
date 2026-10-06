# Demo 1: vgpu UV Gradient

![Interactive UV Gradient Demo](./demo-screenshot.png)

## What it shows

An interactive fullscreen animated gradient shader powered by WebGPU, demonstrating how UV coordinates, time, and user controls can create living, organic color patterns. The shader combines multiple sine waves at different frequencies to generate a soft plasma effect that continuously evolves—now with real-time color and speed customization.

## Interactive Controls

The demo features three native interactive controls that directly modify shader uniforms:

- **Primary Color**: Color picker to set the base gradient color (wired to `uniforms.color1` in WGSL)
- **Secondary Color**: Color picker to set the secondary gradient color (wired to `uniforms.color2` in WGSL)
- **Animation Speed**: Slider (0.1× to 2.0×) to control the animation playback speed (wired to `uniforms.speed` in WGSL)

All controls update the shader uniforms in real-time with zero latency—demonstrating how to wire HTML inputs directly into GPU computation.

## Why this scenario

This demo showcases the fundamental building blocks of interactive GPU shader programming:
- **UV mapping**: Converting screen coordinates to normalized 0-1 texture space
- **Time-based animation**: Using uniform buffers to pass time data to shaders
- **Interactive uniforms**: Wiring user input (color pickers, sliders) directly to shader parameters
- **Wave composition**: Layering mathematical functions to create complex visual patterns
- **Dynamic color blending**: Mixing user-defined colors based on mathematical wave functions

It's a minimal, self-contained example that runs entirely on the GPU with zero CPU overhead per frame—perfect for understanding how to build interactive shader applications with WebGPU.

## Why vgpu

[vgpu](https://vgpu.sh/) provides a thin, modern wrapper around WebGPU that removes boilerplate while staying close to the metal. Unlike higher-level frameworks, vgpu lets you:
- Write shaders directly in WGSL without abstraction layers
- Understand exactly what's happening at the GPU level
- Keep bundle sizes tiny (no framework overhead)
- Learn WebGPU patterns that transfer to other projects

For a demo focused on interactive shader fundamentals, vgpu's lightweight approach is ideal—it handles the device setup and render loop while letting you focus on wiring controls to uniforms and building the shader logic.

## How to run

From the repository root:

```bash
bun run demo-1
```

This will start a dev server at `http://localhost:3000` with the animated gradient.

The demo opens automatically in your default browser. You'll need a WebGPU-enabled browser (Chrome 113+, Edge 113+, or similar).

Once running, use the control panel in the top-right to experiment with colors and animation speed in real-time.

## Technical details

- **Render technique**: Fullscreen triangle with fragment shader
- **Uniform buffer**: Struct containing time, speed multiplier, and two RGB color vectors
- **Shader approach**: Multiple sine wave composition with user-controlled color blending
- **Interactive controls**: Native HTML5 color pickers and range slider (no UI framework dependencies)
- **Color space**: RGB with user-defined colors blended via wave-based interpolation
- **Performance**: Pure GPU rendering, ~60 FPS on any WebGPU device
- **UI Theme**: Styled to match portfolio design system (teal/orange accent palette, clean typography)

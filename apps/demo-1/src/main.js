import { init, effect, frameLoop, surface, clock } from 'vgpu';

const canvas = document.getElementById('canvas');

// Resize canvas to fill window
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Check WebGPU support
if (!navigator.gpu) {
  document.body.innerHTML = '<div style="color: white; padding: 20px; font-family: sans-serif;">WebGPU is not supported in this browser. Please use Chrome/Edge 113+ or another WebGPU-enabled browser.</div>';
  throw new Error('WebGPU not supported');
}

// Initialize vgpu
const gpu = await init();
const canvasSurface = surface(gpu, canvas, { dpr: [1, 2] });
const time = clock(gpu);

// Inline shader with animated gradient
const shaderSource = /* wgsl */`
@group(0) @binding(0) var<uniform> time: f32;

@fragment
fn fragment_main(@builtin(position) position: vec4f) -> @location(0) vec4f {
  // Normalize position to UV coordinates based on canvas size  
  let uv = position.xy / vec2f(f32(${canvas.width}), f32(${canvas.height}));
  
  // Animated soft plasma using UV coordinates and time
  let t = time * 0.5;
  
  // Create multiple sine waves at different frequencies
  let x = uv.x * 6.0 + t;
  let y = uv.y * 6.0 + t * 0.7;
  
  let wave1 = sin(x + t);
  let wave2 = sin(y + t * 1.3);
  let wave3 = sin((x + y) * 0.5 + t * 0.8);
  let wave4 = sin(length(uv - 0.5) * 8.0 - t * 2.0);
  
  // Combine waves
  let combined = (wave1 + wave2 + wave3 + wave4) * 0.25;
  
  // Map to colors with smooth gradients
  let r = sin(combined + t) * 0.5 + 0.5;
  let g = sin(combined + t + 2.094) * 0.5 + 0.5;
  let b = sin(combined + t + 4.189) * 0.5 + 0.5;
  
  return vec4f(r, g, b, 1.0);
}
`;

// Create animated gradient effect
const gradientEffect = effect(gpu, shaderSource);

// Render loop
frameLoop(gpu, (frame) => {
  gradientEffect.set({ time: time.time });
  frame.pass(canvasSurface, gradientEffect);
});

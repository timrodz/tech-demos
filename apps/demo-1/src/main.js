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

// Interactive control state
const controls = {
  color1: { r: 1.0, g: 0.42, b: 0.42 }, // #ff6b6b
  color2: { r: 0.31, g: 0.8, b: 0.77 }, // #4ecdc4
  speed: 1.0
};

// Helper to convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
}

// Wire up color controls
const color1Input = document.getElementById('color1');
const color1Hex = document.getElementById('color1-hex');
color1Input.addEventListener('input', (e) => {
  const rgb = hexToRgb(e.target.value);
  if (rgb) {
    controls.color1 = rgb;
    color1Hex.textContent = e.target.value;
  }
});

const color2Input = document.getElementById('color2');
const color2Hex = document.getElementById('color2-hex');
color2Input.addEventListener('input', (e) => {
  const rgb = hexToRgb(e.target.value);
  if (rgb) {
    controls.color2 = rgb;
    color2Hex.textContent = e.target.value;
  }
});

// Wire up speed control
const speedInput = document.getElementById('speed');
const speedValue = document.getElementById('speed-value');
speedInput.addEventListener('input', (e) => {
  controls.speed = parseFloat(e.target.value);
  speedValue.textContent = `${controls.speed.toFixed(1)}×`;
});

// Inline shader with animated gradient and user controls
const shaderSource = /* wgsl */`
struct Uniforms {
  time: f32,
  speed: f32,
  color1: vec3f,
  color2: vec3f,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@fragment
fn fragment_main(@builtin(position) position: vec4f) -> @location(0) vec4f {
  // Normalize position to UV coordinates based on canvas size  
  let uv = position.xy / vec2f(f32(${canvas.width}), f32(${canvas.height}));
  
  // Animated soft plasma using UV coordinates and time with user-controlled speed
  let t = uniforms.time * 0.5 * uniforms.speed;
  
  // Create multiple sine waves at different frequencies
  let x = uv.x * 6.0 + t;
  let y = uv.y * 6.0 + t * 0.7;
  
  let wave1 = sin(x + t);
  let wave2 = sin(y + t * 1.3);
  let wave3 = sin((x + y) * 0.5 + t * 0.8);
  let wave4 = sin(length(uv - 0.5) * 8.0 - t * 2.0);
  
  // Combine waves
  let combined = (wave1 + wave2 + wave3 + wave4) * 0.25;
  
  // Map to colors using user-defined colors
  let t1 = sin(combined + t) * 0.5 + 0.5;
  let t2 = sin(combined + t + 2.094) * 0.5 + 0.5;
  
  // Blend between color1 and color2 based on the waves
  let color = mix(uniforms.color1, uniforms.color2, t1);
  
  // Add some variation with the second wave
  let finalColor = mix(color, uniforms.color2, t2 * 0.3);
  
  return vec4f(finalColor, 1.0);
}
`;

// Create animated gradient effect
const gradientEffect = effect(gpu, shaderSource);

// Render loop
frameLoop(gpu, (frame) => {
  gradientEffect.set({ 
    uniforms: {
      time: time.time,
      speed: controls.speed,
      color1: [controls.color1.r, controls.color1.g, controls.color1.b],
      color2: [controls.color2.r, controls.color2.g, controls.color2.b],
    }
  });
  frame.pass(canvasSurface, gradientEffect);
});

import { renderLoop, makeBuffer, makeShader } from 'vgpu';

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

// Initialize WebGPU context
const context = canvas.getContext('webgpu');
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
context.configure({
  device,
  format: presentationFormat,
  alphaMode: 'opaque'
});

// Create fullscreen triangle vertices
const vertices = makeBuffer(device, GPUBufferUsage.VERTEX, new Float32Array([
  -1, -1,
   3, -1,
  -1,  3
]));

// Shader that creates an animated UV gradient
const shader = makeShader(device, {
  vertex: {
    entryPoint: 'vertexMain',
    code: `
      struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) uv: vec2f,
      };

      @vertex
      fn vertexMain(@location(0) position: vec2f) -> VertexOutput {
        var output: VertexOutput;
        output.position = vec4f(position, 0.0, 1.0);
        output.uv = position * 0.5 + 0.5;
        return output;
      }
    `
  },
  fragment: {
    entryPoint: 'fragmentMain',
    targets: [{ format: presentationFormat }],
    code: `
      @group(0) @binding(0) var<uniform> time: f32;

      @fragment
      fn fragmentMain(@location(0) uv: vec2f) -> @location(0) vec4f {
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
        let g = sin(combined + t + 2.094) * 0.5 + 0.5; // 2π/3 offset
        let b = sin(combined + t + 4.189) * 0.5 + 0.5; // 4π/3 offset
        
        return vec4f(r, g, b, 1.0);
      }
    `
  }
});

// Create uniform buffer for time
const timeBuffer = makeBuffer(device, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, 4);

// Create bind group
const bindGroup = device.createBindGroup({
  layout: shader.pipeline.getBindGroupLayout(0),
  entries: [{
    binding: 0,
    resource: { buffer: timeBuffer }
  }]
});

// Render loop
let startTime = Date.now();

renderLoop((encoder) => {
  // Update time uniform
  const time = (Date.now() - startTime) / 1000;
  device.queue.writeBuffer(timeBuffer, 0, new Float32Array([time]));

  // Render pass
  const textureView = context.getCurrentTexture().createView();
  const renderPass = encoder.beginRenderPass({
    colorAttachments: [{
      view: textureView,
      loadOp: 'clear',
      clearValue: { r: 0, g: 0, b: 0, a: 1 },
      storeOp: 'store'
    }]
  });

  renderPass.setPipeline(shader.pipeline);
  renderPass.setVertexBuffer(0, vertices);
  renderPass.setBindGroup(0, bindGroup);
  renderPass.draw(3);
  renderPass.end();
}, device);

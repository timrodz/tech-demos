import computeShader from './compute.wgsl';
import renderShader from './render.wgsl';

async function main() {
  // Check WebGPU support
  if (!navigator.gpu) {
    document.body.innerHTML = '<div class="error"><h2>WebGPU Not Supported</h2><p>Your browser does not support WebGPU. Please use Chrome 113+ or another WebGPU-enabled browser.</p></div>';
    return;
  }

  const canvas = document.getElementById('canvas');
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    document.body.innerHTML = '<div class="error"><h2>WebGPU Adapter Not Found</h2><p>Could not get a WebGPU adapter.</p></div>';
    return;
  }

  const device = await adapter.requestDevice();
  const context = canvas.getContext('webgpu');
  const format = navigator.gpu.getPreferredCanvasFormat();

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  context.configure({
    device,
    format,
    alphaMode: 'opaque',
  });

  // Particle state
  let particleCount = 10000;
  let gravity = 0.5;
  let particleColor = [0.078, 0.722, 0.651]; // #14b8a6 in RGB

  // Initialize particles
  function createParticles(count) {
    const particleData = new Float32Array(count * 4); // position (2) + velocity (2)
    for (let i = 0; i < count; i++) {
      const offset = i * 4;
      // Random position
      particleData[offset] = Math.random() * 2 - 1;
      particleData[offset + 1] = Math.random() * 2 - 1;
      // Random velocity
      particleData[offset + 2] = (Math.random() - 0.5) * 0.5;
      particleData[offset + 3] = (Math.random() - 0.5) * 0.5;
    }
    return particleData;
  }

  let particleData = createParticles(particleCount);

  // Create particle buffer
  let particleBuffer = device.createBuffer({
    size: particleData.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(particleBuffer, 0, particleData);

  // Compute uniform buffer
  const computeUniformBuffer = device.createBuffer({
    size: 16, // deltaTime, gravity, particleCount, pad
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // Render uniform buffer
  const renderUniformBuffer = device.createBuffer({
    size: 16, // color (vec3) + padding
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // Compute pipeline
  const computeModule = device.createShaderModule({
    code: computeShader,
  });

  const computePipeline = device.createComputePipeline({
    layout: 'auto',
    compute: {
      module: computeModule,
      entryPoint: 'main',
    },
  });

  let computeBindGroup = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: particleBuffer } },
      { binding: 1, resource: { buffer: computeUniformBuffer } },
    ],
  });

  // Render pipeline
  const renderModule = device.createShaderModule({
    code: renderShader,
  });

  const renderPipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: renderModule,
      entryPoint: 'vertexMain',
    },
    fragment: {
      module: renderModule,
      entryPoint: 'fragmentMain',
      targets: [{ format }],
    },
    primitive: {
      topology: 'triangle-list',
    },
  });

  let renderBindGroup = device.createBindGroup({
    layout: renderPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: particleBuffer } },
      { binding: 1, resource: { buffer: renderUniformBuffer } },
    ],
  });

  // Controls
  const countInput = document.getElementById('count');
  const countValue = document.getElementById('count-value');
  const gravityInput = document.getElementById('gravity');
  const gravityValue = document.getElementById('gravity-value');
  const colorInput = document.getElementById('color');

  countInput.addEventListener('input', (e) => {
    const newCount = parseInt(e.target.value);
    countValue.textContent = newCount;
    if (newCount !== particleCount) {
      particleCount = newCount;
      // Recreate particle buffer
      particleData = createParticles(particleCount);
      particleBuffer.destroy();
      particleBuffer = device.createBuffer({
        size: particleData.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(particleBuffer, 0, particleData);
      
      // Recreate bind groups
      computeBindGroup = device.createBindGroup({
        layout: computePipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: particleBuffer } },
          { binding: 1, resource: { buffer: computeUniformBuffer } },
        ],
      });
      
      renderBindGroup = device.createBindGroup({
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: particleBuffer } },
          { binding: 1, resource: { buffer: renderUniformBuffer } },
        ],
      });
    }
  });

  gravityInput.addEventListener('input', (e) => {
    gravity = parseFloat(e.target.value) / 100;
    gravityValue.textContent = e.target.value;
  });

  colorInput.addEventListener('input', (e) => {
    const hex = e.target.value;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    particleColor = [r, g, b];
  });

  // Render loop
  let lastTime = performance.now();

  function frame() {
    const now = performance.now();
    const deltaTime = Math.min((now - lastTime) / 1000, 0.016); // Cap at 60fps
    lastTime = now;

    // Update compute uniforms
    device.queue.writeBuffer(
      computeUniformBuffer,
      0,
      new Float32Array([deltaTime, gravity, particleCount, 0])
    );

    // Update render uniforms
    device.queue.writeBuffer(
      renderUniformBuffer,
      0,
      new Float32Array([...particleColor, 0])
    );

    const commandEncoder = device.createCommandEncoder();

    // Compute pass
    const computePass = commandEncoder.beginComputePass();
    computePass.setPipeline(computePipeline);
    computePass.setBindGroup(0, computeBindGroup);
    const workgroupCount = Math.ceil(particleCount / 64);
    computePass.dispatchWorkgroups(workgroupCount);
    computePass.end();

    // Render pass
    const textureView = context.getCurrentTexture().createView();
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.04, g: 0.04, b: 0.04, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    });
    renderPass.setPipeline(renderPipeline);
    renderPass.setBindGroup(0, renderBindGroup);
    renderPass.draw(6, particleCount);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(frame);
  }

  // Handle resize
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  requestAnimationFrame(frame);
}

main().catch(console.error);

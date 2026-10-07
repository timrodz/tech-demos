(function(){const u=document.createElement("link").relList;if(u&&u.supports&&u.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))p(n);new MutationObserver(n=>{for(const t of n)if(t.type==="childList")for(const l of t.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&p(l)}).observe(document,{childList:!0,subtree:!0});function e(n){const t={};return n.integrity&&(t.integrity=n.integrity),n.referrerPolicy&&(t.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?t.credentials="include":n.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function p(n){if(n.ep)return;n.ep=!0;const t=e(n);fetch(n.href,t)}})();const T=`struct Particle {
  position: vec2f,
  velocity: vec2f,
}

struct Uniforms {
  deltaTime: f32,
  gravity: f32,
  particleCount: f32,
  _pad: f32,
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let index = id.x;
  if (index >= u32(uniforms.particleCount)) {
    return;
  }

  var particle = particles[index];
  
  // Apply gravity
  particle.velocity.y += uniforms.gravity * uniforms.deltaTime;
  
  // Update position
  particle.position += particle.velocity * uniforms.deltaTime;
  
  // Bounce off walls with energy loss
  let damping = 0.7;
  
  if (particle.position.x < -1.0) {
    particle.position.x = -1.0;
    particle.velocity.x = abs(particle.velocity.x) * damping;
  }
  if (particle.position.x > 1.0) {
    particle.position.x = 1.0;
    particle.velocity.x = -abs(particle.velocity.x) * damping;
  }
  if (particle.position.y < -1.0) {
    particle.position.y = -1.0;
    particle.velocity.y = abs(particle.velocity.y) * damping;
  }
  if (particle.position.y > 1.0) {
    particle.position.y = 1.0;
    particle.velocity.y = -abs(particle.velocity.y) * damping;
  }
  
  particles[index] = particle;
}
`,q=`struct Particle {
  position: vec2f,
  velocity: vec2f,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
}

struct Uniforms {
  color: vec3f,
  _pad: f32,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instanceIndex: u32) -> VertexOutput {
  let particle = particles[instanceIndex];
  
  // Create a small quad for each particle (6 vertices = 2 triangles)
  let size = 0.008;
  var positions = array<vec2f, 6>(
    vec2f(-size, -size),
    vec2f(size, -size),
    vec2f(-size, size),
    vec2f(-size, size),
    vec2f(size, -size),
    vec2f(size, size)
  );
  
  let offset = positions[vertexIndex];
  let pos = particle.position + offset;
  
  // Color based on velocity magnitude
  let speed = length(particle.velocity);
  let intensity = min(speed * 0.5, 1.0);
  
  var output: VertexOutput;
  output.position = vec4f(pos, 0.0, 1.0);
  output.color = vec4f(uniforms.color * (0.5 + intensity * 0.5), 1.0);
  return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  return input.color;
}
`;async function A(){if(!navigator.gpu){document.body.innerHTML='<div class="error"><h2>WebGPU Not Supported</h2><p>Your browser does not support WebGPU. Please use Chrome 113+ or another WebGPU-enabled browser.</p></div>';return}const s=document.getElementById("canvas"),u=await navigator.gpu.requestAdapter();if(!u){document.body.innerHTML='<div class="error"><h2>WebGPU Adapter Not Found</h2><p>Could not get a WebGPU adapter.</p></div>';return}const e=await u.requestDevice(),p=s.getContext("webgpu"),n=navigator.gpu.getPreferredCanvasFormat();s.width=window.innerWidth,s.height=window.innerHeight,p.configure({device:e,format:n,alphaMode:"opaque"});let t=1e4,l=.5,h=[.078,.722,.651];function P(i){const r=new Float32Array(i*4);for(let a=0;a<i;a++){const o=a*4;r[o]=Math.random()*2-1,r[o+1]=Math.random()*2-1,r[o+2]=(Math.random()-.5)*.5,r[o+3]=(Math.random()-.5)*.5}return r}let d=P(t),c=e.createBuffer({size:d.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});e.queue.writeBuffer(c,0,d);const g=e.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),m=e.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),C=e.createShaderModule({code:T}),v=e.createComputePipeline({layout:"auto",compute:{module:C,entryPoint:"main"}});let w=e.createBindGroup({layout:v.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:c}},{binding:1,resource:{buffer:g}}]});const B=e.createShaderModule({code:q}),y=e.createRenderPipeline({layout:"auto",vertex:{module:B,entryPoint:"vertexMain"},fragment:{module:B,entryPoint:"fragmentMain",targets:[{format:n}]},primitive:{topology:"triangle-list"}});let x=e.createBindGroup({layout:y.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:c}},{binding:1,resource:{buffer:m}}]});const I=document.getElementById("count"),M=document.getElementById("count-value"),O=document.getElementById("gravity"),z=document.getElementById("gravity-value"),L=document.getElementById("color");I.addEventListener("input",i=>{const r=parseInt(i.target.value);M.textContent=r,r!==t&&(t=r,d=P(t),c.destroy(),c=e.createBuffer({size:d.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),e.queue.writeBuffer(c,0,d),w=e.createBindGroup({layout:v.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:c}},{binding:1,resource:{buffer:g}}]}),x=e.createBindGroup({layout:y.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:c}},{binding:1,resource:{buffer:m}}]}))}),O.addEventListener("input",i=>{l=parseFloat(i.target.value)/100,z.textContent=i.target.value}),L.addEventListener("input",i=>{const r=i.target.value,a=parseInt(r.slice(1,3),16)/255,o=parseInt(r.slice(3,5),16)/255,b=parseInt(r.slice(5,7),16)/255;h=[a,o,b]});let U=performance.now();function G(){const i=performance.now(),r=Math.min((i-U)/1e3,.016);U=i,e.queue.writeBuffer(g,0,new Float32Array([r,l,t,0])),e.queue.writeBuffer(m,0,new Float32Array([...h,0]));const a=e.createCommandEncoder(),o=a.beginComputePass();o.setPipeline(v),o.setBindGroup(0,w);const b=Math.ceil(t/64);o.dispatchWorkgroups(b),o.end();const E=p.getCurrentTexture().createView(),f=a.beginRenderPass({colorAttachments:[{view:E,clearValue:{r:.04,g:.04,b:.04,a:1},loadOp:"clear",storeOp:"store"}]});f.setPipeline(y),f.setBindGroup(0,x),f.draw(6,t),f.end(),e.queue.submit([a.finish()]),requestAnimationFrame(G)}window.addEventListener("resize",()=>{s.width=window.innerWidth,s.height=window.innerHeight}),requestAnimationFrame(G)}A().catch(console.error);

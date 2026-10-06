struct Particle {
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
  let size = 0.005;
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

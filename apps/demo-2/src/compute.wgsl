struct Particle {
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

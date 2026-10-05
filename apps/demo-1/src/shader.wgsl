@group(0) @binding(0) var<uniform> time: f32;

@fragment
fn fragment_main(@builtin(position) position: vec4f) -> @location(0) vec4f {
  // Normalize position to UV coordinates (0-1)
  let uv = position.xy / vec2f(800.0, 600.0); // This will be overridden by actual canvas size
  
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

export const foliageVertexShader = `
uniform float uTime;
uniform float uMix;

attribute vec3 aScatterPos;
attribute vec3 aTreePos;
attribute float aRandom;
attribute float aSize;

varying vec3 vColor;
varying float vSparkle;

void main() {
  // Position interpolation
  vec3 pos = mix(aScatterPos, aTreePos, uMix);

  // Breathing effect
  float pulse = aRandom * 6.28318;
  pos.y += sin(uTime * 1.5 + pulse) * 0.05 * uMix;

  // Horizontal drift (stronger when scattered)
  float speed = 0.3 + aRandom * 0.5;
  pos.x += sin(uTime * speed + pos.y) * 0.02 * (1.0 + (1.0 - uMix) * 2.0);
  pos.z += cos(uTime * speed * 0.7 + pos.x) * 0.015 * (1.0 + (1.0 - uMix) * 2.0);

  // Height-based color gradient (normalized 0-12 range)
  float heightNorm = clamp(aTreePos.y / 12.0, 0.0, 1.0);

  // Bottom: deep purple (0.3, 0.1, 0.3)
  // Main: dreamy pink (0.85, 0.5, 0.75) -> Slightly boosted pink
  // Top accent: magical blue (0.45, 0.7, 1.0) -> Brighter blue
  vec3 bottomColor = vec3(0.3, 0.1, 0.3);
  vec3 pinkColor = vec3(0.85, 0.5, 0.75);
  vec3 blueColor = vec3(0.45, 0.7, 1.0);

  vec3 color = mix(bottomColor, pinkColor, smoothstep(0.0, 0.4, heightNorm));
  color = mix(color, mix(pinkColor, blueColor, 0.3), smoothstep(0.6, 1.0, heightNorm));

  // Sparkle calculation - Enhanced
  // Faster, sharper sparkles using high frequency sine waves
  float sparkleVal = sin(speed * 80.0 + uTime * 4.0) + sin(pos.x * 20.0 + uTime * 2.0);
  vSparkle = sparkleVal > 1.0 ? 1.0 : 0.0; // Threshold for "on/off" glitter effect

  vColor = color;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = aSize * (300.0 / -mvPosition.z);
}
`

export const foliageFragmentShader = `
varying vec3 vColor;
varying float vSparkle;

void main() {
  // Circular particle with soft edge
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  if (dist > 0.5) discard;

  float alpha = 1.0 - smoothstep(0.2, 0.5, dist);

  // Mix in white sparkle
  vec3 finalColor = mix(vColor, vec3(1.0, 0.95, 1.0), vSparkle * 0.7);

  // HDR boost for bloom
  finalColor *= 1.5;

  gl_FragColor = vec4(finalColor, alpha * 0.85);
}
`

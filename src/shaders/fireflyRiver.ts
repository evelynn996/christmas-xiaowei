export const fireflyVertexShader = `
uniform float uTime;
uniform float uMix;

attribute float aOffset;
attribute float aSpeed;
attribute float aSize;

varying float vAlpha;

// Ray-Cone intersection for geometric occlusion
// Returns 1.0 if visible, 0.0 if occluded by tree
float getOcclusion(vec3 particlePos, vec3 camPos) {
  vec3 rayDir = normalize(camPos - particlePos);
  float distToCam = length(camPos - particlePos);

  // Cone params: Apex at (0,12,0), Base at (0,0,0), Radius 3.5
  float H = 12.0;
  float R = 3.5; // Slightly smaller than visual tree for soft edges

  // Shift origin to Apex (0,12,0)
  vec3 P = particlePos - vec3(0.0, H, 0.0);
  vec3 D = rayDir;

  float k = R / H;
  float k2 = k * k;

  // Quadratic coefficients for ray-cone intersection
  // Cone equation: x^2 + z^2 = k^2 * y^2
  float a = D.x * D.x + D.z * D.z - k2 * D.y * D.y;
  float b = 2.0 * (P.x * D.x + P.z * D.z - k2 * P.y * D.y);
  float c = P.x * P.x + P.z * P.z - k2 * P.y * P.y;

  // Avoid division by zero for rays parallel to cone surface
  if (abs(a) < 0.0001) return 1.0;

  float delta = b * b - 4.0 * a * c;
  if (delta < 0.0) return 1.0; // Ray misses infinite cone

  float sqrtDelta = sqrt(delta);
  float t1 = (-b - sqrtDelta) / (2.0 * a);
  float t2 = (-b + sqrtDelta) / (2.0 * a);

  // Check if intersection is valid:
  // 1. Between particle and camera (0 < t < distToCam)
  // 2. Within cone height (y in [-12, 0] since we shifted apex to 0)

  float y1 = P.y + t1 * D.y;
  bool hit1 = t1 > 0.1 && t1 < distToCam && y1 > -H && y1 < 0.0;

  float y2 = P.y + t2 * D.y;
  bool hit2 = t2 > 0.1 && t2 < distToCam && y2 > -H && y2 < 0.0;

  // If any valid intersection, particle is occluded
  return (hit1 || hit2) ? 0.0 : 1.0;
}

void main() {
  // Height cycle (0 to 12), loops continuously
  float loopTime = 12.0;
  float t = mod(uTime * 0.5 + aOffset * loopTime, loopTime);
  float h = t;

  // Cone radius: 3.8 at h=0, 0 at h=12.5
  float coneRadius = 3.8 * (1.0 - h / 12.5);

  // Spiral angle: base rotation + time rotation + height-based twist
  float angle = aOffset * 6.28318 + uTime * 0.2 + h * 1.2;

  // Organic wobble
  float wobbleR = sin(uTime * 2.5 + aOffset * 12.0) * 0.15;
  float wobbleY = cos(uTime * 2.0 + aOffset * 9.0) * 0.1;

  // Static random radius offset for river width
  float widthOffset = (aSpeed - 0.6) * 3.5;

  // Static random Y offset for vertical spread
  float ySpread = 0.9;
  float yOffset = (aSize - 1.2) * ySpread;

  // Orbit radius: flow AROUND the tree
  float riverRadius = coneRadius + 0.5 + wobbleR + widthOffset;
  vec3 pos = vec3(
    cos(angle) * riverRadius,
    h + wobbleY + yOffset,
    sin(angle) * riverRadius
  );

  // Calculate world position for occlusion check
  vec4 worldPos = modelMatrix * vec4(pos, 1.0);

  // Geometric occlusion: hide fireflies behind the tree
  float occlusion = getOcclusion(worldPos.xyz, cameraPosition);

  // Fade in/out at boundaries
  float fadeIn = smoothstep(0.0, 1.5, h);
  float fadeOut = 1.0 - smoothstep(10.5, 12.0, h);

  // Apply occlusion (only when tree is formed, based on uMix)
  float occlusionStrength = smoothstep(0.7, 1.0, uMix);
  vAlpha = fadeIn * fadeOut * uMix * mix(1.0, occlusion, occlusionStrength);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Size with breathing pulse
  float pulse = 1.0 + 0.35 * sin(uTime * 4.0 + aOffset * 15.0);
  gl_PointSize = aSize * pulse * (180.0 / -mvPosition.z);
}
`

export const fireflyFragmentShader = `
varying float vAlpha;

void main() {
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);

  // Soft circular glow with hot center
  float strength = 1.0 - smoothstep(0.0, 0.5, dist);
  strength = pow(strength, 1.8);

  // Warm firefly color (yellow-orange)
  vec3 color = vec3(1.0, 0.82, 0.28);
  // Bright white core
  color += vec3(0.6) * smoothstep(0.35, 0.0, dist);

  gl_FragColor = vec4(color, strength * vAlpha);
}
`

precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform float uAmp;      // 0 … 1 intensity
uniform vec2  uPointer;  // -1 … 1
uniform float uShift;    // scroll-driven phase

const vec3 LIME = vec3(0.565, 0.933, 0.122);
const vec3 DEEP = vec3(0.060, 0.420, 0.020);

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

// a twisting bundle of fine threads: every thread orbits a shared centre line
vec3 bundle(vec2 p, float t, float seed, float yBase, float width){
  vec3 acc = vec3(0.0);
  float cx = p.x * 1.15 + seed;
  float centre = yBase + 0.16 * sin(cx * 0.9 + t * 0.21 + seed) + 0.07 * sin(cx * 2.1 - t * 0.17);
  float w = width * (0.55 + 0.45 * sin(cx * 0.7 - t * 0.13 + seed * 2.0));
  float twist = cx * 1.6 + t * 0.35;
  for (int i = 0; i < 22; i++){
    float fi = float(i);
    float a  = fi * 0.2856 + twist + sin(fi * 1.7 + seed) * 0.4;
    float y  = centre + w * sin(a);
    float depth = 0.5 + 0.5 * cos(a);                 // front threads are brighter
    float d = abs(p.y - y);
    float glow = 0.0011 / (d + 0.0016);
    acc += mix(DEEP, LIME, depth) * glow * (0.28 + 0.72 * depth);
    acc += vec3(0.9, 1.0, 0.75) * smoothstep(0.0022, 0.0, d) * depth * 0.5;
  }
  return acc;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p  = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime + uShift * 4.0;
  p.y += uPointer.y * 0.012; p.x += uPointer.x * 0.012;
  // slight perspective tilt so the bundle runs diagonally across the frame
  vec2 r = vec2(p.x * 0.96 - p.y * 0.26, p.x * 0.26 + p.y * 0.96);
  vec3 col = vec3(0.0);
  col += bundle(r, t, 0.0, -0.20, 0.17);
  col += bundle(r * vec2(1.0, 1.0) + vec2(0.0, -0.02), t * 0.8 + 4.0, 3.7, 0.30, 0.11) * 0.55;
  // soft bloom under the threads
  float fog = exp(-pow((r.y + 0.20) * 3.2, 2.0)) * 0.10 + exp(-pow((r.y - 0.30) * 4.0, 2.0)) * 0.04;
  col += DEEP * fog;
  col *= uAmp;
  // keep the centre calm so the headline stays readable
  float calm = smoothstep(0.0, 0.55, length(p * vec2(0.62, 1.25)));
  col *= mix(0.30, 1.0, calm);
  col *= smoothstep(1.25, 0.35, length(p * vec2(0.8, 1.0)));
  col = col / (1.0 + col * 0.55);                      // soft clip
  col += (hash(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) / 255.0;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}

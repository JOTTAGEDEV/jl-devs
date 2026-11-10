precision highp float;
uniform vec2  uRes;      // canvas size (px)
uniform float uTime;     // seconds
uniform vec3  uBox;      // logo image square: centre x, centre y (px, y down), size (px)
uniform float uSweep;    // x (px) of the render line: left of it is rendered, right is the draft
uniform float uScan;     // glow of the render line
uniform float uFill;     // draft logo: flat fill
uniform float uOutline;  // draft logo: outline
uniform float uGlass;    // 0 photo … 1 procedural glass (extreme zoom)
uniform float uFlood;    // 0 … 1 everything turns lime
uniform float uLive;     // strength of pointer-driven light
uniform vec2  uPointer;  // -1 … 1
uniform sampler2D uLogo; // studio photo of the logo
uniform sampler2D uMaps; // r: signed distance, g: pillow height, b: wide glow

const vec3 LIME   = vec3(0.565, 0.933, 0.122);
const vec3 DEEP   = vec3(0.118, 0.620, 0.031);
const vec3 STUDIO = vec3(0.884, 0.914, 0.931);
const vec3 PAPER  = vec3(0.945, 0.957, 0.953);

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

void main(){
  vec2 p  = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 uv = (p - uBox.xy) / uBox.z + 0.5;
  float inImg = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  vec2 uvc = clamp(uv, 0.002, 0.998);
  vec3 m   = texture2D(uMaps, uvc).rgb;
  float sd = mix(-0.0638, (m.r - 0.5) * 0.1276, inImg);   // signed distance in image units (±80 px of 1254)
  float aa = 1.0 / uBox.z;
  float mask = smoothstep(-aa, aa, sd);
  float hgt  = m.g * inImg;

  // ---------------- rendered: the studio ----------------
  vec3 bg = STUDIO;
  float dl = length((p - uBox.xy) / uBox.z);
  bg += vec3(0.014, 0.024, 0.016) * exp(-dl * dl * 2.4);
  vec2 q = p / uRes - 0.5;
  bg -= 0.028 * smoothstep(0.38, 0.95, length(q * vec2(1.0, 1.12)));

  vec2 par = uPointer * hgt * 0.011 * uLive;
  vec3 photo = texture2D(uLogo, clamp(uv + par, 0.002, 0.998)).rgb;

  float e  = 3.0 / 512.0;
  float hx = texture2D(uMaps, uvc + vec2(e, 0.0)).g - texture2D(uMaps, uvc - vec2(e, 0.0)).g;
  float hy = texture2D(uMaps, uvc + vec2(0.0, e)).g - texture2D(uMaps, uvc - vec2(0.0, e)).g;
  vec3 n = normalize(vec3(-hx, -hy, 0.2));
  vec3 L = normalize(vec3(-0.30 + uPointer.x * 0.95, -0.50 + uPointer.y * 0.95, 0.62));
  float sp = pow(max(dot(n, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0), 34.0) * mask;
  // slow travelling sheen across the glass
  float band = uv.x * 1.25 + uv.y * 0.45 - mod(uTime * 0.11, 2.6) + 0.6;
  float sheen = smoothstep(0.10, 0.0, abs(band)) * mask * hgt;
  photo += vec3(1.0, 1.0, 0.90) * (sp * 0.42 * uLive + sheen * 0.16);

  // caustic shimmer in the floor reflection
  float refl = smoothstep(0.742, 0.80, uv.y) * (1.0 - mask) * m.b * 0.0;
  photo += refl;

  float fe = smoothstep(0.0, 0.13, uv.x) * smoothstep(0.0, 0.13, 1.0 - uv.x) * smoothstep(0.0, 0.14, uv.y) * smoothstep(0.0, 0.10, 1.0 - uv.y) * inImg;
  vec3 studio = mix(bg, photo, fe);

  // procedural glass that stays crisp when the camera dives into the letters
  vec2 g = p / uRes.y;
  float c1 = sin(g.x * 5.2 + sin(g.y * 3.1 + uTime * 0.45) * 1.7 + uTime * 0.22);
  float c2 = sin(g.y * 7.4 + sin(g.x * 4.3 - uTime * 0.31) * 1.3);
  float ca = smoothstep(0.55, 1.0, c1 * 0.5 + 0.5) * 0.085 + smoothstep(0.62, 1.0, c2 * 0.5 + 0.5) * 0.05;
  vec3 glass = mix(LIME * 0.84, LIME * 1.035, smoothstep(0.0, 1.0, m.g)) + ca;
  float rim  = (1.0 - smoothstep(0.0, 0.012, sd)) * mask;
  glass = mix(glass, DEEP, rim * 0.8);
  glass += vec3(1.0) * smoothstep(0.014, 0.019, sd) * (1.0 - smoothstep(0.019, 0.026, sd)) * 0.35;
  studio = mix(studio, mix(studio, glass, mask), uGlass);

  // ---------------- draft: flat vector on paper ----------------
  vec3 bp = PAPER;
  float line = 1.0 - smoothstep(aa * 0.7, aa * 2.0, abs(sd));
  bp = mix(bp, LIME, mask * uFill);
  bp = mix(bp, DEEP, line * uOutline);

  // ---------------- compose ----------------
  float r = smoothstep(uSweep - 12.0, uSweep + 12.0, p.x);
  vec3 col = mix(studio, bp, r);
  col += LIME * exp(-abs(p.x - uSweep) / 16.0) * 0.5 * uScan;
  col = mix(col, LIME, uFlood);
  col += (hash(p + fract(uTime) * 61.0) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}

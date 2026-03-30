precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform sampler2D uBayer;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 10.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 4; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.48;
  }
  return value;
}

float runePattern(vec2 p) {
  vec2 cell = floor(p * 3.0);
  vec2 f = fract(p * 3.0);
  float id = snoise(cell * 0.73);
  float line = 0.0;

  if (id > 0.3) {
    line = max(line, smoothstep(0.02, 0.0, abs(f.x - 0.5)));
  }
  if (id > -0.1) {
    line = max(line, smoothstep(0.02, 0.0, abs(f.y - 0.5)));
  }
  if (id > 0.5) {
    line = max(line, smoothstep(0.02, 0.0, abs(f.x - f.y)));
  }
  if (id < -0.3) {
    line = max(line, smoothstep(0.02, 0.0, abs(f.x + f.y - 1.0)));
  }

  float circle = length(f - 0.5);
  if (id > 0.6) {
    line = max(line, smoothstep(0.02, 0.0, abs(circle - 0.3)));
  }

  return line;
}

float dither(vec2 pos, float brightness) {
  vec2 tc = mod(pos, 8.0) / 8.0;
  float limit = texture2D(uBayer, tc).r;
  return brightness > limit ? 1.0 : 0.0;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 p = uv * 3.5;
  float t = uTime * 0.12;

  float n1 = fbm(p + vec2(t, t * 0.6));
  float n2 = fbm(p * 1.3 + vec2(n1 * 0.4, t * 0.4));
  float n3 = fbm(p * 2.5 + vec2(t * 0.2, n2 * 0.3));
  float noise = n1 * 0.4 + n2 * 0.35 + n3 * 0.25;
  noise = noise * 0.5 + 0.5;

  vec2 mouseUV = uMouse / uResolution;
  float mouseDist = length(uv - mouseUV);
  float mouseGlow = exp(-mouseDist * mouseDist * 4.0) * 0.06;

  float runeScale = 4.0 + sin(t * 0.5) * 0.5;
  float runes = runePattern(uv * runeScale + vec2(t * 0.05, t * 0.03));
  float runeFade = smoothstep(0.7, 0.3, mouseDist);
  runes *= runeFade * 0.015;

  float fogLayer = smoothstep(0.3, 0.7, n1 * 0.5 + 0.5) * 0.03;

  float vignette = 1.0 - length(uv - 0.5) * 0.9;
  vignette = clamp(vignette, 0.0, 1.0);

  float intensity = noise * vignette * 0.10 + mouseGlow + runes + fogLayer;

  vec3 tealTint = vec3(0.7, 0.95, 1.0);
  vec3 emeraldTint = vec3(0.4, 1.0, 0.6);
  float tintMix = smoothstep(0.4, 0.0, mouseDist);
  vec3 tint = mix(tealTint, emeraldTint, tintMix * 0.35);
  vec3 color = vec3(intensity) * tint;

  float ditherInput = (color.r + color.g + color.b) / 3.0;
  float dithered = dither(gl_FragCoord.xy * 0.5, ditherInput * 4.0);
  color = mix(color, vec3(dithered) * tint * 0.15, 0.35);

  float grain = fract(sin(dot(uv * uTime, vec2(12.9898, 78.233))) * 43758.5453);
  color += (grain - 0.5) * 0.012;

  color = clamp(color, 0.0, 1.0);

  gl_FragColor = vec4(color, 1.0);
}

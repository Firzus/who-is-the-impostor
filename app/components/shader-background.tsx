import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

const VERT_SOURCE = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAG_SOURCE = `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

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
  for (int i = 0; i < 6; i++) {
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
  int x = int(mod(pos.x, 8.0));
  int y = int(mod(pos.y, 8.0));
  int index = x + y * 8;

  float limit = 0.0;
  if (index ==  0) limit = 0.015625;
  if (index ==  1) limit = 0.515625;
  if (index ==  2) limit = 0.140625;
  if (index ==  3) limit = 0.640625;
  if (index ==  4) limit = 0.046875;
  if (index ==  5) limit = 0.546875;
  if (index ==  6) limit = 0.171875;
  if (index ==  7) limit = 0.671875;
  if (index ==  8) limit = 0.765625;
  if (index ==  9) limit = 0.265625;
  if (index == 10) limit = 0.890625;
  if (index == 11) limit = 0.390625;
  if (index == 12) limit = 0.796875;
  if (index == 13) limit = 0.296875;
  if (index == 14) limit = 0.921875;
  if (index == 15) limit = 0.421875;
  if (index == 16) limit = 0.203125;
  if (index == 17) limit = 0.703125;
  if (index == 18) limit = 0.078125;
  if (index == 19) limit = 0.578125;
  if (index == 20) limit = 0.234375;
  if (index == 21) limit = 0.734375;
  if (index == 22) limit = 0.109375;
  if (index == 23) limit = 0.609375;
  if (index == 24) limit = 0.953125;
  if (index == 25) limit = 0.453125;
  if (index == 26) limit = 0.828125;
  if (index == 27) limit = 0.328125;
  if (index == 28) limit = 0.984375;
  if (index == 29) limit = 0.484375;
  if (index == 30) limit = 0.859375;
  if (index == 31) limit = 0.359375;
  if (index == 32) limit = 0.0625;
  if (index == 33) limit = 0.5625;
  if (index == 34) limit = 0.1875;
  if (index == 35) limit = 0.6875;
  if (index == 36) limit = 0.03125;
  if (index == 37) limit = 0.53125;
  if (index == 38) limit = 0.15625;
  if (index == 39) limit = 0.65625;
  if (index == 40) limit = 0.8125;
  if (index == 41) limit = 0.3125;
  if (index == 42) limit = 0.9375;
  if (index == 43) limit = 0.4375;
  if (index == 44) limit = 0.84375;
  if (index == 45) limit = 0.34375;
  if (index == 46) limit = 0.96875;
  if (index == 47) limit = 0.46875;
  if (index == 48) limit = 0.25;
  if (index == 49) limit = 0.75;
  if (index == 50) limit = 0.125;
  if (index == 51) limit = 0.625;
  if (index == 52) limit = 0.28125;
  if (index == 53) limit = 0.78125;
  if (index == 54) limit = 0.15625;
  if (index == 55) limit = 0.65625;
  if (index == 56) limit = 1.0;
  if (index == 57) limit = 0.5;
  if (index == 58) limit = 0.875;
  if (index == 59) limit = 0.375;
  if (index == 60) limit = 0.96875;
  if (index == 61) limit = 0.46875;
  if (index == 62) limit = 0.90625;
  if (index == 63) limit = 0.40625;

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

  float fogLayer = fbm(uv * 2.0 + vec2(t * 0.3, 0.0)) * 0.5 + 0.5;
  fogLayer = smoothstep(0.3, 0.7, fogLayer) * 0.03;

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
}`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef({ value: 0 });
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;

    const vertShader = compileShader(gl, gl.VERTEX_SHADER, VERT_SOURCE);
    const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SOURCE);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "uTime");
    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uMouse = gl.getUniformLocation(program, "uMouse");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);

    gsap.to(timeRef.current, {
      value: 1000,
      duration: 1000,
      ease: "none",
      repeat: -1,
    });

    const render = () => {
      gl.uniform1f(uTime, timeRef.current.value);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseRef.current.x, window.innerHeight - mouseRef.current.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteBuffer(buffer);
    };
  }, [handleMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ pointerEvents: "none" }}
    />
  );
}

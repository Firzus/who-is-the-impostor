import { useEffect, useRef, useCallback } from "react";
import VERT_SOURCE from "@/shaders/background.vert";
import FRAG_SOURCE from "@/shaders/background.frag";

// prettier-ignore
const BAYER_DATA = new Uint8Array([
    4, 131,  36, 163,  12, 139,  44, 171,
  195,  68, 227, 100, 203,  76, 235, 108,
   52, 179,  20, 147,  60, 187,  28, 155,
  243, 116, 211,  84, 251, 124, 219,  92,
   16, 143,  48, 175,   8, 135,  40, 167,
  207,  80, 239, 112, 215,  88, 247, 120,
   64, 191,  32, 159,  72, 199,  40, 167,
  255, 128, 223,  96, 247, 120, 231, 104,
]);

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
  const startTimeRef = useRef(0);
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

    // Bayer dither texture (8x8, LUMINANCE, NEAREST/REPEAT)
    const bayerTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, bayerTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 8, 8, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, BAYER_DATA);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    const uTime = gl.getUniformLocation(program, "uTime");
    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uBayer = gl.getUniformLocation(program, "uBayer");
    gl.uniform1i(uBayer, 0);

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

    const cleanup = () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibility);
      gl.deleteTexture(bayerTex);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteBuffer(buffer);
    };

    // Reduced motion: render one static frame and stop
    if (prefersReducedMotion) {
      gl.uniform1f(uTime, 5.0);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uMouse, canvas.width / 2, canvas.height / 2);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      return cleanup;
    }

    window.addEventListener("mousemove", handleMouseMove);
    startTimeRef.current = performance.now();

    let lastTime = 0;
    let paused = false;

    const render = () => {
      lastTime = (performance.now() - startTimeRef.current) / 1000;
      gl.uniform1f(uTime, lastTime);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseRef.current.x, window.innerHeight - mouseRef.current.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        paused = true;
        cancelAnimationFrame(rafRef.current);
      } else if (paused) {
        paused = false;
        startTimeRef.current = performance.now() - lastTime * 1000;
        rafRef.current = requestAnimationFrame(render);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    render();

    return cleanup;
  }, [handleMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ pointerEvents: "none" }}
    />
  );
}

"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

const vertexSource = `attribute vec2 aPosition; varying vec2 vUv; void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}`;
const fragmentSource = `precision mediump float;
uniform sampler2D uImage; uniform float uTime; uniform vec2 uPointer; uniform float uScroll;
varying vec2 vUv;
void main(){
 vec2 uv=vUv; float t=uTime;
 float field=sin(uv.x*6.8+uv.y*5.2+t*.42)+sin(uv.y*9.0-uv.x*3.0-t*.33)*.65;
 float calm=1.-smoothstep(.28,.65,uv.x)*.5;
 vec2 bend=vec2(sin(uv.y*8.+t*.37+field),cos(uv.x*7.5-t*.3+field))*.0055*calm;
 bend+=uPointer*.0035;
 vec2 coord=clamp(uv+bend+vec2(0.,uScroll*.009),.001,.999);
 vec4 base=texture2D(uImage,coord);
 float ripple=sin(uv.x*5.+uv.y*8.+t*.35+sin(uv.x*4.-t*.25)*1.4);
 float caustic=pow(max(0.,1.-abs(ripple)),22.);
 float edge=pow(max(0.,sin(uv.y*9.-uv.x*6.+t*.22)),30.);
 vec3 tint=vec3(.89,1.,.8);
 base.rgb=mix(base.rgb,tint,caustic*.08*calm);
 base.rgb+=vec3(.04)*edge*calm;
 gl_FragColor=vec4(base.rgb,1.);
}`;

export function LiquidScene({ paused }: { paused: boolean }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const node = canvas.current;
    const box = wrapper.current;
    if (!node || !box) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches || paused) {
      box.dataset.animationActive = "false";
      return;
    }
    const gl = node.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
    if (!gl) {
      box.dataset.renderer = "image";
      return;
    }
    let frame = 0,
      visible = false,
      loaded = false,
      disposed = false,
      lastDraw = 0,
      time = 0;
    let pointerX = 0,
      pointerY = 0,
      smoothX = 0,
      smoothY = 0;
    const resources: WebGLShader[] = [];
    function shader(type: number, source: string) {
      const s = gl!.createShader(type);
      if (!s) throw Error("shader");
      gl!.shaderSource(s, source);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        gl!.deleteShader(s);
        throw Error("compile");
      }
      resources.push(s);
      return s;
    }
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let texture: WebGLTexture | null = null;
    try {
      program = gl.createProgram();
      if (!program) throw Error("program");
      gl.attachShader(program, shader(gl.VERTEX_SHADER, vertexSource));
      gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragmentSource));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error("link");
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const pos = gl.getAttribLocation(program, "aPosition");
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.uniform1i(gl.getUniformLocation(program, "uImage"), 0);
    } catch {
      resources.forEach((s) => gl.deleteShader(s));
      if (program) gl.deleteProgram(program);
      if (buffer) gl.deleteBuffer(buffer);
      if (texture) gl.deleteTexture(texture);
      box.dataset.renderer = "image";
      return;
    }
    const timeUniform = gl.getUniformLocation(program, "uTime");
    const pointerUniform = gl.getUniformLocation(program, "uPointer");
    const scrollUniform = gl.getUniformLocation(program, "uScroll");
    function resize() {
      if (disposed) return;
      const rect = box!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const scale = Math.min(dpr, 1800 / rect.width);
      node!.width = Math.round(rect.width * scale);
      node!.height = Math.round(rect.height * scale);
      gl!.viewport(0, 0, node!.width, node!.height);
    }
    function draw(timestamp: number) {
      frame = 0;
      if (disposed || !visible || document.hidden || media.matches || !loaded)
        return;
      if (timestamp - lastDraw >= 32) {
        const delta = lastDraw
          ? Math.min((timestamp - lastDraw) / 1000, 0.08)
          : 0;
        time += delta;
        lastDraw = timestamp;
        smoothX += (pointerX - smoothX) * 0.06;
        smoothY += (pointerY - smoothY) * 0.06;
        gl!.uniform1f(timeUniform, time);
        gl!.uniform2f(pointerUniform, smoothX, smoothY);
        gl!.uniform1f(
          scrollUniform,
          Math.min(window.scrollY / window.innerHeight, 1),
        );
        gl!.drawArrays(gl!.TRIANGLES, 0, 6);
        node!.style.opacity = "1";
      }
      frame = requestAnimationFrame(draw);
    }
    function sync() {
      cancelAnimationFrame(frame);
      frame = 0;
      lastDraw = 0;
      const active =
        visible && !document.hidden && !media.matches && loaded && !disposed;
      box!.dataset.animationActive = String(active);
      if (active) frame = requestAnimationFrame(draw);
    }
    const source = new window.Image();
    source.onload = () => {
      if (disposed) return;
      gl!.bindTexture(gl!.TEXTURE_2D, texture);
      gl!.texImage2D(
        gl!.TEXTURE_2D,
        0,
        gl!.RGBA,
        gl!.RGBA,
        gl!.UNSIGNED_BYTE,
        source,
      );
      loaded = true;
      resize();
      box!.dataset.renderer = "webgl";
      sync();
    };
    source.src = "/images/hero-scene.webp";
    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.01 },
    );
    intersection.observe(box);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(box);
    const pointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointerX = event.clientX / window.innerWidth - 0.5;
      pointerY = event.clientY / window.innerHeight - 0.5;
    };
    const lost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(frame);
      node!.style.opacity = "0";
      box!.dataset.animationActive = "false";
      box!.dataset.renderer = "image";
    };
    window.addEventListener("pointermove", pointer, { passive: true });
    document.addEventListener("visibilitychange", sync);
    media.addEventListener("change", sync);
    node.addEventListener("webglcontextlost", lost);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      intersection.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", pointer);
      document.removeEventListener("visibilitychange", sync);
      media.removeEventListener("change", sync);
      node.removeEventListener("webglcontextlost", lost);
      source.onload = null;
      resources.forEach((s) => gl.deleteShader(s));
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
      node.style.opacity = "0";
      box.dataset.animationActive = "false";
    };
  }, [paused]);
  return (
    <div className="hero-scene" aria-hidden="true">
      <div
        className="scene-surface"
        ref={wrapper}
        data-animation-active="false"
      >
        <Image
          src="/images/hero-scene.webp"
          width={1536}
          height={1024}
          alt=""
          priority
          sizes="100vw"
        />
        <canvas ref={canvas} />
      </div>
    </div>
  );
}

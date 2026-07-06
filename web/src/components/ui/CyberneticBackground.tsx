import React, { useEffect, useRef, useState, useCallback } from 'react';
import { InlineMath } from 'react-katex';

// Keep standard statistical formulas
const FORMULAS = [
  { tex: "f(x)=\\dfrac{1}{\\sigma\\sqrt{2\\pi}}\\,e^{-\\frac12\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}", cls: "lg" },
  { tex: "P(A\\mid B)=\\dfrac{P(B\\mid A)\\,P(A)}{P(B)}", cls: "alt" },
  { tex: "\\mathbb{E}[X]=\\int_{-\\infty}^{\\infty} x\\,f(x)\\,dx", cls: "" },
  { tex: "\\operatorname{Var}(X)=\\mathbb{E}\\!\\left[(X-\\mu)^2\\right]", cls: "faint" },
  { tex: "\\bar{x}=\\dfrac{1}{n}\\sum_{i=1}^{n} x_i", cls: "sm" },
  { tex: "s^2=\\dfrac{1}{n-1}\\sum_{i=1}^{n}(x_i-\\bar{x})^2", cls: "" },
  { tex: "\\hat{\\theta}=\\arg\\max_{\\theta}\\,L(\\theta\\mid x)", cls: "alt sm" },
  { tex: "Z=\\dfrac{\\bar{X}-\\mu}{\\sigma/\\sqrt{n}}", cls: "" },
  { tex: "H_0:\\,\\mu=\\mu_0", cls: "faint sm" },
  { tex: "p=P(T>t\\mid H_0)", cls: "faint sm" },
  { tex: "\\rho_{X,Y}=\\dfrac{\\operatorname{Cov}(X,Y)}{\\sigma_X\\sigma_Y}", cls: "alt" },
  { tex: "\\hat{y}=\\beta_0+\\beta_1 x", cls: "sm" },
  { tex: "F(x)=P(X\\le x)", cls: "faint sm" },
  { tex: "\\mu=\\sum_{i} x_i\\,p_i", cls: "faint sm" },
  { tex: "\\lim_{n\\to\\infty}\\dfrac{\\bar{X}_n-\\mu}{\\sigma/\\sqrt{n}}\\xrightarrow{d}\\mathcal{N}(0,1)", cls: "lg" },
  { tex: "\\mathcal{N}(\\mu,\\sigma^2)", cls: "alt sm" },
  { tex: "X\\sim\\text{Bin}(n,p)", cls: "faint sm" },
  { tex: "\\hat{\\beta}=(X^{\\top}X)^{-1}X^{\\top}y", cls: "" },
  { tex: "\\int_{-\\infty}^{\\infty} f(x)\\,dx=1", cls: "faint" },
  { tex: "\\sigma^2=\\mathbb{E}[X^2]-(\\mathbb{E}[X])^2", cls: "sm" },
  { tex: "\\text{MSE}=\\mathbb{E}\\!\\left[(\\hat{\\theta}-\\theta)^2\\right]", cls: "alt sm" },
  { tex: "P(X=k)=\\binom{n}{k}p^k(1-p)^{n-k}", cls: "" }
];

interface PlacedChip {
  id: number;
  tex: string;
  cls: string;
  x: number;
  y: number;
  delay: string;
  duration: string;
}

// Reusable function to pick a random spot outside the central focal area
function getRandomPos() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const centerClearW = Math.min(800, W * 0.7);
  const centerClearH = Math.min(600, H * 0.6);

  const inCenter = (x: number, y: number, w: number, h: number) => {
    const cx = W / 2, cy = H / 2;
    return (
      x + w/2 > cx - centerClearW/2 &&
      x - w/2 < cx + centerClearW/2 &&
      y + h/2 > cy - centerClearH/2 &&
      y - h/2 < cy + centerClearH/2
    );
  };

  let x = 0, y = 0, ok = false, tries = 0;
  while (!ok && tries < 40) {
    x = 60 + Math.random() * (W - 120);
    y = 70 + Math.random() * (H - 140);
    ok = !inCenter(x, y, 220, 60);
    tries++;
  }
  return { x, y };
}

export function CyberneticBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chips, setChips] = useState<PlacedChip[]>([]);

  // Calculate random chip placements on mount
  useEffect(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    
    const placed: PlacedChip[] = [];
    // Drastically reduce density (about 5-7 chips on a standard 1080p screen)
    const target = Math.min(FORMULAS.length, Math.floor((W * H) / 180000) + 4);
    const shuffled = [...FORMULAS].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length && placed.length < target; i++) {
      const f = shuffled[i];
      const pos = getRandomPos();

      placed.push({
        id: i,
        tex: f.tex,
        cls: f.cls,
        x: pos.x,
        y: pos.y,
        delay: `${(Math.random() * 8).toFixed(2)}s`,
        duration: `${(15 + Math.random() * 10).toFixed(2)}s`,
      });
    }

    setChips(placed);
  }, []);

  // WebGL Shader setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: true, alpha: true });
    if (!gl) return;

    const vertSrc = `
      attribute vec2 position;
      void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `;

    const fragSrc = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec2 iMouse;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main() {
        vec2 uv    = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
        vec2 mouse = (iMouse - 0.5 * iResolution.xy) / iResolution.y;

        float t         = iTime * 0.08;
        float mouseDist = length(uv - mouse);

        // Gentle warp around mouse
        float warp = sin(mouseDist * 14.0 - t * 2.0) * 0.04;
        warp *= smoothstep(0.45, 0.0, mouseDist);
        uv += warp;

        // Grid lines (finer, softer)
        vec2 gridUv = abs(fract(uv * 8.0) - 0.5);
        float line  = pow(1.0 - min(gridUv.x, gridUv.y), 60.0);

        // Increased opacity/brightness of the grid lines
        vec3 gridColor = vec3(0.18, 0.18, 0.22);
        vec3 color     = gridColor * line * (0.35 + sin(t * 1.5) * 0.08);

        // Energetic pulses - Brass accents (#D4A843 -> 0.83, 0.66, 0.26)
        float energy = sin(uv.x * 14.0 + t * 3.0) * sin(uv.y * 14.0 + t * 2.0);
        energy = smoothstep(0.86, 1.0, energy);
        color += vec3(0.83, 0.66, 0.26) * energy * line * 0.6;

        // Faint glow around mouse - Teal accents (#2EC4B6 -> 0.18, 0.77, 0.71)
        float glow = smoothstep(0.18, 0.0, mouseDist);
        color += vec3(0.18, 0.77, 0.71) * glow * 0.22;

        // Very subtle noise grain
        color += (random(uv + t * 0.05) - 0.5) * 0.03;

        // Background is purely transparent to allow var(--color-background) to show
        color *= 0.95;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function compile(type: number, src: string) {
      const s = gl!.createShader(type);
      if (!s) return null;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.error(gl!.getShaderInfoLog(s));
      }
      return s;
    }

    const program = gl.createProgram();
    if (!program) return;
    const vShader = compile(gl.VERTEX_SHADER, vertSrc);
    const fShader = compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vShader || !fShader) return;

    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1,-1,  1,-1, -1, 1,
      -1, 1,  1,-1,  1, 1
    ]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes   = gl.getUniformLocation(program, 'iResolution');
    const uTime  = gl.getUniformLocation(program, 'iTime');
    const uMouse = gl.getUniformLocation(program, 'iMouse');

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const targetMouse = { ...mouse };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const onMouseMove = (e: MouseEvent) => {
      targetMouse.x = e.clientX * (canvas.width / window.innerWidth);
      targetMouse.y = (window.innerHeight - e.clientY) * (canvas.height / window.innerHeight);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    resize();

    const start = performance.now();
    let animFrame: number;

    const render = () => {
      mouse.x += (targetMouse.x - mouse.x) * 0.04;
      mouse.y += (targetMouse.y - mouse.y) * 0.04;

      const t = (performance.now() - start) / 1000;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animFrame = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animFrame);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen z-[-1] pointer-events-none overflow-hidden bg-[var(--color-background)]">
      {/* WebGL Canvas */}
      <canvas 
        ref={canvasRef} 
        aria-label="Cybernetic grid animated background"
        className="block w-full h-full opacity-100"
      />

      {/* Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.55)_55%,rgba(0,0,0,0.95)_100%)]" />

      {/* Corner Frame Ticks */}
      <div className="absolute top-[22px] left-[22px] w-[22px] h-[22px] border-t border-l border-[var(--color-border)] opacity-60" />
      <div className="absolute top-[22px] right-[22px] w-[22px] h-[22px] border-t border-r border-[var(--color-border)] opacity-60" />
      <div className="absolute bottom-[22px] left-[22px] w-[22px] h-[22px] border-b border-l border-[var(--color-border)] opacity-60" />
      <div className="absolute bottom-[22px] right-[22px] w-[22px] h-[22px] border-b border-r border-[var(--color-border)] opacity-60" />

      {/* HUD Info */}
      <div className="absolute top-[26px] left-[56px] text-[0.62rem] tracking-[0.3em] uppercase text-[var(--color-text-secondary)] opacity-50 hidden sm:block">SYS / GRID-04</div>
      <div className="absolute top-[26px] right-[56px] text-[0.62rem] tracking-[0.3em] uppercase text-[var(--color-text-secondary)] opacity-50 hidden sm:block">FIELD · STOCHASTIC</div>
      <div className="absolute bottom-[26px] left-[56px] text-[0.62rem] tracking-[0.3em] uppercase text-[var(--color-text-secondary)] opacity-50 hidden sm:block">μ = 0 · σ = 1</div>
      <div className="absolute bottom-[26px] right-[56px] text-[0.62rem] tracking-[0.3em] uppercase text-[var(--color-text-secondary)] opacity-50 hidden sm:block">RENDER · LIVE</div>

      {/* Drifting Math Chips */}
      <div className="absolute inset-0">
        {chips.map(chip => (
          <MathChip key={chip.id} initialChip={chip} />
        ))}
      </div>
    </div>
  );
}

// Separate component to handle the mount animation and cycle
function MathChip({ initialChip }: { initialChip: PlacedChip }) {
  const [chip, setChip] = useState(initialChip);

  const handleCycle = useCallback(() => {
    const pos = getRandomPos();
    setChip(prev => ({
      ...prev,
      x: pos.x,
      y: pos.y,
    }));
  }, []);

  // Map the sketch classes to our theme tokens
  let colorClass = "text-[var(--color-text-tertiary)]"; // default
  let dropShadow = "";
  let maxOpacity = "0.3";
  
  if (chip.cls.includes('alt')) {
    colorClass = "text-[var(--color-accent-brass)]";
    dropShadow = "drop-shadow-[0_0_18px_rgba(212,168,67,0.3)]";
    maxOpacity = "0.45";
  } else if (chip.cls.includes('faint')) {
    colorClass = "text-[var(--color-text-tertiary)]";
    maxOpacity = "0.15";
  } else {
    colorClass = "text-[var(--color-text-secondary)]";
    dropShadow = "drop-shadow-[0_0_18px_rgba(138,147,166,0.3)]";
    maxOpacity = "0.45";
  }

  const sizeClass = chip.cls.includes('lg') ? 'text-xl' : chip.cls.includes('sm') ? 'text-xs' : 'text-base';

  return (
    <div 
      className={`absolute whitespace-nowrap select-none will-change-transform math-chip-drift ${colorClass} ${sizeClass} ${dropShadow}`}
      style={{
        left: chip.x,
        top: chip.y,
        '--delay': chip.delay,
        '--duration': chip.duration,
        '--max-opacity': maxOpacity
      } as React.CSSProperties}
      onAnimationIteration={handleCycle}
    >
      <InlineMath math={chip.tex} />
    </div>
  );
}

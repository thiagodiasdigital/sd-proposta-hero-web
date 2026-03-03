"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type HeroState = {
  scale: number;
  x: number;
  y: number;
  blur: number;
  vignette: number;
};

const KEYFRAMES: Array<HeroState & { t: number }> = [
  { t: 0.0, scale: 1.0, x: 0.0, y: 0.0, blur: 0.0, vignette: 0.08 },
  { t: 0.18, scale: 1.08, x: 0.3, y: -0.4, blur: 0.0, vignette: 0.1 },
  { t: 0.36, scale: 1.22, x: 0.8, y: -0.9, blur: 0.4, vignette: 0.12 },
  { t: 0.52, scale: 1.45, x: 1.4, y: -1.5, blur: 1.2, vignette: 0.15 },
  { t: 0.68, scale: 1.76, x: 2.1, y: -2.0, blur: 2.2, vignette: 0.18 },
  { t: 0.82, scale: 2.08, x: 2.8, y: -2.6, blur: 3.4, vignette: 0.22 },
  { t: 1.0, scale: 2.38, x: 3.4, y: -3.0, blur: 4.8, vignette: 0.26 },
];

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeInOut(t: number): number {
  const u = clamp01(t);
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

function mapKeyframes(t: number): HeroState {
  let i = 0;
  while (i < KEYFRAMES.length - 1 && t > KEYFRAMES[i + 1].t) i += 1;

  const a = KEYFRAMES[i];
  const b = KEYFRAMES[Math.min(i + 1, KEYFRAMES.length - 1)];
  const span = b.t - a.t;
  const local = span === 0 ? 0 : (t - a.t) / span;

  return {
    scale: lerp(a.scale, b.scale, local),
    x: lerp(a.x, b.x, local),
    y: lerp(a.y, b.y, local),
    blur: lerp(a.blur, b.blur, local),
    vignette: lerp(a.vignette, b.vignette, local),
  };
}

export function HeroCinematic() {
  const sectionRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress() {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) {
        setProgress(0);
        return;
      }

      const next = clamp01(-rect.top / scrollable);
      setProgress(next);
    }

    function onScrollOrResize() {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateProgress();
      });
    }

    updateProgress();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const eased = easeInOut(progress);
  const state = mapKeyframes(eased);

  return (
    <section ref={sectionRef} className="relative min-h-[260vh] bg-[#0d1117]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            transform: "scale(1.02)",
            filter: `blur(${state.blur}px) brightness(0.86)`,
          }}
        >
          <Image
            src="/images/guindaste-ultra.png"
            alt="Caminhao guindaste SD transportando container"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${state.x * 0.25}%, ${state.y * 0.25}%) scale(${1 + (state.scale - 1) * 0.25})`,
            transformOrigin: "50% 44%",
            filter: "brightness(0.95)",
          }}
        >
          <Image
            src="/images/guindaste-ultra.png"
            alt="Container SD em destaque"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${state.x}%, ${state.y}%) scale(${state.scale})`,
            transformOrigin: "50% 44%",
            willChange: "transform",
          }}
        >
          <Image
            src="/images/guindaste-ultra.png"
            alt="Logo SD em close"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 45%, rgba(0,0,0,0) 44%, rgba(0,0,0,${state.vignette}) 100%)`,
          }}
        />
      </div>
    </section>
  );
}

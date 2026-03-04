"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const FULL_FRAME_COUNT = 145;
const MOBILE_FRAME_COUNT = 73;
const MOBILE_MEDIA_QUERY = "(max-width: 900px), (pointer: coarse)";

function padFrameNumber(frameNumber: number): string {
  return String(frameNumber).padStart(3, "0");
}

function buildFrameNumbers(count: number): number[] {
  const frameNumbers: number[] = [];

  for (let frame = 1; frame <= count; frame += 1) {
    frameNumbers.push(frame);
  }

  return frameNumbers;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function cubicBezierYfromX(x: number, p1x: number, p1y: number, p2x: number, p2y: number): number {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  let t = x;
  for (let i = 0; i < 6; i += 1) {
    const xEstimate = sampleX(t) - x;
    const d = sampleDX(t);
    if (Math.abs(xEstimate) < 1e-6 || Math.abs(d) < 1e-6) break;
    t -= xEstimate / d;
    t = clamp01(t);
  }

  return clamp01(sampleY(t));
}

export function HeroCinematic() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Array<HTMLImageElement | null>>([]);
  const rafRef = useRef<number | null>(null);

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
  });
  const [progress, setProgress] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);

  const frameNumbers = useMemo(
    () => buildFrameNumbers(isMobile ? MOBILE_FRAME_COUNT : FULL_FRAME_COUNT),
    [isMobile],
  );

  const frameSourceCandidates = useMemo(() => {
    if (isMobile) {
      return frameNumbers.map((frameNumber) => {
        const base = `/frames/hero-mobile/frame_${padFrameNumber(frameNumber)}`;
        return [`${base}.avif`, `${base}.webp`];
      });
    }

    return frameNumbers.map((frameNumber) => [`/frames/hero/frame_${padFrameNumber(frameNumber)}.webp`]);
  }, [isMobile, frameNumbers]);

  const preloadPriorityCount = isMobile ? 10 : 18;
  const preloadWorkers = isMobile ? 2 : 4;
  const maxRenderDpr = isMobile ? 1.25 : 2;
  const mainDrawMode: "cover" | "contain" = isMobile ? "contain" : "cover";

  const findBestLoadedFrame = useCallback((targetIndex: number): HTMLImageElement | null => {
    const images = imagesRef.current;
    if (images[targetIndex]) return images[targetIndex];

    for (let offset = 1; offset < images.length; offset += 1) {
      const prev = targetIndex - offset;
      if (prev >= 0 && images[prev]) return images[prev];

      const next = targetIndex + offset;
      if (next < images.length && images[next]) return images[next];
    }

    return null;
  }, []);

  const drawImageToCanvas = useCallback(
    (canvas: HTMLCanvasElement, image: HTMLImageElement, mode: "cover" | "contain", dprCap: number): void => {
      const context = canvas.getContext("2d");
      if (!context) return;

      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      const cssWidth = canvas.clientWidth;
      const cssHeight = canvas.clientHeight;
      const targetWidth = Math.max(1, Math.round(cssWidth * dpr));
      const targetHeight = Math.max(1, Math.round(cssHeight * dpr));

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      context.clearRect(0, 0, targetWidth, targetHeight);

      const scale =
        mode === "cover"
          ? Math.max(targetWidth / image.naturalWidth, targetHeight / image.naturalHeight)
          : Math.min(targetWidth / image.naturalWidth, targetHeight / image.naturalHeight);

      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      const x = (targetWidth - width) / 2;
      const y = (targetHeight - height) / 2;

      context.drawImage(image, x, y, width, height);
    },
    [],
  );

  const drawFrame = useCallback(
    (frameIndex: number): void => {
      const image = findBestLoadedFrame(frameIndex);
      const canvas = canvasRef.current;
      const bgCanvas = bgCanvasRef.current;
      if (!image || !canvas || !bgCanvas) return;

      drawImageToCanvas(bgCanvas, image, "cover", maxRenderDpr);
      drawImageToCanvas(canvas, image, mainDrawMode, maxRenderDpr);
    },
    [drawImageToCanvas, findBestLoadedFrame, mainDrawMode, maxRenderDpr],
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);

    const updateDeviceClass = () => {
      setIsMobile(mediaQuery.matches);
    };

    updateDeviceClass();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateDeviceClass);
      return () => mediaQuery.removeEventListener("change", updateDeviceClass);
    }

    mediaQuery.addListener(updateDeviceClass);
    return () => mediaQuery.removeListener(updateDeviceClass);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let nextToQueue = Math.min(preloadPriorityCount, frameSourceCandidates.length);

    imagesRef.current = Array(frameSourceCandidates.length).fill(null);

    const loadFrame = (index: number, onDone?: () => void) => {
      const sources = frameSourceCandidates[index];
      let sourcePointer = 0;
      const image = new Image();
      image.decoding = "async";

      image.onload = () => {
        if (cancelled) return;
        imagesRef.current[index] = image;
        setLoadedCount((count) => count + 1);
        onDone?.();
      };

      image.onerror = () => {
        if (cancelled) return;
        sourcePointer += 1;
        if (sourcePointer < sources.length) {
          image.src = sources[sourcePointer];
          return;
        }
        onDone?.();
      };

      image.src = sources[sourcePointer];
    };

    for (let index = 0; index < Math.min(preloadPriorityCount, frameSourceCandidates.length); index += 1) {
      loadFrame(index);
    }

    const startWorker = () => {
      const index = nextToQueue;
      nextToQueue += 1;
      if (index >= frameSourceCandidates.length) return;
      loadFrame(index, startWorker);
    };

    for (let worker = 0; worker < preloadWorkers; worker += 1) {
      startWorker();
    }

    return () => {
      cancelled = true;
    };
  }, [frameSourceCandidates, preloadPriorityCount, preloadWorkers]);

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

      setProgress(clamp01(-rect.top / scrollable));
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

  useEffect(() => {
    if (loadedCount === 0 || frameSourceCandidates.length === 0) return;
    const eased = cubicBezierYfromX(progress, 0.22, 0.61, 0.36, 1);
    const frameIndex = Math.round(eased * (frameSourceCandidates.length - 1));
    drawFrame(frameIndex);
  }, [progress, loadedCount, frameSourceCandidates.length, drawFrame]);

  useEffect(() => {
    function onResize() {
      if (frameSourceCandidates.length === 0) return;
      const eased = cubicBezierYfromX(progress, 0.22, 0.61, 0.36, 1);
      const frameIndex = Math.round(eased * (frameSourceCandidates.length - 1));
      drawFrame(frameIndex);
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [progress, frameSourceCandidates.length, drawFrame]);

  return (
    <section ref={sectionRef} className="relative min-h-[260vh] bg-[#0d1117]">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-black">
        <canvas
          ref={bgCanvasRef}
          className="absolute inset-0 h-full w-full blur-[28px] brightness-[0.45] scale-110"
          aria-hidden="true"
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <canvas ref={canvasRef} className="h-full w-full" />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(0,0,0,0)_48%,rgba(0,0,0,0.16)_100%)]" />
      </div>
    </section>
  );
}

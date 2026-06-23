"use client";

import { useEffect, useRef, useState } from "react";

export default function Parallax({
  children,
  speed = 120,
  axis = "y",
  className = "",
  style = {},
}) {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let raf = null;

    const update = () => {
      raf = null;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const center = rect.top + rect.height / 2;
      let progress = (center - vh / 2) / vh;
      progress = Math.max(-1, Math.min(1, progress));
      setOffset(progress * speed);
    };

    const onScroll = () => {
      if (raf == null) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  const transform =
    axis === "x"
      ? `translate3d(${offset}px, 0, 0)`
      : `translate3d(0, ${offset}px, 0)`;

  return (
    <div ref={ref} className={className} style={{ ...style, transform, willChange: "transform" }}>
      {children}
    </div>
  );
}

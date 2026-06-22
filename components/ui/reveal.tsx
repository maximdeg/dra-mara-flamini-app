"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "./cn";
import styles from "./reveal.module.css";

/**
 * Reveal — a progressive entrance animation. It wraps server-rendered content
 * and fades/slides it in once it scrolls into view, but only ever *enhances*:
 * the children are visible by default and the hidden-until-revealed state is
 * applied only when JS runs (via the `html.js` marker) and motion is allowed
 * (see reveal.module.css). With no JS, no `IntersectionObserver`, or
 * `prefers-reduced-motion`, the content is simply shown.
 */
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-revealed={revealed ? "true" : undefined}
      className={cn(styles.reveal, className)}
    >
      {children}
    </div>
  );
}

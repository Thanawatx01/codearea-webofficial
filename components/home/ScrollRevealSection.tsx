"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

type ScrollRevealSectionProps = {
  children: ReactNode;
  className?: string;
};

export default function ScrollRevealSection({
  children,
  className = "",
}: ScrollRevealSectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const baseClass = revealed
    ? "translate-y-0 opacity-100"
    : "translate-y-10 opacity-0";

  return (
    <section
      ref={ref}
      className={`${className} ${baseClass} transition-transform transition-opacity duration-700 ease-out will-change-transform`}
    >
      {children}
    </section>
  );
}

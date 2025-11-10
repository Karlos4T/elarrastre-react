"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ScrollAnimations() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const elements = gsap.utils.toArray<HTMLElement>(".reveal-on-scroll");

      elements.forEach((element, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        const rotateAmount = gsap.utils.random(2, 5) * direction;

        gsap.fromTo(
          element,
          {
            opacity: 0,
            y: 80,
            rotate: rotateAmount,
            scale: 0.94,
          },
          {
            opacity: 1,
            y: 0,
            rotate: 0,
            scale: 1,
            duration: 1.2,
            ease: "elastic.out(1, 0.7)",
            delay: Math.min(0.2, index * 0.02),
            scrollTrigger: {
              trigger: element,
              start: "top 85%",
              once: true,
            },
          }
        );
      });
    });

    return () => {
      ctx.revert();
    };
  }, []);

  return null;
}

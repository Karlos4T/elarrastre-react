"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type HeroRegistrationSectionProps = {
  friendlyCount: number;
  onShowRegistration: () => void;
  onShowCollaborator: () => void;
};

const NUMBER_FORMATTER = new Intl.NumberFormat("es-ES");

export default function HeroRegistrationSection({
  friendlyCount,
  onShowRegistration,
  onShowCollaborator,
}: HeroRegistrationSectionProps) {
  const [recentIncrement, setRecentIncrement] = useState<number | null>(null);
  const previousCountRef = useRef(friendlyCount);
  const incrementTimeoutRef = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [counterActivated, setCounterActivated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || counterActivated) {
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 70%",
      once: true,
      onEnter: () => setCounterActivated(true),
    });

    return () => {
      trigger.kill();
    };
  }, [counterActivated]);

  useEffect(() => {
    if (friendlyCount > previousCountRef.current) {
      const diff = friendlyCount - previousCountRef.current;
      setRecentIncrement(diff);

      if (incrementTimeoutRef.current !== null) {
        window.clearTimeout(incrementTimeoutRef.current);
        incrementTimeoutRef.current = null;
      }

      incrementTimeoutRef.current = window.setTimeout(
        () => setRecentIncrement(null),
        2000
      );
    } else if (friendlyCount < previousCountRef.current) {
      setRecentIncrement(null);
    }

    previousCountRef.current = friendlyCount;

    return () => {
      if (incrementTimeoutRef.current !== null) {
        window.clearTimeout(incrementTimeoutRef.current);
        incrementTimeoutRef.current = null;
      }
    };
  }, [friendlyCount]);

  return (
    <section
      id="registro"
      className="reveal-on-scroll relative flex justify-center gap-10 rounded-[48px] mt-20 lg:items-start"
      ref={sectionRef}
    >
      <div className="hero-actions organic-card hero-actions--poster flex max-w-[800px] flex-col gap-8 rounded-[36px] bg-white p-8 lg:p-10">
        <div className="space-y-6">
          <h2 className="text-4xl font-black leading-tight lg:text-5xl">
            Súmate a la <span className="accent-text">IV Jornada</span>
          </h2>
          <div className="grid gap-3 my-5 sm:grid-cols-2">
            {/* Cuándo */}
            <div className="rounded-2xl border border-[var(--color-ink)]/10 from-[var(--color-cream)]/60 to-white p-4 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink)]/70 mb-1">
                Cuándo
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-[var(--color-ink)] leading-tight">
                  6 de diciembre
                </p>
                <p className="text-sm text-[var(--color-ink)]/70">13:00 h</p>
              </div>
              <p className="mt-2 inline-flex items-center gap-2 rounded-xl text-[var(--color-ink)]">
                Plaza de Villanueva de Bogas
              </p>
            </div>

            {/* Aportación */}
            <div className="rounded-2xl border border-[var(--color-ink)]/10 from-white via-[#FEE7FF]/80 to-[#FFF2C5]/70 p-4 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink)]/70 mb-1">
                Aportación
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-[var(--color-ink)] leading-tight">
                  12 €
                </p>
                <p className="text-sm font-semibold text-[var(--color-ink)]/70">
                  por persona
                </p>
              </div>
              <p className="mt-2 rounded-xl">
                Incluye tapeo, comida, bebida y actividades.
              </p>
            </div>
          </div>

          <p className="text-lg leading-relaxed mt-6 text-[var(--color-ink)]/85 lg:text-xl">
            Una jornada solidaria para apoyar la lucha contra la{" "}
            <span className="highlight-text">ELA</span> con{" "}
            <span className="highlight-text">buena comida</span>, música, deporte
            y actividades para todas las edades. Tu presencia suma y tu
            aportación se destina íntegramente a una asociación en defensa de
            quienes conviven con esta enfermedad.
          </p>

          {/* <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl bg-[var(--color-cloud)] p-6">
              <p className="text-md font-semibold uppercase tracking-wide text-[var(--color-sun)]">
                🍴 Menú solidario
              </p>
              <ul className="mt-3 space-y-2 text-md text-[var(--color-ink)]/90">
                <li>
                  <span className="font-semibold">Tapeo:</span> jamón, queso,
                  choricitos a la sidra, bacon, lacón a la gallega, ensaladilla
                  rusa, paté, patatas fritas, encurtidos y aceitunas.
                </li>
                <li>
                  <span className="font-semibold">Comida:</span> carcamusas
                  toledanas y migas.
                </li>
                <li>
                  <span className="font-semibold">Bebidas:</span> cerveza, vino,
                  refrescos y agua.
                </li>
                <li className="text-[var(--color-ink)]">
                  Y si todo sale según lo previsto, ¡macedonia de frutas de
                  postre!
                </li>
              </ul>
            </div>
          </div> */}
        </div>

        <p className="my-15 rounded-[26px] py-3 pb-7 text-4xl text-center font-semibold text-[var(--color-ink)]">
          Ya somos más de{" "}
          <span className="inline-flex relative counter-chip">
            <RollingCounter
              value={friendlyCount}
              initialValue={counterActivated ? undefined : 0}
              isActive={counterActivated}
            />
            {recentIncrement && (
              <span className="counter-chip__increment">+{recentIncrement}</span>
            )}
          </span>{" "}
          personas apuntadas...
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* <button
            type="button"
            className="button-hero button-hero-blue flex-1 text-lg lg:text-xl"
            onClick={onShowCollaborator}
          >
            ¡Quiero colaborar!
          </button> */}
          <button
            type="button"
            className="button-hero flex-1 text-lg lg:text-xl"
            onClick={onShowRegistration}
          >
            ¡Quiero apuntarme!
          </button>
        </div>
      </div>
    </section>
  );
}

type RollingCounterProps = {
  value: number;
  initialValue?: number;
  isActive?: boolean;
};

function RollingCounter({
  value,
  initialValue,
  isActive = true,
}: RollingCounterProps) {
  const [initialBaseline] = useState(() => initialValue ?? value);
  const valueNodeRef = useRef<HTMLSpanElement | null>(null);
  const previousValueRef = useRef(initialBaseline);
  const displayValueRef = useRef(initialBaseline);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const node = valueNodeRef.current;
    if (!node) {
      previousValueRef.current = value;
      displayValueRef.current = value;
      return;
    }

    const startValue = displayValueRef.current ?? previousValueRef.current;
    const endValue = value;
    if (startValue === endValue) {
      node.textContent = NUMBER_FORMATTER.format(endValue);
      previousValueRef.current = endValue;
      displayValueRef.current = endValue;
      return;
    }

    node.textContent = NUMBER_FORMATTER.format(startValue);
    displayValueRef.current = startValue;
    node.classList.add("rolling-counter__value--spinning");

    const duration = Math.min(
      1600,
      450 + Math.min(Math.abs(endValue - startValue) * 60, 800)
    );
    let startTimestamp: number | null = null;

    const animate = (timestamp: number) => {
      if (startTimestamp === null) {
        startTimestamp = timestamp;
      }

      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(
        startValue + (endValue - startValue) * eased
      );
      displayValueRef.current = currentValue;
      node.textContent = NUMBER_FORMATTER.format(currentValue);

      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(animate);
      } else {
        previousValueRef.current = endValue;
        displayValueRef.current = endValue;
        node.classList.remove("rolling-counter__value--spinning");
        animationFrameRef.current = 0;
      }
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
      node.classList.remove("rolling-counter__value--spinning");
    };
  }, [value, isActive]);

  return (
    <span className="rolling-counter">
      <span
        ref={valueNodeRef}
        className="rolling-counter__value"
      >
        {NUMBER_FORMATTER.format(isActive ? value : initialBaseline)}
      </span>
    </span>
  );
}

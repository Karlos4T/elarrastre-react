"use client";

import Image from "next/image";
import { CSSProperties, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ACTIVITIES = [
    {
        title: "Ruta Ciclista",
        highlight: true,
        description: "Participa en una ruta única para todas las edades",
        image: "/bicis.jpeg",
    },
    {
        title: "Exhibición de coches clásicos",
        highlight: true,
        description: "Un recorrido visual por joyas del motor",
        image: "/clasicos.jpeg",
    },
    { title: "Comida + Aperitivo", description: "" },
    { title: "Castillos Hinchables", description: "" },
    { title: "Sorteos", description: "" },
    { title: "DJs", description: "" },
];

const ACTIVITY_STYLES = [
    {
        className: "edition-card--sunburst",
        primary: "var(--color-sun)",
        secondary: "var(--color-tangerine)",
    },
    {
        className: "edition-card--lagoon",
        primary: "var(--color-sky)",
        secondary: "var(--color-lilac)",
    },
    {
        className: "edition-card--meadow",
        primary: "var(--color-forest)",
        secondary: "var(--color-forest)",
    },
];

export default function ActivitiesSection() {
    const sectionRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (typeof window === "undefined" || !sectionRef.current) return;

        gsap.registerPlugin(ScrollTrigger);

        const cards = Array.from(
            sectionRef.current.querySelectorAll(".activity-card")
        );

        gsap.set(cards, { opacity: 0, y: 40, rotate: -3, scale: 0.92 });

        gsap.to(cards, {
            opacity: 1,
            y: 0,
            rotate: 0,
            scale: 1,
            duration: 1,
            ease: "elastic.out(1,0.7)",
            stagger: 0.12,
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 80%",
                once: true,
            },
        });
    }, []);

    return (
        <section
            id="actividades"
            ref={sectionRef}
            className="reveal-on-scroll flex flex-col gap-8 rounded-[40px] border-4 border-[var(--color-ink)] bg-white/90 p-8 shadow-[0_14px_0_rgba(27,27,31,0.08)] sm:p-12"
        >
            <header className="flex flex-col gap-2 text-center">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-ink)]/60">
                    Actividades
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--color-ink)]">
                    Este año... ¡con más actividades que nunca!
                </h2>
            </header>

            <div className="grid gap-6 md:grid-cols-4">
                {ACTIVITIES.map((activity, index) => {
                    const variant =
                        ACTIVITY_STYLES[index % ACTIVITY_STYLES.length];

                    const toneStyle = {
                        "--edition-accent": variant.primary,
                        "--edition-accent-secondary": variant.secondary
                    } as CSSProperties;

                    return (
                        <article
                            key={activity.title}
                            className={`
                activity-card edition-card relative overflow-hidden flex flex-col gap-4
                p-6 border-4 border-[var(--color-ink)] rounded-[32px] bg-white/[0.85]
                shadow-[0_12px_0_rgba(27,27,31,0.18)]
                ${variant.className}
                ${activity.highlight ? "col-span-2 xl:col-span-2" : ""}
              `}
                            style={toneStyle}
                        >
                            {activity.highlight && (
                                <div className="edition-card__image h-[200px] w-full rounded-[22px] border-4 border-[var(--color-ink)] overflow-hidden relative">
                                    <Image
                                        src={activity.image}
                                        alt={activity.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            <h3
                                className={`font-extrabold text-xl z-10 md:text-2xl text-[var(--color-ink)]`}
                            >
                                {activity.title}
                            </h3>

                            {activity.description && (
                                <p className="text-md font-semibold text-[var(--color-ink)]/80 leading-tight">
                                    {activity.description}
                                </p>
                            )}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
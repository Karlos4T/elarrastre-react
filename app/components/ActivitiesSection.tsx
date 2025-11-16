"use client";

import Image from "next/image";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import Slider from "react-slick";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Activity = {
    title: string;
    highlight?: boolean;
    description: string;
    image?: string;
};

const ACTIVITIES: Activity[] = [
    {
        title: "Ruta Ciclista de MTB",
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
    { title: "Juegos infantiles", description: "" },
    { title: "Tardeo con DJs", description: "" },
    { title: "Sorteos", description: "" },
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
    const [isMobile, setIsMobile] = useState(false);
    const sectionRef = useRef<HTMLElement | null>(null);

    // Separar actividades destacadas y no destacadas
    const highlightedActivities = useMemo(() =>
        ACTIVITIES.filter(activity => activity.highlight), []);

    const nonHighlightedActivities = useMemo(() =>
        ACTIVITIES.filter(activity => !activity.highlight), []);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 767px)");
        const updateIsMobile = () => {
            setIsMobile(mediaQuery.matches);
        };

        updateIsMobile();
        mediaQuery.addEventListener("change", updateIsMobile);
        return () => mediaQuery.removeEventListener("change", updateIsMobile);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        gsap.registerPlugin(ScrollTrigger);
    }, []);

    useEffect(() => {
        if (!sectionRef.current) {
            return;
        }

        const ctx = gsap.context(() => {
            const cards = Array.from(
                sectionRef.current?.querySelectorAll<HTMLElement>(".activity-card") ?? []
            );

            if (!cards.length) {
                return;
            }

            gsap.set(cards, { opacity: 0, y: 40, rotate: -3, scale: 0.92 });

            gsap.to(cards, {
                opacity: 1,
                y: 0,
                rotate: 0,
                scale: 1,
                duration: 1,
                ease: "elastic.out(1, 0.7)",
                stagger: 0.12,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                    once: true,
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, [isMobile]);

    const sliderSettings = useMemo(
        () => ({
            dots: true,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 5000,
            arrows: false,
            adaptiveHeight: true,
            dotsClass: "slick-dots activities-section__dots",
        }),
        []
    );

    const renderActivityCard = (activity: Activity, index: number) => {
        const variant = ACTIVITY_STYLES[index % ACTIVITY_STYLES.length];
        const toneStyle = {
            "--edition-accent": variant.primary,
            "--edition-accent-secondary": variant.secondary,
        } as CSSProperties;

        return (
            <article
                key={activity.title}
                className={`col-span-2 
          activity-card edition-card relative overflow-hidden flex flex-col gap-4
          p-6 border-4 border-[var(--color-ink)] rounded-[32px] bg-white/[0.85]
          shadow-[0_12px_0_rgba(27,27,31,0.18)]
          ${variant.className}
          ${activity.highlight ? "h-full" : "h-auto"}
        `}
                style={toneStyle}
            >
                {activity.highlight && activity.image && (
                    <div className="edition-card__image h-[200px] w-full rounded-[22px] border-4 border-[var(--color-ink)] overflow-hidden relative">
                        <Image
                            src={activity.image}
                            alt={activity.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}

                <h3 className="font-extrabold text-xl z-10 md:text-2xl text-[var(--color-ink)]">
                    {activity.title}
                </h3>

                {activity.description && (
                    <p className="text-md font-semibold text-[var(--color-ink)]/80 leading-tight">
                        {activity.description}
                    </p>
                )}
            </article>
        );
    };

    const renderNonHighlightedSlide = () => (
        <div className="px-2">
            <div className="grid grid-cols-2 gap-4 p-4">
                {nonHighlightedActivities.map((activity, index) => {
                    const variant = ACTIVITY_STYLES[(index + highlightedActivities.length) % ACTIVITY_STYLES.length];
                    const toneStyle = {
                        "--edition-accent": variant.primary,
                        "--edition-accent-secondary": variant.secondary,
                    } as CSSProperties;

                    return (
                        <div
                            key={activity.title}
                            className={`
                activity-card edition-card relative overflow-hidden flex flex-col gap-3
                p-4 border-4 border-[var(--color-ink)] rounded-[24px] bg-white/[0.85]
                shadow-[0_8px_0_rgba(27,27,31,0.18)]
                ${variant.className}
                h-full
              `}
                            style={toneStyle}
                        >
                            <h3 className="font-extrabold z-10 text-lg text-[var(--color-ink)] text-center">
                                {activity.title}
                            </h3>
                            {activity.description && (
                                <p className="text-sm font-semibold text-[var(--color-ink)]/80 leading-tight text-center">
                                    {activity.description}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <section
            id="actividades"
            ref={sectionRef}
            className="reveal-on-scroll flex flex-col gap-8 rounded-[40px] sm:border-4 sm:border-[var(--color-ink)] sm:bg-white/90 sm:shadow-[0_14px_0_rgba(27,27,31,0.08)] sm:p-12"
        >
            <header className="flex flex-col gap-2 text-center">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-ink)]/60">
                    Actividades
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--color-ink)]">
                    Este año... ¡con más actividades que nunca!
                </h2>
            </header>

            {isMobile ? (
                <Slider
                    {...sliderSettings}
                    className="activities-section__slider -mx-4 pb-2"
                >
                    {/* Slides individuales para actividades destacadas */}
                    {highlightedActivities.map((activity, index) => (
                        <div key={activity.title} className="px-2">
                            {renderActivityCard(activity, index)}
                        </div>
                    ))}

                    {/* Slide agrupado para actividades no destacadas */}
                    {renderNonHighlightedSlide()}
                </Slider>
            ) : (
                <div className="grid gap-6 md:grid-cols-4">
                    {ACTIVITIES.map((activity, index) =>
                        renderActivityCard(activity, index)
                    )}
                </div>
            )}
        </section>
    );
}
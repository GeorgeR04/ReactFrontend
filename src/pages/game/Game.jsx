// src/pages/game/Game.jsx (ou src/pages/Games.jsx selon ton projet)
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import BackgroundImage from "../../assets/Image/gamebackground.jpg";
import Hero from "../../components/layout/Hero.jsx";
import CornerBadge from "../../components/ui/CornerBadge.jsx";
import { useRevealOnIntersect } from "../../components/hooks/useRevealOnIntersect.jsx";

function cx(...classes) {
    return classes.filter(Boolean).join(" ");
}

const Games = () => {
    const { ref, step } = useRevealOnIntersect({ threshold: 0.35 });
    const [forceShow, setForceShow] = useState(false);

    // Fallback local: never keep content hidden
    useEffect(() => {
        if (step > 0) return;
        const t = window.setTimeout(() => setForceShow(true), 900);
        return () => window.clearTimeout(t);
    }, [step]);

    const s = forceShow ? 3 : step;

    return (
        <Hero backgroundImage={BackgroundImage}>
            <section className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
                <div
                    ref={ref}
                    className="w-full max-w-2xl rounded-2xl border border-white/10 bg-black/55 p-6 text-center text-white shadow-2xl backdrop-blur sm:p-10"
                >
                    <h1
                        className={cx(
                            "text-balance text-3xl font-semibold tracking-tight sm:text-5xl",
                            "transition-all duration-700 will-change-transform",
                            s >= 1 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
                        )}
                    >
                        Discover Your Next Esport Adventure
                    </h1>

                    <p
                        className={cx(
                            "mx-auto mt-5 text-pretty text-base leading-relaxed text-white/85 sm:text-lg",
                            "transition-all duration-700 delay-150 will-change-transform",
                            s >= 2 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                        )}
                    >
                        Whether you're into FPS, MOBA, or strategy games, this is the ultimate destination to
                        explore the games that fuel the esports ecosystem. Learn about their histories,
                        developers, and the communities that drive them forward.
                    </p>

                    <p
                        className={cx(
                            "mx-auto mt-4 text-pretty text-base leading-relaxed text-white/85 sm:text-lg",
                            "transition-all duration-700 delay-300 will-change-transform",
                            s >= 3 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                        )}
                    >
                        Dive deep into the competitive world of esports games, where every pixel matters and
                        every second counts. It's not just gaming—it's a lifestyle.
                    </p>

                    <div
                        className={cx(
                            "mt-8 transition-all duration-700 delay-500 will-change-transform",
                            s >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                        )}
                    >
                        <Link
                            to="/games/explore"
                            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                        >
                            Explore Games
                        </Link>
                    </div>
                </div>
            </section>

            <CornerBadge>&copy; Battlefield 3</CornerBadge>
        </Hero>
    );
};

export default Games;

// src/pages/Team.jsx
import React from "react";
import { Link } from "react-router-dom";
import BackgroundImage from "../../assets/Image/teamsimage.jpg";

import Hero from "../../components/layout/Hero.jsx";
import CornerBadge from "../../components/ui/CornerBadge.jsx";
import { useRevealOnIntersect } from "../../components/hooks/useRevealOnIntersect.jsx";

function cx(...classes) {
    return classes.filter(Boolean).join(" ");
}

const Team = () => {
    const { ref, step } = useRevealOnIntersect({ threshold: 0.35 });

    return (
        <Hero backgroundImage={BackgroundImage}>
            <section className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
                <div
                    ref={ref}
                    className="w-full max-w-3xl rounded-2xl border border-white/10 bg-black/55 p-6 text-center text-white shadow-2xl backdrop-blur sm:p-10"
                >
                    <h1
                        className={cx(
                            "text-balance text-3xl font-semibold tracking-tight sm:text-5xl",
                            "transition-all duration-700 will-change-transform",
                            step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
                        )}
                    >
                        Teams &amp; Organizations
                    </h1>

                    <p
                        className={cx(
                            "mx-auto mt-5 text-pretty text-base leading-relaxed text-white/85 sm:text-lg",
                            "transition-all duration-700 delay-150 will-change-transform",
                            step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                        )}
                    >
                        Step into the arena—join or form your dream squad, champion the game you love, and carve your place in a legacy of fierce competition.
                    </p>

                    <p
                        className={cx(
                            "mx-auto mt-4 text-pretty text-base leading-relaxed text-white/85 sm:text-lg",
                            "transition-all duration-700 delay-300 will-change-transform",
                            step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                        )}
                    >
                        From rising crews to established organizations, unite under a single banner and explore the teams that are shaking up the scene.
                    </p>

                    <div
                        className={cx(
                            "mt-8 flex flex-wrap justify-center gap-3 transition-all duration-700 delay-500 will-change-transform",
                            step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                        )}
                    >
                        <Link
                            to="/teams/explore"
                            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                        >
                            Explore Teams
                        </Link>

                        <Link
                            to="/organizations/explore"
                            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                        >
                            Explore Organizations
                        </Link>
                    </div>
                </div>
            </section>

            <CornerBadge>&copy; ESL IEM Cologne</CornerBadge>
        </Hero>
    );
};

export default Team;

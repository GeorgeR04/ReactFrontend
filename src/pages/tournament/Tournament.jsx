// src/pages/Tournament.jsx
import React from "react";
import { Link } from "react-router-dom";
import Video from "../../assets/video/BackgroundVideo.mp4";
import Hero from "../../components/layout/Hero.jsx";
import CornerBadge from "../../components/ui/CornerBadge.jsx";
import { useRevealOnIntersect } from "../../components/hooks/useRevealOnIntersect.jsx";

function cx(...classes) {
    return classes.filter(Boolean).join(" ");
}

const Tournament = () => {
    const { ref, step } = useRevealOnIntersect({ threshold: 0.35 });

    return (
        <Hero videoSrc={Video}>
            <section className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
                <div
                    ref={ref}
                    className="w-full max-w-3xl rounded-2xl border border-white/10 bg-black/55 p-6 text-center text-white shadow-2xl backdrop-blur sm:p-10"
                >
                    <h2
                        className={cx(
                            "text-balance text-3xl font-semibold tracking-tight sm:text-5xl",
                            "transition-all duration-700 will-change-transform",
                            step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
                        )}
                    >
                        Tournament
                    </h2>

                    <p
                        className={cx(
                            "mx-auto mt-5 text-pretty text-base leading-relaxed text-white/85 sm:text-lg",
                            "transition-all duration-700 delay-150 will-change-transform",
                            step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                        )}
                    >
                        Step into the realm where dreams are forged and legends are born. This platform isn’t just
                        a tool; it’s a gateway to create something extraordinary. Organizers hold the power to
                        design tournaments that ignite rivalries, unite communities, and showcase the unrelenting
                        spirit of competition.
                    </p>

                    <p
                        className={cx(
                            "mx-auto mt-4 text-pretty text-base leading-relaxed text-white/85 sm:text-lg",
                            "transition-all duration-700 delay-300 will-change-transform",
                            step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                        )}
                    >
                        At the pinnacle stands the{" "}
                        <span className="font-semibold text-white">GEM Gaming Esport Major</span>—the grand arena where only
                        the best dare to tread. Champions from across the globe battle for glory and immortality.
                        This is the ultimate proving ground, a celebration of skill, courage, and passion.
                    </p>

                    <div
                        className={cx(
                            "mt-8 transition-all duration-700 delay-500 will-change-transform",
                            step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                        )}
                    >
                        <Link
                            to="/tournament/gem"
                            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                        >
                            Explore
                        </Link>
                    </div>
                </div>
            </section>

            <CornerBadge>
        <span className="flex flex-col gap-0.5">
          <span>&copy; MLG Major League Gaming 2006 Pro Circuit</span>
          <span>&copy; BLAST Final Singapore 2024</span>
        </span>
            </CornerBadge>
        </Hero>
    );
};

export default Tournament;

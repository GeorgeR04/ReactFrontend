import React, { useEffect, useState } from "react";
import backgroundImage from "../assets/Image/pageImage/background.jpg";

import Hero from "../Components/layout/Hero.jsx";
import CornerBadge from "../Components/ui/CornerBadge.jsx";
import { useRevealOnIntersect } from "../Components/hooks/useRevealOnIntersect.jsx";

function cx(...classes) {
    return classes.filter(Boolean).join(" ");
}

function Home() {
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
        <Hero backgroundImage={backgroundImage}>
            <section className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
                <div
                    ref={ref}
                    className="w-full max-w-4xl rounded-2xl border border-white/10 bg-black/55 p-6 text-center text-white shadow-2xl backdrop-blur sm:p-10"
                >
                    <h1
                        className={cx(
                            "text-balance text-3xl font-semibold tracking-tight sm:text-5xl lg:text-6xl",
                            "transition-all duration-700 will-change-transform",
                            s >= 1 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
                        )}
                    >
                        Gaming Esport Major
                    </h1>

                    <p
                        className={cx(
                            "mx-auto mt-5 max-w-3xl text-pretty text-base leading-relaxed text-white/85 sm:text-lg",
                            "transition-all duration-700 delay-150 will-change-transform",
                            s >= 2 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                        )}
                    >
                        Welcome to Gaming Esport Major, the ultimate battleground where skill, passion, and courage collide.
                        Players from around the world gather here to showcase their talent and dedication,
                        along with organizers and a community of gamers from our global platform. Get ready for a ride full of thrills and surprises.
                    </p>

                    <p
                        className={cx(
                            "mx-auto mt-4 max-w-3xl text-pretty text-base leading-relaxed text-white/85 sm:text-lg",
                            "transition-all duration-700 delay-300 will-change-transform",
                            s >= 3 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                        )}
                    >
                        This is more than just a tournament; it is the proving ground of greatness, a place where dreams take shape,
                        and new heroes rise.
                        <span className="font-semibold text-white"> This is where legends are born.</span>
                    </p>
                </div>
            </section>

            <CornerBadge>&copy; ESL IEM Cologne</CornerBadge>
        </Hero>
    );
}

export default Home;

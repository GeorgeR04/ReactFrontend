import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import bg1 from "../../../assets/Image/tournamentpage/bg1.png";
import bg2 from "../../../assets/Image/tournamentpage/bg4.png";
import bg3 from "../../../assets/Image/tournamentpage/bg2.png";
import bg4 from "../../../assets/Image/tournamentpage/bg3.png";

import logo1 from "../../../assets/Image/tournamentpage/MainLogo.png";
import logo2 from "../../../assets/Image/tournamentpage/Procircuitlogo.png";
import logo3 from "../../../assets/Image/tournamentpage/masterslogo.png";
import logo4 from "../../../assets/Image/tournamentpage/Affiliated.png";

import CornerBadge from "../../../Components/ui/CornerBadge.jsx";

const sections = [
    {
        title: "GEM Gaming Esport Major",
        description:
            "This is the ultimate battleground. The GEM Gaming Esport Major is the most prestigious tournament in the entire ecosystem. " +
            "It’s where only the elite compete players and teams who have fought their way through fire to stand on the grandest stage. " +
            "Every match here is a showcase of peak performance, mental toughness, and relentless ambition. This is where champions are crowned. " +
            "The Major is the dream, the destination, and the reward for those who earn it. If you’re here, you’re not just good you’re one of the best.",
        bg: bg1,
        logo: logo1,
        line: "GEM",
        layout: "left",
    },
    {
        title: "GEM Pro Circuit",
        description:
            "This is where the hunger shows. The GEM Pro Circuit is a fierce, high-stakes battleground where competitors fight for the chance to break into the Major. " +
            "Only the top two from each Pro Circuit event qualify for the GEM Gaming Esport Major. This isn’t for beginners. " +
            "It’s for those on the edge of greatness, ready to push harder, train longer, and rise faster. " +
            "Whether you clawed your way up through the Masters or earned your shot via an S-tier community win, the Pro Circuit is your final trial. " +
            "Survive this and the Major awaits.",
        bg: bg2,
        logo: logo2,
        line: "PRO",
        layout: "right",
    },
    {
        title: "GEM Masters",
        description:
            "The GEM Masters is the open league—where anyone can enter, but only the strong climb out. " +
            "It’s the front door to the professional circuit. The field is wide, the matchups are unpredictable, and the skill ceiling is constantly rising. " +
            "This is the ultimate test of raw talent and drive. If you win a Masters event, you qualify for the Pro Circuit. " +
            "This is your shot to get noticed, to build a name, and to prove that you belong on the path to the Major. Here, underdogs rise. " +
            "Here, the grind begins.",
        bg: bg3,
        logo: logo3,
        line: "MASTERS",
        layout: "left",
    },
    {
        title: "Other Community Tournaments",
        description:
            "These are the community-run tournaments that power the grassroots scene. " +
            "Under the GEM Affiliated banner, organizers from all corners of the community host their own events—sometimes casual, sometimes cutthroat, always passionate. " +
            "These battles are where new players get their first taste of competition, and veterans test their edge. " +
            "And for the top-tier ones—the S-tier events—winning means more than just bragging rights. It’s a ticket straight into the Pro Circuit. " +
            "The GEM Affiliated tournaments are where the fire starts, and for many, where the road to the Major begins.",
        bg: bg4,
        logo: logo4,
        line: "OTHER",
        layout: "right",
    },
];

function cx(...classes) {
    return classes.filter(Boolean).join(" ");
}

const TournamentGEM = () => {
    const navigate = useNavigate();
    const sectionRefs = useRef([]);
    const [activeIndex, setActiveIndex] = useState(0);

    // ✅ Better than scroll listener: IntersectionObserver
    useEffect(() => {
        const prefersReducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // If reduced motion, we still switch instantly, but we keep it stable.
        const observer = new IntersectionObserver(
            (entries) => {
                // pick the most visible entry
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

                if (!visible) return;

                const index = Number(visible.target.getAttribute("data-index"));
                if (!Number.isNaN(index)) setActiveIndex(index);
            },
            {
                threshold: prefersReducedMotion ? 0.35 : [0.35, 0.5, 0.65],
            }
        );

        sectionRefs.current.forEach((el) => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const goTo = (line) => {
        if (line === "GEM") navigate("/tournament/gem/major");
        else if (line === "PRO") navigate("/tournament/gem/pro");
        else if (line === "MASTERS") navigate("/tournament/gem/masters");
        else navigate("/tournament/explore?line=OTHER");
    };

    return (
        <main className="w-full min-h-screen bg-black text-white">
            {sections.map((section, index) => {
                const isVisible = index === activeIndex;

                return (
                    <section
                        key={index}
                        ref={(el) => (sectionRefs.current[index] = el)}
                        data-index={index}
                        className={cx(
                            "relative flex h-screen w-full items-center justify-center overflow-hidden",
                            "transition-opacity duration-700 ease-in-out",
                            isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
                        )}
                        style={{
                            backgroundImage: `url(${section.bg})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                        aria-hidden={!isVisible}
                    >
                        {/* overlays cohérents */}
                        <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" aria-hidden="true" />

                        {/* Content Card */}
                        <div
                            className={cx(
                                "relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8",
                                "flex flex-col items-center justify-between gap-8",
                                "md:flex-row",
                                section.layout === "right" && "md:flex-row-reverse"
                            )}
                        >
                            <div
                                className={cx(
                                    "w-full rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur sm:p-10",
                                    "flex flex-col md:flex-row items-center gap-8",
                                    section.layout === "right" && "md:flex-row-reverse"
                                )}
                            >
                                <img
                                    src={section.logo}
                                    alt={`${section.title} logo`}
                                    className={cx(
                                        "h-40 w-40 object-contain sm:h-48 sm:w-48",
                                        "transition-all duration-700 will-change-transform",
                                        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
                                    )}
                                    loading="lazy"
                                    decoding="async"
                                />

                                <div className="max-w-2xl text-center md:text-left">
                                    <h2
                                        className={cx(
                                            "text-balance text-2xl font-semibold tracking-tight sm:text-4xl",
                                            "transition-all duration-700 will-change-transform",
                                            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                                        )}
                                    >
                                        {section.title}
                                    </h2>

                                    <p
                                        className={cx(
                                            "mt-4 text-pretty text-sm leading-relaxed text-white/85 sm:text-lg",
                                            "transition-all duration-700 delay-150 will-change-transform",
                                            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                                        )}
                                    >
                                        {section.description}
                                    </p>

                                    <div
                                        className={cx(
                                            "mt-6 transition-all duration-700 delay-300 will-change-transform",
                                            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                                        )}
                                    >
                                        <button
                                            onClick={() => goTo(section.line)}
                                            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 transition"
                                        >
                                            Explore
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Corner badge (homogène) */}
                        <CornerBadge>
              <span className="italic text-white/80">
                &copy; GEM {section.line}
              </span>
                        </CornerBadge>
                    </section>
                );
            })}
        </main>
    );
};

export default TournamentGEM;

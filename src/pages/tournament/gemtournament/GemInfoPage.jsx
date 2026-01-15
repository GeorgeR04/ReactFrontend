import React, { useEffect, useState } from "react";
import CornerBadge from "../../../components/ui/CornerBadge.jsx";

function cx(...classes) {
    return classes.filter(Boolean).join(" ");
}

const GemInfoPage = ({ title, description, badge, logo }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 120);
        return () => clearTimeout(t);
    }, []);

    return (
        <main className="min-h-screen bg-black text-white">
            <section className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
                <div
                    className={cx(
                        "w-full max-w-3xl rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur sm:p-10",
                        "transition-all duration-700",
                        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                    )}
                >
                    {/* Logo */}
                    {logo && (
                        <div
                            className={cx(
                                "mx-auto mb-6 flex justify-center",
                                "transition-all duration-700",
                                visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
                            )}
                        >
                            <img
                                src={logo}
                                alt={`${title} logo`}
                                className="h-32 w-auto object-contain sm:h-40"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    )}

                    <h1
                        className={cx(
                            "text-center text-balance text-3xl font-semibold tracking-tight sm:text-5xl",
                            "transition-all duration-700 delay-100",
                            visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
                        )}
                    >
                        {title}
                    </h1>

                    <p
                        className={cx(
                            "mt-6 text-center text-pretty text-base leading-relaxed text-white/85 sm:text-lg",
                            "transition-all duration-700 delay-200",
                            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                        )}
                    >
                        {description}
                    </p>

                    <div
                        className={cx(
                            "mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-sm text-white/70",
                            "transition-opacity duration-700 delay-300",
                            visible ? "opacity-100" : "opacity-0"
                        )}
                    >
                        <p className="italic">Tournament list coming soon…</p>
                    </div>
                </div>
            </section>

            <CornerBadge>
                <span className="italic text-white/80">&copy; GEM {badge}</span>
            </CornerBadge>
        </main>
    );
};

export default GemInfoPage;

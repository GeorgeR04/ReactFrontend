import { useEffect, useRef, useState } from "react";

const DEFAULT_DELAYS = [100, 400, 800];

export function useRevealOnIntersect(options = {}) {
    const threshold = options.threshold ?? 0.3;
    const fallbackMs = options.fallbackMs ?? 600;

    // ✅ IMPORTANT: delays doit être une référence stable
    const delays = options.delays ?? DEFAULT_DELAYS;

    const ref = useRef(null);
    const hasRevealedRef = useRef(false);
    const timersRef = useRef([]);
    const fallbackTimerRef = useRef(null);

    const [step, setStep] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const prefersReducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const clearTimers = () => {
            timersRef.current.forEach((t) => window.clearTimeout(t));
            timersRef.current = [];
            if (fallbackTimerRef.current) {
                window.clearTimeout(fallbackTimerRef.current);
                fallbackTimerRef.current = null;
            }
        };

        const run = () => {
            if (hasRevealedRef.current) return;
            hasRevealedRef.current = true;

            clearTimers();

            const d0 = delays?.[0] ?? 100;
            const d1 = delays?.[1] ?? 400;
            const d2 = delays?.[2] ?? 800;

            timersRef.current.push(window.setTimeout(() => setStep(1), d0));
            timersRef.current.push(window.setTimeout(() => setStep(2), d1));
            timersRef.current.push(window.setTimeout(() => setStep(3), d2));
        };

        if (prefersReducedMotion) {
            setStep(3);
            return;
        }

        // 🔥 Fallback: au cas où l'observer ne déclenche jamais
        fallbackTimerRef.current = window.setTimeout(run, fallbackMs);

        // Si IntersectionObserver n'existe pas, on reveal direct
        if (typeof window === "undefined" || typeof window.IntersectionObserver === "undefined") {
            run();
            return () => clearTimers();
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry?.isIntersecting) {
                    run();
                    observer.disconnect();
                }
            },
            { threshold }
        );

        observer.observe(el);

        return () => {
            observer.disconnect();
            clearTimers();
        };
    }, [threshold, fallbackMs]);

    return { ref, step };
}

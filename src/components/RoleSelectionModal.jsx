import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../security/AuthContext.jsx";
import {apiFetch} from "../config/apiBase.jsx";

export default function RoleSelectionModal({ isOpen, onClose, onSave }) {
    const { token } = useContext(AuthContext);

    const [role, setRole] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [game, setGame] = useState("");

    const [specializations, setSpecializations] = useState([]);
    const [games, setGames] = useState([]);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const modalRef = useRef(null);

    /* =========================
       FETCH DATA ON OPEN
       ========================= */
    useEffect(() => {
        if (!isOpen) return;

        setError("");
        setRole("");
        setSpecialization("");
        setGame("");

        const fetchData = async () => {
            try {
                const [specRes, gameRes] = await Promise.all([
                    apiFetch("/api/specializations", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    apiFetch("/api/games/list"),
                ]);

                setSpecializations(specRes.ok ? await specRes.json() : []);
                setGames(gameRes.ok ? await gameRes.json() : []);
            } catch {
                setSpecializations([]);
                setGames([]);
            }
        };

        fetchData();
        setTimeout(() => modalRef.current?.focus(), 0);
    }, [isOpen, token]);

    /* =========================
       ESC CLOSE
       ========================= */
    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    /* =========================
       SAVE
       ========================= */
    const handleSave = async () => {
        setError("");

        if (!role) {
            setError("Please choose how you want to participate.");
            return;
        }

        if (role === "player") {
            if (!specialization) {
                setError("Please select your specialization.");
                return;
            }
            if (!game) {
                setError("Please select your main game.");
                return;
            }
        }

        setLoading(true);

        try {
            const res = await fetch(
                "http://localhost:8080/api/profile/set-player-details",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        role,
                        specialization: role === "player" ? specialization : null,
                        game: role === "player" ? game : null,
                    }),
                }
            );

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Failed to save role.");
            }

            onSave?.();
            onClose();
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                ref={modalRef}
                tabIndex={-1}
                className="w-full max-w-lg rounded-2xl border border-white/10 bg-black/80 p-6 text-white shadow-2xl backdrop-blur outline-none"
            >
                <h2 className="text-xl font-semibold">Choose your role</h2>
                <p className="mt-1 text-sm text-white/70">
                    This helps us personalize your experience.
                </p>

                {/* ERROR */}
                {error && (
                    <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                        {error}
                    </p>
                )}

                {/* ROLE SELECTION */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                        onClick={() => setRole("player")}
                        className={`rounded-xl border p-4 text-left transition ${
                            role === "player"
                                ? "border-white bg-white/10"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                    >
                        <p className="text-base font-semibold">Player</p>
                        <p className="mt-1 text-sm text-white/70">
                            Compete, join teams, and participate in tournaments.
                        </p>
                    </button>

                    <button
                        onClick={() => setRole("organizer")}
                        className={`rounded-xl border p-4 text-left transition ${
                            role === "organizer"
                                ? "border-white bg-white/10"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                    >
                        <p className="text-base font-semibold">Organizer</p>
                        <p className="mt-1 text-sm text-white/70">
                            Create tournaments and manage competitions.
                        </p>
                    </button>
                </div>

                {/* PLAYER DETAILS */}
                {role === "player" && (
                    <div className="mt-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/80">
                                Specialization
                            </label>
                            <select
                                value={specialization}
                                onChange={(e) => setSpecialization(e.target.value)}
                                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 [&>option]:bg-neutral-900 [&>option]:text-white"
                            >
                                <option value="">Choose your specialization</option>
                                {specializations.map((s) => (
                                    <option key={s.id} value={s.name}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80">
                                Main game
                            </label>
                            <select
                                value={game}
                                onChange={(e) => setGame(e.target.value)}
                                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 [&>option]:bg-neutral-900 [&>option]:text-white"
                            >
                                <option value="">Choose your main game</option>
                                {games.map((g) => (
                                    <option key={g.id} value={g.name}>
                                        {g.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* ACTIONS */}
                <div className="mt-8 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

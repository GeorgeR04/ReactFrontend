import React, { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../security/AuthContext.jsx";

const RoleSelectionModal = ({ isOpen, onClose, onSave }) => {
    const { token } = useContext(AuthContext);

    const [role, setRole] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [game, setGame] = useState("");

    const [specializations, setSpecializations] = useState([]);
    const [games, setGames] = useState([]);

    const [error, setError] = useState("");
    const modalRef = useRef(null);

    // Fetch data when modal opens
    useEffect(() => {
        if (!isOpen) return;

        const fetchSpecializations = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/specializations", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSpecializations(res.ok ? await res.json() : []);
            } catch {
                setSpecializations([]);
            }
        };

        const fetchGames = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/games/list", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setGames(res.ok ? await res.json() : []);
            } catch {
                setGames([]);
            }
        };

        fetchSpecializations();
        fetchGames();

        // focus modal
        setTimeout(() => modalRef.current?.focus(), 0);
    }, [isOpen, token]);

    // ESC close
    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    const handleSave = async () => {
        setError("");

        if (!role) {
            setError("Please select a role.");
            return;
        }

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
                        specialization: role === "player" ? specialization || null : null,
                        game: role === "player" ? game || null : null,
                    }),
                }
            );

            if (!res.ok) throw new Error("Failed to save role details.");

            onSave?.();
            onClose();
        } catch (err) {
            setError(err.message || "An error occurred.");
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Role selection"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                ref={modalRef}
                tabIndex={-1}
                className="w-full max-w-md rounded-2xl border border-white/10 bg-black/80 p-6 text-white shadow-2xl backdrop-blur outline-none"
            >
                <h2 className="text-lg font-semibold">Select your role</h2>
                <p className="mt-1 text-sm text-white/70">
                    Choose how you want to participate in the platform.
                </p>

                {error && (
                    <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                        {error}
                    </p>
                )}

                {/* Role */}
                <div className="mt-5">
                    <label className="block text-sm font-medium text-white/80">
                        Role
                    </label>
                    <select
                        value={role}
                        onChange={(e) => {
                            setRole(e.target.value);
                            setSpecialization("");
                            setGame("");
                        }}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                        <option value="">Choose a role</option>
                        <option value="player">Player</option>
                        <option value="organizer">Organizer</option>
                    </select>
                </div>

                {/* Specialization */}
                {role === "player" && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-white/80">
                            Specialization
                        </label>
                        <select
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                        >
                            <option value="">Choose specialization</option>
                            {specializations.map((s) => (
                                <option key={s.id} value={s.name}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Game */}
                {role === "player" && specialization && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-white/80">
                            Game
                        </label>
                        <select
                            value={game}
                            onChange={(e) => setGame(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                        >
                            <option value="">Choose game</option>
                            {games.map((g) => (
                                <option key={g.id} value={g.name}>
                                    {g.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-white/90"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionModal;

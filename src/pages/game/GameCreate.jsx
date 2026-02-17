import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutThunk } from "../../store/slices/authSlice.js";
import ImagePicker from "../../components/ui/ImagePicker.jsx";
import { apiFetch } from "../../config/apiBase.jsx";

function Section({ title, children }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold">{title}</h2>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

const GameCreate = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const token = useSelector((s) => s.auth.token);
    const cleanToken = useMemo(
        () => (typeof token === "string" ? token.trim().replace(/^Bearer\s+/i, "") : ""),
        [token]
    );

    const [form, setForm] = useState({
        name: "",
        type: "",
        description: "",
        rules: "",
        tutorial: "",
        maxPlayers: "",
        yearOfExistence: "",
        publisher: "",
        platforms: [],
        gameImage: null,
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const togglePlatform = (p) =>
        update(
            "platforms",
            form.platforms.includes(p) ? form.platforms.filter((x) => x !== p) : [...form.platforms, p]
        );

    const on401 = () => {
        dispatch(logoutThunk());
        navigate("/login", { replace: true });
    };

    const handleSubmit = async () => {
        setError("");

        if (!cleanToken) return on401();

        if (!form.name || !form.type || !form.description || !form.gameImage) {
            setError("Please fill all required fields.");
            return;
        }

        const payload = {
            name: form.name,
            type: form.type,
            description: form.description,
            rules: form.rules,
            tutorial: form.tutorial,
            maxPlayersPerTeam: form.maxPlayers ? parseInt(form.maxPlayers, 10) : null,
            yearOfExistence: form.yearOfExistence ? parseInt(form.yearOfExistence, 10) : null,
            publisher: form.publisher,
            platforms: form.platforms,
            gameImage: form.gameImage,
        };

        setLoading(true);

        try {
            const res = await apiFetch("/game-requests", {
                method: "POST",
                headers: { Authorization: `Bearer ${cleanToken}` },
                body: payload,
            });

            if (res.status === 401) return on401();

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Failed to submit game request.");
            }

            navigate("/games/explore");
        } catch (e) {
            setError(e.message || "Submission failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <section className="mx-auto max-w-5xl px-4 py-12 space-y-6">
                <h1 className="text-3xl font-semibold text-center sm:text-4xl">
                    Submit Game for Approval
                </h1>

                <p className="text-center text-sm text-white/60">
                    Your game will be reviewed by a moderator before being published.
                </p>

                {error && (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </div>
                )}

                <Section title="General Information">
                    <input
                        placeholder="Game name *"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                    />
                    <input
                        placeholder="Game type (FPS, MOBA…) *"
                        value={form.type}
                        onChange={(e) => update("type", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                    />
                    <textarea
                        placeholder="Description *"
                        rows={4}
                        value={form.description}
                        onChange={(e) => update("description", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                    />
                </Section>

                <Section title="Game Details">
                    <input
                        type="number"
                        placeholder="Max players per team"
                        value={form.maxPlayers}
                        onChange={(e) => update("maxPlayers", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                    />
                    <input
                        type="number"
                        placeholder="Year of existence"
                        value={form.yearOfExistence}
                        onChange={(e) => update("yearOfExistence", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                    />
                    <input
                        placeholder="Publisher"
                        value={form.publisher}
                        onChange={(e) => update("publisher", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                    />
                </Section>

                <Section title="Platforms">
                    <div className="flex gap-4">
                        {["PC", "PlayStation", "Xbox"].map((p) => (
                            <label key={p} className="text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.platforms.includes(p)}
                                    onChange={() => togglePlatform(p)}
                                    className="mr-2"
                                />
                                {p}
                            </label>
                        ))}
                    </div>
                </Section>

                <Section title="Game Image *">
                    <ImagePicker
                        label="Choose game image"
                        value={form.gameImage}
                        onChange={(img) => update("gameImage", img)}
                    />
                </Section>

                <div className="flex justify-center">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50"
                    >
                        {loading ? "Submitting…" : "Submit for approval"}
                    </button>
                </div>
            </section>
        </main>
    );
};

export default GameCreate;

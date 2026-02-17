import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const GameEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const token = useSelector((s) => s.auth.token);
    const cleanToken = useMemo(
        () => (typeof token === "string" ? token.trim().replace(/^Bearer\s+/i, "") : ""),
        [token]
    );

    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);

    const on401 = () => {
        dispatch(logoutThunk());
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        if (!cleanToken) return on401();

        const fetchGame = async () => {
            try {
                const res = await apiFetch(`/games/${id}`, {
                    headers: { Authorization: `Bearer ${cleanToken}` },
                });

                if (res.status === 401) return on401();
                if (!res.ok) throw new Error();

                const data = await res.json();
                setForm({
                    name: data.name || "",
                    type: data.type || "",
                    description: data.description || "",
                    rules: data.rules || "",
                    tutorial: data.tutorial || "",
                    maxPlayers: data.maxPlayersPerTeam ?? "",
                    yearOfExistence: data.yearOfExistence ?? "",
                    publisher: data.publisher || "",
                    platforms: data.platforms || [],
                    gameImage: data.gameImage || null,
                });
            } catch {
                setForm(null);
            } finally {
                setLoading(false);
            }
        };

        fetchGame();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, cleanToken]);

    const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const togglePlatform = (p) =>
        update(
            "platforms",
            form.platforms.includes(p) ? form.platforms.filter((x) => x !== p) : [...form.platforms, p]
        );

    const handleUpdate = async () => {
        if (!form?.name || !form?.type || !form?.description) {
            alert("Missing required fields.");
            return;
        }

        const payload = {
            name: form.name,
            type: form.type,
            description: form.description,
            rules: form.rules,
            tutorial: form.tutorial,
            maxPlayersPerTeam: form.maxPlayers !== "" ? parseInt(form.maxPlayers, 10) : null,
            yearOfExistence: form.yearOfExistence !== "" ? parseInt(form.yearOfExistence, 10) : null,
            publisher: form.publisher,
            platforms: form.platforms,
            gameImage: form.gameImage,
        };

        try {
            const res = await apiFetch(`/games/${id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${cleanToken}` },
                body: payload,
            });

            if (res.status === 401) return on401();

            if (!res.ok) {
                alert(await res.text());
                return;
            }

            navigate(`/games/${id}`);
        } catch {
            alert("Failed to update game.");
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
                <p className="text-white/70">Loading game…</p>
            </main>
        );
    }

    if (!form) {
        return (
            <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
                <p className="text-red-400">Game not found.</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <section className="mx-auto max-w-5xl px-4 py-12 space-y-6">
                <h1 className="text-3xl font-semibold text-center sm:text-4xl">Modify Game</h1>

                <Section title="General Information">
                    <input
                        placeholder="Game name"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                    />
                    <input
                        placeholder="Game type"
                        value={form.type}
                        onChange={(e) => update("type", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                    />
                    <textarea
                        rows={4}
                        placeholder="Description"
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

                <Section title="Game Image">
                    <ImagePicker
                        label="Choose game image"
                        value={form.gameImage}
                        onChange={(img) => update("gameImage", img)}
                    />
                </Section>

                <div className="flex justify-center">
                    <button
                        onClick={handleUpdate}
                        className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-white/90"
                    >
                        Save Changes
                    </button>
                </div>
            </section>
        </main>
    );
};

export default GameEdit;

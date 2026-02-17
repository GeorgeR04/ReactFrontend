import React, { useState, useEffect } from "react";
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

const TournamentCreate = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const token = useSelector((s) => s.auth.token);
    const user = useSelector((s) => s.auth.user);
    const cleanToken = (token || "").trim();

    const [games, setGames] = useState([]);
    const [loadingGames, setLoadingGames] = useState(true);

    const [form, setForm] = useState({
        name: "",
        description: "",
        type: "solo",
        maxTeams: "",
        gameId: "",
        minRankRequirement: "",
        maxRankRequirement: "",
        trustFactorRequirement: "",
        visibility: "public",
        cashPrize: "",
        image: null,
    });

    useEffect(() => {
        if (!cleanToken) {
            navigate("/login", { replace: true });
            return;
        }

        // (optionnel) si tu veux hard-block ici aussi
        if (user?.role && user.role !== "organizer") {
            navigate("/tournament/explore", { replace: true });
            return;
        }

        const fetchGames = async () => {
            try {
                const res = await apiFetch("/api/games/list", {
                    headers: { Authorization: `Bearer ${cleanToken}` },
                });

                if (res.status === 401) {
                    dispatch(logoutThunk());
                    navigate("/login", { replace: true });
                    return;
                }

                if (res.ok) setGames(await res.json());
            } finally {
                setLoadingGames(false);
            }
        };

        fetchGames();
    }, [cleanToken, user?.role, dispatch, navigate]);

    const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    const handleCreate = async () => {
        if (!form.maxTeams || Number(form.maxTeams) <= 0) {
            alert("Please provide a valid max players / teams value.");
            return;
        }

        if (
            form.minRankRequirement &&
            form.maxRankRequirement &&
            Number(form.minRankRequirement) > Number(form.maxRankRequirement)
        ) {
            alert("Minimum rank cannot exceed maximum rank.");
            return;
        }

        const payload = {
            ...form,
            maxTeams: parseInt(form.maxTeams, 10),
            minRankRequirement: form.minRankRequirement ? parseInt(form.minRankRequirement, 10) : null,
            maxRankRequirement: form.maxRankRequirement ? parseInt(form.maxRankRequirement, 10) : null,
            trustFactorRequirement: form.trustFactorRequirement
                ? parseInt(form.trustFactorRequirement, 10)
                : null,
            cashPrize: form.cashPrize ? parseFloat(form.cashPrize) : 0,
        };

        try {
            const res = await apiFetch("/tournaments/create", {
                method: "POST",
                headers: { Authorization: `Bearer ${cleanToken}` },
                body: payload, // apiFetch gère JSON.stringify + Content-Type
            });

            if (res.status === 401) {
                dispatch(logoutThunk());
                navigate("/login", { replace: true });
                return;
            }

            if (!res.ok) {
                const err = await res.text();
                alert(err || "Failed to create tournament.");
                return;
            }

            navigate("/tournament/explore");
        } catch {
            alert("Failed to create tournament.");
        }
    };

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
                <h1 className="text-3xl font-semibold text-center sm:text-4xl">Create Tournament</h1>

                <Section title="General Information">
                    <input
                        placeholder="Tournament name"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    />
                    <textarea
                        placeholder="Description"
                        value={form.description}
                        onChange={(e) => update("description", e.target.value)}
                        rows={4}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    />
                </Section>

                <Section title="Game & Format">
                    <select
                        value={form.gameId}
                        onChange={(e) => update("gameId", e.target.value)}
                        disabled={loadingGames}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    >
                        <option value="">{loadingGames ? "Loading games…" : "Select game"}</option>
                        {games.map((g) => (
                            <option key={g.id} value={g.id}>
                                {g.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={form.type}
                        onChange={(e) => update("type", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    >
                        <option value="solo">Solo</option>
                        <option value="team">Team</option>
                    </select>

                    <input
                        type="number"
                        placeholder={form.type === "team" ? "Max teams" : "Max players"}
                        value={form.maxTeams}
                        onChange={(e) => update("maxTeams", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    />
                </Section>

                <Section title="Requirements">
                    <input
                        type="number"
                        placeholder="Min rank"
                        value={form.minRankRequirement}
                        onChange={(e) => update("minRankRequirement", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    />
                    <input
                        type="number"
                        placeholder="Max rank"
                        value={form.maxRankRequirement}
                        onChange={(e) => update("maxRankRequirement", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    />
                    <input
                        type="number"
                        placeholder="Trust factor requirement"
                        value={form.trustFactorRequirement}
                        onChange={(e) => update("trustFactorRequirement", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    />
                </Section>

                <Section title="Visibility & Rewards">
                    <select
                        value={form.visibility}
                        onChange={(e) => update("visibility", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>

                    <input
                        type="number"
                        placeholder="Cash prize"
                        value={form.cashPrize}
                        onChange={(e) => update("cashPrize", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    />

                    <ImagePicker
                        label="Choose tournament image"
                        value={form.image}
                        onChange={(img) => update("image", img)}
                    />
                </Section>

                <div className="flex justify-center">
                    <button
                        onClick={handleCreate}
                        className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-white/90"
                    >
                        Create Tournament
                    </button>
                </div>
            </section>
        </main>
    );
};

export default TournamentCreate;

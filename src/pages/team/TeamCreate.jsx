import React, { useEffect, useMemo, useState } from "react";
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

const TeamCreate = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const token = useSelector((s) => s.auth.token);
    const user = useSelector((s) => s.auth.user);

    const cleanToken = useMemo(
        () => (typeof token === "string" ? token.trim().replace(/^Bearer\s+/i, "") : ""),
        [token]
    );

    const [games, setGames] = useState([]);
    const [loadingGames, setLoadingGames] = useState(true);

    const [form, setForm] = useState({
        name: "",
        gameId: "",
        teamLogo: null,
    });

    useEffect(() => {
        if (!cleanToken) {
            navigate("/login", { replace: true });
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
    }, [cleanToken, dispatch, navigate]);

    const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    const handleCreate = async () => {
        if (!form.name || !form.gameId) {
            alert("Please fill all required fields.");
            return;
        }
        if (!user?.username) {
            alert("Missing user info. Please re-login.");
            dispatch(logoutThunk());
            navigate("/login", { replace: true });
            return;
        }

        const payload = {
            name: form.name,
            gameId: form.gameId,
            teamLeaderId: user.username,
            playerIds: [user.username],
            teamLogo: form.teamLogo,
        };

        try {
            const res = await apiFetch("/api/teams", {
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
                const txt = await res.text();
                alert(txt || "Failed to create team.");
                return;
            }

            navigate("/teams/explore");
        } catch {
            alert("Failed to create team.");
        }
    };

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <section className="mx-auto max-w-4xl px-4 py-12 space-y-6">
                <h1 className="text-3xl font-semibold text-center sm:text-4xl">Create Team</h1>

                <Section title="Team Information">
                    <input
                        placeholder="Team name"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    />

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
                </Section>

                <Section title="Team Logo">
                    <ImagePicker label="Choose team logo" value={form.teamLogo} onChange={(img) => update("teamLogo", img)} />
                </Section>

                <div className="flex justify-center">
                    <button
                        onClick={handleCreate}
                        className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-white/90"
                    >
                        Create Team
                    </button>
                </div>
            </section>
        </main>
    );
};

export default TeamCreate;

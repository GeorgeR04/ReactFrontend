import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const TournamentEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const token = useSelector((s) => s.auth.token);
    const cleanToken = (token || "").trim();

    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!cleanToken) {
            navigate("/login", { replace: true });
            return;
        }

        const fetchTournament = async () => {
            try {
                const res = await apiFetch(`/api/tournaments/${id}`, {
                    headers: { Authorization: `Bearer ${cleanToken}` },
                });

                if (res.status === 401) {
                    dispatch(logoutThunk());
                    navigate("/login", { replace: true });
                    return;
                }

                if (!res.ok) throw new Error();
                setTournament(await res.json());
            } catch {
                setTournament(null);
            } finally {
                setLoading(false);
            }
        };

        fetchTournament();
    }, [id, cleanToken, dispatch, navigate]);

    const update = (key, value) => setTournament((t) => ({ ...(t || {}), [key]: value }));

    const handleUpdate = async () => {
        try {
            const res = await apiFetch(`/api/tournaments/${id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${cleanToken}` },
                body: tournament, // apiFetch gère JSON.stringify + Content-Type
            });

            if (res.status === 401) {
                dispatch(logoutThunk());
                navigate("/login", { replace: true });
                return;
            }

            if (!res.ok) {
                alert("Failed to update tournament.");
                return;
            }

            navigate(`/tournament/explore/${id}`);
        } catch {
            alert("Error updating tournament.");
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
                <p className="text-white/70">Loading tournament…</p>
            </main>
        );
    }

    if (!tournament) {
        return (
            <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
                <p className="text-red-400">Tournament not found.</p>
            </main>
        );
    }

    const hasParticipants = (tournament.participatingIds?.length || 0) > 0;

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <section className="mx-auto max-w-5xl px-4 py-12 space-y-6">
                <h1 className="text-3xl font-semibold text-center sm:text-4xl">Edit Tournament</h1>

                <Section title="General Information">
                    <input
                        value={tournament.name || ""}
                        onChange={(e) => update("name", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                        placeholder="Tournament name"
                    />

                    <textarea
                        value={tournament.description || ""}
                        onChange={(e) => update("description", e.target.value)}
                        rows={4}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                        placeholder="Description"
                    />

                    <input
                        type="number"
                        value={tournament.cashPrize ?? 0}
                        onChange={(e) => update("cashPrize", parseFloat(e.target.value) || 0)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                        placeholder="Cash prize"
                    />
                </Section>

                <Section title="Format">
                    <select
                        value={tournament.type || "solo"}
                        disabled={hasParticipants}
                        onChange={(e) => update("type", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white disabled:opacity-50"
                    >
                        <option value="solo">Solo</option>
                        <option value="team">Team</option>
                    </select>

                    <input
                        type="number"
                        value={tournament.maxTeams ?? 0}
                        onChange={(e) => update("maxTeams", parseInt(e.target.value, 10) || 0)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                        placeholder={tournament.type === "solo" ? "Max players" : "Max teams"}
                    />

                    {hasParticipants && (
                        <p className="text-xs text-yellow-400">
                            Tournament type cannot be changed once participants have joined.
                        </p>
                    )}
                </Section>

                <Section title="Visibility & Requirements">
                    <select
                        value={tournament.visibility || "public"}
                        onChange={(e) => update("visibility", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>

                    <input
                        type="number"
                        value={tournament.trustFactorRequirement ?? 0}
                        onChange={(e) => update("trustFactorRequirement", parseInt(e.target.value, 10) || 0)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                        placeholder="Trust factor requirement"
                    />
                </Section>

                <Section title="Tournament Image">
                    <ImagePicker
                        label="Choose tournament image"
                        value={tournament.image}
                        onChange={(img) => update("image", img)}
                    />
                </Section>

                <div className="flex justify-center">
                    <button
                        onClick={handleUpdate}
                        className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-white/90"
                    >
                        Update Tournament
                    </button>
                </div>
            </section>
        </main>
    );
};

export default TournamentEdit;

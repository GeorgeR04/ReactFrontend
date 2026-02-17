import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutThunk } from "../../store/slices/authSlice.js";
import { apiFetch } from "../../config/apiBase.jsx";

function Section({ title, children }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold">{title}</h2>
            {children}
        </div>
    );
}

const TeamDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const token = useSelector((s) => s.auth.token);
    const user = useSelector((s) => s.auth.user);

    const cleanToken = useMemo(
        () => (typeof token === "string" ? token.trim().replace(/^Bearer\s+/i, "") : ""),
        [token]
    );

    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const headers = {};
                if (cleanToken) headers.Authorization = `Bearer ${cleanToken}`;

                const res = await apiFetch(`/api/teams/${id}`, { headers });

                if (res.status === 401) {
                    dispatch(logoutThunk());
                    navigate("/login", { replace: true });
                    return;
                }

                if (!res.ok) throw new Error();
                setTeam(await res.json());
            } catch {
                setTeam(null);
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, [id, cleanToken, dispatch, navigate]);

    if (loading) {
        return (
            <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
                <p className="text-white/70">Loading team…</p>
            </main>
        );
    }

    if (!team) {
        return (
            <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
                <p className="text-red-400">Team not found.</p>
            </main>
        );
    }

    const isMember = team.playerIds?.includes(user?.username);

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
                <div className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur flex flex-col sm:flex-row items-center gap-6">
                    <div className="h-32 w-32 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
                        {team.teamLogo ? (
                            <img
                                src={`data:image/jpeg;base64,${team.teamLogo}`}
                                alt={team.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-sm text-white/40">No logo</span>
                        )}
                    </div>

                    <div>
                        <h1 className="text-2xl font-semibold sm:text-3xl">{team.name}</h1>
                        <p className="mt-1 text-sm text-white/70">Game: {team.gameName}</p>
                        <p className="mt-1 text-sm text-white/60">Members: {team.playerIds?.length || 0}</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6">
                        <Section title="Overview">
                            <ul className="space-y-1 text-sm text-white/80">
                                <li>
                                    <span className="text-white/60">Team Leader:</span> {team.teamLeaderId}
                                </li>
                                <li>
                                    <span className="text-white/60">Game:</span> {team.gameName}
                                </li>
                            </ul>
                        </Section>

                        {isMember && (
                            <Section title="Member Actions">
                                <p className="text-sm text-white/70">You are a member of this team.</p>
                            </Section>
                        )}
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <Section title="Team Members">
                            {team.playerIds?.length ? (
                                <ul className="grid gap-3 sm:grid-cols-2">
                                    {team.playerIds.map((player, i) => (
                                        <li key={i} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
                                            {player}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-white/60">No members found.</p>
                            )}
                        </Section>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="rounded-xl border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold hover:bg-white/10"
                    >
                        Go back
                    </button>
                </div>
            </section>
        </main>
    );
};

export default TeamDetail;

import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../security/AuthContext.jsx";
import {apiFetch} from "../../config/apiBase.jsx";

const TeamExplore = () => {
    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [teams, setTeams] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await apiFetch("/api/teams");
                if (res.ok) {
                    const data = await res.json();
                    setTeams(data);
                    setFiltered(data);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    useEffect(() => {
        setFiltered(
            teams.filter((t) =>
                t.name.toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [search, teams]);

    if (loading) {
        return (
            <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
                <p className="text-white/70">Loading teams…</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-semibold text-center sm:text-4xl">
                    Explore Teams
                </h1>

                {/* Create Team */}
                {user?.role === "player" && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate("/teams/create")}
                            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-white/90"
                        >
                            Create Team
                        </button>
                    </div>
                )}

                {/* Search */}
                <div className="mt-10 max-w-md mx-auto">
                    <input
                        placeholder="Search team…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    />
                </div>

                {/* List */}
                {filtered.length === 0 ? (
                    <p className="mt-12 text-center text-white/60">
                        No teams found.
                    </p>
                ) : (
                    <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((team) => (
                            <li
                                key={team.id}
                                className="rounded-2xl border border-white/10 bg-black/55 p-4 shadow-2xl backdrop-blur"
                            >
                                {/* Logo */}
                                <div className="h-40 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
                                    {team.teamLogo ? (
                                        <img
                                            src={`data:image/jpeg;base64,${team.teamLogo}`}
                                            alt={team.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-sm text-white/40">
                      No logo
                    </span>
                                    )}
                                </div>

                                <h2 className="mt-4 text-lg font-semibold">
                                    {team.name}
                                </h2>

                                <p className="mt-1 text-sm text-white/70">
                                    Game: {team.gameName}
                                </p>

                                <p className="mt-1 text-sm text-white/60">
                                    Members: {team.playerIds?.length || 0}
                                </p>

                                <div className="mt-4 flex gap-2">
                                    <Link
                                        to={`/teams/${team.id}`}
                                        className="rounded-xl bg-white px-3 py-1.5 text-sm font-semibold text-neutral-950 hover:bg-white/90"
                                    >
                                        Details
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
};

export default TeamExplore;

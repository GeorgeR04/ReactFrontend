import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../security/AuthContext.jsx";
import {apiFetch} from "../../config/apiBase.jsx";

function cx(...c) {
    return c.filter(Boolean).join(" ");
}

const TournamentExplore = () => {
    const [tournaments, setTournaments] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [filterDate, setFilterDate] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterOrganizer, setFilterOrganizer] = useState("");
    const [filterRank, setFilterRank] = useState("");

    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchTournaments = async () => {
        try {
            setLoading(true);
            const res = await apiFetch("/api/tournaments/list");
            if (res.ok) {
                const data = await res.json();
                setTournaments(data);
                setFiltered(data);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    useEffect(() => {
        setFiltered(
            tournaments.filter((t) => {
                return (
                    t.name.toLowerCase().includes(search.toLowerCase()) &&
                    (!filterDate ||
                        new Date(t.date).toISOString().split("T")[0] === filterDate) &&
                    (!filterType || t.type === filterType) &&
                    (!filterOrganizer ||
                        t.organizerNames?.includes(filterOrganizer)) &&
                    (!filterRank || t.rank === filterRank)
                );
            })
        );
    }, [search, filterDate, filterType, filterOrganizer, filterRank, tournaments]);

    if (loading) {
        return (
            <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
                <p className="text-white/70">Loading tournaments…</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-semibold text-center sm:text-4xl">
                    Explore Tournaments
                </h1>

                {/* Create */}
                {user?.role === "organizer" && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate("/tournament/create")}
                            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-white/90"
                        >
                            Create Tournament
                        </button>
                    </div>
                )}

                {/* Filters */}
                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <input
                        placeholder="Search…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    />
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    >
                        <option value="">All Types</option>
                        <option value="solo">Solo</option>
                        <option value="team">Team</option>
                    </select>
                    <select
                        value={filterRank}
                        onChange={(e) => setFilterRank(e.target.value)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    >
                        <option value="">All Ranks</option>
                        <option value="D">D</option>
                        <option value="C">C</option>
                        <option value="B">B</option>
                        <option value="A">A</option>
                        <option value="S">S</option>
                    </select>
                </div>

                {/* List */}
                {filtered.length === 0 ? (
                    <p className="mt-12 text-center text-white/60">
                        No tournaments found.
                    </p>
                ) : (
                    <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((t) => {
                            const isOrganizer =
                                user?.role === "organizer" &&
                                t.organizerNames?.includes(user.username);

                            return (
                                <li
                                    key={t.id}
                                    className="rounded-2xl border border-white/10 bg-black/55 p-4 shadow-2xl backdrop-blur"
                                >
                                    <div className="h-40 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
                                        {t.image ? (
                                            <img
                                                src={`data:image/jpeg;base64,${t.image}`}
                                                alt={t.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm text-white/40">
                        No image
                      </span>
                                        )}
                                    </div>

                                    <h2 className="mt-4 text-lg font-semibold">{t.name}</h2>
                                    <p className="mt-1 text-sm text-white/70 line-clamp-2">
                                        {t.description}
                                    </p>

                                    <div className="mt-4 text-sm text-white/80 space-y-1">
                                        <p>Game: {t.gameName}</p>
                                        <p>Type: {t.type}</p>
                                        <p>Date: {new Date(t.date).toLocaleDateString()}</p>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Link
                                            to={`/tournament/explore/${t.id}`}
                                            className="rounded-xl bg-white px-3 py-1.5 text-sm font-semibold text-neutral-950 hover:bg-white/90"
                                        >
                                            Details
                                        </Link>

                                        {isOrganizer && (
                                            <button
                                                onClick={() =>
                                                    navigate(`/tournament/edit/${t.id}`)
                                                }
                                                className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </main>
    );
};

export default TournamentExplore;

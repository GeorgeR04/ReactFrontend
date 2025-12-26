import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../security/AuthContext.jsx";

function Section({ title, children }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold">{title}</h2>
            {children}
        </div>
    );
}

const GameDetails = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { token, user, isTokenExpired } = useContext(AuthContext);

    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGame = async () => {
            try {
                const headers = {};
                if (token && !isTokenExpired(token)) {
                    headers.Authorization = `Bearer ${token}`;
                }

                const res = await fetch(
                    `http://localhost:8080/api/games/${gameId}`,
                    { headers }
                );

                if (!res.ok) throw new Error();
                setGame(await res.json());
            } catch {
                setGame(null);
            } finally {
                setLoading(false);
            }
        };

        fetchGame();
    }, [gameId, token, isTokenExpired]);

    if (loading) {
        return (
            <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
                <p className="text-white/70">Loading game…</p>
            </main>
        );
    }

    if (!game) {
        return (
            <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
                <p className="text-red-400">Game not found.</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <section className="mx-auto max-w-6xl px-4 py-12 space-y-6">
                <div className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur flex flex-col lg:flex-row gap-6">
                    <div className="h-56 w-full lg:w-96 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
                        {game.gameImage ? (
                            <img
                                src={`data:image/jpeg;base64,${game.gameImage}`}
                                alt={game.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-sm text-white/40">
                                No image
                            </span>
                        )}
                    </div>

                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">
                            {game.name}
                        </h1>

                        <p className="mt-2 text-sm text-white/70">
                            {game.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/70">
                            <span><strong className="text-white">Type:</strong> {game.type}</span>
                            <span><strong className="text-white">Max players/team:</strong> {game.maxPlayersPerTeam}</span>
                            <span><strong className="text-white">Year:</strong> {game.yearOfExistence}</span>
                            <span><strong className="text-white">Publisher:</strong> {game.publisher}</span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div>
                        <Section title="Platforms">
                            {game.platforms?.length ? (
                                <ul className="flex flex-wrap gap-2">
                                    {game.platforms.map((p, i) => (
                                        <li
                                            key={i}
                                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm"
                                        >
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-white/60">
                                    No platforms specified.
                                </p>
                            )}
                        </Section>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <Section title="Rules">
                            <p className="text-sm whitespace-pre-line">
                                {game.rules || "No rules provided."}
                            </p>
                        </Section>

                        <Section title="Tutorial">
                            <p className="text-sm whitespace-pre-line">
                                {game.tutorial || "No tutorial provided."}
                            </p>
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

export default GameDetails;

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Card({ children }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/55 p-4 shadow-2xl backdrop-blur">
            {children}
        </div>
    );
}

const PopularGames = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPopularGames = async () => {
            try {
                const res = await fetch(
                    "http://localhost:8080/api/games/popular"
                );
                if (res.ok) {
                    setGames(await res.json());
                }
            } catch {
                setGames([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularGames();
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
                <p className="text-white/70">Loading popular games…</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
                <h1 className="text-3xl font-semibold text-center sm:text-4xl">
                    Popular Games
                </h1>

                {games.length === 0 ? (
                    <p className="text-center text-white/60">
                        No popular games available.
                    </p>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {games.map((game) => (
                            <Card key={game.id}>
                                <div className="h-40 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center mb-4">
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

                                <h2 className="text-lg font-semibold">
                                    {game.name}
                                </h2>

                                <p className="mt-1 text-sm text-white/70 line-clamp-2">
                                    {game.description}
                                </p>

                                <div className="mt-4 flex justify-between items-center text-sm text-white/60">
                                    <span>{game.type}</span>
                                    <span>{game.yearOfExistence}</span>
                                </div>

                                <div className="mt-4">
                                    <Link
                                        to={`/games/${game.id}`}
                                        className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-white/90"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
};

export default PopularGames;

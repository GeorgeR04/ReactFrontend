import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../security/AuthContext.jsx";
import PlayoffBracket from "./PlayoffBracket.jsx";

function Section({ title, children }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/55 p-5 shadow-2xl backdrop-blur">
            <h2 className="mb-3 text-lg font-semibold">{title}</h2>
            {children}
        </div>
    );
}

const TournamentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, user, isTokenExpired } = useContext(AuthContext);

    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastMatch, setLastMatch] = useState(null);
    const [commentary, setCommentary] = useState([]);
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        const headers = { "Content-Type": "application/json" };
        if (token && !isTokenExpired(token)) {
            headers.Authorization = `Bearer ${token}`;
        }

        const fetchAll = async () => {
            try {
                const tRes = await fetch(
                    `http://localhost:8080/api/tournaments/${id}`,
                    { headers }
                );
                if (!tRes.ok) throw new Error();
                const tData = await tRes.json();
                setTournament(tData);

                const [lm, com, mat] = await Promise.all([
                    fetch(`http://localhost:8080/api/tournaments/${id}/lastMatch`, { headers }),
                    fetch(`http://localhost:8080/api/tournaments/${id}/commentary`, { headers }),
                    fetch(`http://localhost:8080/api/tournaments/${id}/matches`, { headers }),
                ]);

                if (lm.ok) setLastMatch(await lm.json());
                if (com.ok) setCommentary(await com.json());
                if (mat.ok) setMatches(await mat.json());
            } catch {
                setTournament(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [id, token, isTokenExpired]);

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
                <p className="text-red-400">Unable to load tournament details.</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
                {/* Header */}
                <div className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur">
                    <h1 className="text-2xl font-semibold sm:text-3xl">
                        {tournament.name}
                    </h1>
                    <p className="mt-2 text-white/70 max-w-3xl">
                        {tournament.description}
                    </p>
                </div>

                {/* Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left */}
                    <div className="space-y-6">
                        <Section title="Overview">
                            <ul className="text-sm text-white/80 space-y-1">
                                <li>Type: {tournament.type}</li>
                                <li>Status: {tournament.status}</li>
                                <li>Game: {tournament.gameName}</li>
                                <li>Cash Prize: ${tournament.cashPrize}</li>
                                <li>Trust Factor: {tournament.trustFactorRequirement}</li>
                                <li>
                                    Rank: {tournament.minRankRequirement} –{" "}
                                    {tournament.maxRankRequirement}
                                </li>
                            </ul>
                        </Section>

                        <Section title="Organizers">
                            {tournament.organizerNames?.length ? (
                                <ul className="list-disc ml-4 text-sm text-white/80">
                                    {tournament.organizerNames.map((o, i) => (
                                        <li key={i}>{o}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-white/60">No organizers listed.</p>
                            )}
                        </Section>

                        <Section title="Last Match">
                            {lastMatch ? (
                                <p className="text-sm">
                                    {lastMatch.team1} vs {lastMatch.team2} — Winner:{" "}
                                    <span className="font-semibold">{lastMatch.winner}</span>
                                </p>
                            ) : (
                                <p className="text-sm text-white/60">No data available.</p>
                            )}
                        </Section>
                    </div>

                    {/* Right */}
                    <div className="lg:col-span-2 space-y-6">
                        <Section title="Rules">
                            <p className="text-sm text-white/80">
                                {tournament.rules || "No specific rules provided."}
                            </p>
                        </Section>

                        <Section title="Playoff Bracket">
                            <PlayoffBracket tournamentId={id} />
                        </Section>

                        <Section title="Matches">
                            {matches.length ? (
                                <div className="space-y-3">
                                    {matches.map((m) => (
                                        <div
                                            key={m.id}
                                            className="rounded-xl border border-white/10 bg-white/5 p-3"
                                        >
                                            <p className="text-sm">
                                                {m.team1} vs {m.team2}
                                            </p>
                                            <p className="text-xs text-white/60">
                                                Winner: {m.winner || "TBD"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-white/60">No matches available.</p>
                            )}
                        </Section>

                        <Section title="Commentary">
                            {commentary.length ? (
                                <ul className="space-y-2 text-sm text-white/80">
                                    {commentary.map((c, i) => (
                                        <li key={i}>• {c}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-white/60">
                                    No commentary available.
                                </p>
                            )}
                        </Section>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default TournamentDetails;

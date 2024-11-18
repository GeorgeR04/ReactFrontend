import React, { useEffect, useState } from 'react';

const PlayoffBracket = ({ tournamentId }) => {
    const [rounds, setRounds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRounds = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/playoffs/${tournamentId}/structure`);
                if (response.ok) {
                    const data = await response.json();
                    setRounds(data);
                } else {
                    console.error('Failed to fetch playoff structure.');
                }
            } catch (error) {
                console.error('Error fetching playoff structure:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRounds();
    }, [tournamentId]);

    if (loading) {
        return <div className="text-center text-white">Loading playoff bracket...</div>;
    }

    if (rounds.length === 0) {
        return <div className="text-center text-red-500">No playoff structure available.</div>;
    }

    return (
        <div className="p-4 bg-gray-900 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Playoff Bracket</h2>
            <div className="overflow-x-auto">
                {rounds.map((round, index) => (
                    <div key={round.id} className="mb-6">
                        <h3 className="text-xl font-semibold mb-2">
                            {round.roundName || `Round ${index + 1}`}
                        </h3>
                        <div className="flex flex-col space-y-4">
                            {round.matchIds.map((matchId, matchIndex) => (
                                <div
                                    key={matchId}
                                    className="flex justify-between items-center border border-gray-700 rounded p-2"
                                >
                                    <div>
                                        <p className="text-sm">
                                            Match {matchIndex + 1}: {round.matches[matchIndex]?.team1Name} vs{' '}
                                            {round.matches[matchIndex]?.team2Name}
                                        </p>
                                    </div>
                                    <div>
                                        {round.matches[matchIndex]?.winnerId ? (
                                            <p className="text-green-500">
                                                Winner: {round.matches[matchIndex]?.winnerId ===
                                            round.matches[matchIndex]?.team1Id
                                                ? round.matches[matchIndex]?.team1Name
                                                : round.matches[matchIndex]?.team2Name}
                                            </p>
                                        ) : (
                                            <p className="text-gray-400">Winner: TBD</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlayoffBracket;

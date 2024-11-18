import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../security/AuthContext.jsx';
import PlayoffBracket from "./PlayoffBracket.jsx";

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
        const fetchTournament = async () => {
            try {
                const headers = {
                    'Content-Type': 'application/json',
                };
                if (token && !isTokenExpired(token)) {
                    headers.Authorization = `Bearer ${token}`;
                }

                const response = await fetch(`http://localhost:8080/api/tournaments/${id}`, { headers });
                if (response.ok) {
                    const data = await response.json();
                    setTournament(data);

                    fetchLastMatch();
                    fetchCommentary();
                    fetchMatches();
                } else if (response.status === 403) {
                    console.error('Access forbidden: You may need to log in.');
                } else {
                    console.error(`Failed to fetch tournament details: ${response.status}`);
                }
            } catch (error) {
                console.error('Error fetching tournament details:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchLastMatch = async () => {
            try {
                const headers = {
                    'Content-Type': 'application/json',
                };
                if (token && !isTokenExpired(token)) {
                    headers.Authorization = `Bearer ${token}`;
                }

                const response = await fetch(`http://localhost:8080/api/tournaments/${id}/lastMatch`, { headers });
                if (response.ok) {
                    const data = await response.json();
                    setLastMatch(data);
                } else {
                    console.error('Failed to fetch last match details.');
                }
            } catch (error) {
                console.error('Error fetching last match:', error);
            }
        };

        const fetchCommentary = async () => {
            try {
                const headers = {
                    'Content-Type': 'application/json',
                };
                if (token && !isTokenExpired(token)) {
                    headers.Authorization = `Bearer ${token}`;
                }

                const response = await fetch(`http://localhost:8080/api/tournaments/${id}/commentary`, { headers });
                if (response.ok) {
                    const data = await response.json();
                    setCommentary(data);
                } else {
                    console.error('Failed to fetch commentary.');
                }
            } catch (error) {
                console.error('Error fetching commentary:', error);
            }
        };

        const fetchMatches = async () => {
            try {
                const headers = {
                    'Content-Type': 'application/json',
                };
                if (token && !isTokenExpired(token)) {
                    headers.Authorization = `Bearer ${token}`;
                }

                const response = await fetch(`http://localhost:8080/api/tournaments/${id}/matches`, { headers });
                if (response.ok) {
                    const data = await response.json();
                    setMatches(data);
                } else {
                    console.error('Failed to fetch matches.');
                }
            } catch (error) {
                console.error('Error fetching matches:', error);
            }
        };

        fetchTournament();
    }, [id, token, isTokenExpired]);

    if (loading) {
        return <div className="text-center text-white">Loading tournament details...</div>;
    }

    if (!tournament) {
        return <div className="text-center text-red-500">Unable to load tournament details.</div>;
    }
    return (
        <div className="p-8 text-white bg-gray-800 grid grid-cols-3 gap-4">
            {/* Left Section: All tournament info */}
            <div className="col-span-1 bg-gray-900 p-4 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Tournament Info</h2>
                <p>Name: {tournament.name}</p>
                <p>Description: {tournament.description}</p>
                <p>Type: {tournament.type}</p>
                <p>Status: {tournament.status}</p>
                <p>Game: {tournament.gameName}</p>
                <p>Cash Prize: ${tournament.cashPrize}</p>
                <p>Trust Factor Requirement: {tournament.trustFactorRequirement}</p>
                <p>Min Rank: {tournament.minRankRequirement}</p>
                <p>Max Rank: {tournament.maxRankRequirement}</p>

                {/* Organizers */}
                <p>Organizers:</p>
                <ul className="list-disc ml-5">
                    {tournament.organizerNames && tournament.organizerNames.length > 0 ? (
                        tournament.organizerNames.map((organizer, index) => (
                            <li key={index}>{organizer}</li>
                        ))
                    ) : (
                        <p>No organizers listed.</p>
                    )}
                </ul>

                {/* Participants */}
                <p>Participants: {tournament.participants?.length || 0}</p>
            </div>


            {/* Middle Section: Tournament Rules, Playoff Bracket, and Matches */}
            <div className="col-span-2">
                {/* Tournament Rules */}
                <div className="mb-4 bg-gray-900 p-4 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4">Tournament Rules</h2>
                    <p>{tournament.rules || 'No specific rules provided.'}</p>
                </div>

                {/* Playoff Bracket */}
                <div className="mb-4 bg-gray-900 p-4 rounded-lg">
                    <PlayoffBracket tournamentId={id} />
                </div>

                {/* Match Results Area */}
                <div className="mb-4 bg-gray-900 p-4 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4">Match Results</h2>
                    {matches.length > 0 ? (
                        matches.map((match) => (
                            <div key={match.id} className="mb-4">
                                <p>
                                    Match {match.id}: {match.team1} vs {match.team2}
                                </p>
                                {user?.role === 'organizer' ? (
                                    <div className="flex space-x-4 mt-2">
                                        <button
                                            onClick={() => handleSetWinner(match.id, match.team1Id)}
                                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded"
                                        >
                                            Set {match.team1} as Winner
                                        </button>
                                        <button
                                            onClick={() => handleSetWinner(match.id, match.team2Id)}
                                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded"
                                        >
                                            Set {match.team2} as Winner
                                        </button>
                                    </div>
                                ) : (
                                    <p>Winner: {match.winner || 'Not decided yet'}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No matches available.</p>
                    )}
                </div>
            </div>

            {/* Bottom Right Section: Last Match */}
            <div className="col-span-1 bg-gray-900 p-4 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Last Match</h2>
                {lastMatch ? (
                    <p>
                        {lastMatch.team1} vs {lastMatch.team2} - Winner: {lastMatch.winner}
                    </p>
                ) : (
                    <p>No match data available.</p>
                )}
            </div>

            {/* Commentary Section */}
            <div className="col-span-1 bg-gray-900 p-4 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Commentary</h2>
                {commentary.length > 0 ? (
                    <ul>
                        {commentary.map((comment, index) => (
                            <li key={index} className="mb-2">
                                {comment}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No commentary available.</p>
                )}
            </div>
        </div>
    );
};

export default TournamentDetails;

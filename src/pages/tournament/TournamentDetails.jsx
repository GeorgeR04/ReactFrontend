import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../security/AuthContext.jsx';

const TournamentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, user, isTokenExpired } = useContext(AuthContext);
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                // Configure headers only if a valid token is present
                const headers = {};
                if (token && !isTokenExpired(token)) {
                    headers.Authorization = `Bearer ${token}`;
                }

                const response = await fetch(`http://localhost:8080/api/tournaments/${id}`, { headers });

                if (response.ok) {
                    const data = await response.json();
                    setTournament(data);
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

        fetchTournament();
    }, [id, token, isTokenExpired]);

    const handleLeaveTournament = async () => {
        if (!token || isTokenExpired(token)) {
            alert('Please log in to leave the tournament.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/tournaments/${id}/leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ username: user.username }),
            });

            if (response.ok) {
                alert('Successfully left the tournament.');
                navigate('/tournament/explore'); // Redirect to the tournament list
            } else {
                alert('Failed to leave the tournament.');
            }
        } catch (error) {
            console.error('Error leaving tournament:', error);
        }
    };

    if (loading) {
        return <div className="text-center text-white">Loading tournament details...</div>;
    }

    if (!tournament) {
        return <div className="text-center text-red-500">Unable to load tournament details.</div>;
    }

    return (
        <div className="p-8 text-white bg-gray-800">
            <div className="mb-4">
                <button
                    onClick={() => navigate('/tournament/explore')}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded"
                >
                    Back to Explore
                </button>
            </div>
            <h1 className="text-4xl font-bold mb-4">{tournament.name}</h1>
            <p>{tournament.description}</p>
            <p className="my-2">Cash Prize: ${tournament.cashPrize}</p>
            <p>Type: {tournament.type}</p>
            <p>Status: {tournament.status}</p>
            <p>Game: {tournament.gameName}</p>

            {/* Actions based on user role */}
            {user ? (
                user.role === 'player' ? (
                    <div className="mt-4">
                        {tournament.participatingTeamIds?.includes(user.username) ? (
                            <button
                                onClick={handleLeaveTournament}
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded"
                            >
                                Leave Tournament
                            </button>
                        ) : (
                            <p>You are not part of this tournament.</p>
                        )}
                    </div>
                ) : user.role === 'organizer' ? (
                    <div className="mt-4">
                        <button
                            onClick={() => navigate(`/tournament/edit/${id}`)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded"
                        >
                            Edit Tournament
                        </button>
                    </div>
                ) : null
            ) : (
                <div className="mt-4">
                    <p className="text-yellow-300">
                        Log in to interact with this tournament (e.g., join or leave).
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded mt-2"
                    >
                        Login
                    </button>
                </div>
            )}
        </div>
    );
};

export default TournamentDetails;

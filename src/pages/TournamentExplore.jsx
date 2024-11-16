import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../security/AuthContext.jsx';

const TournamentExplore = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token, user, isTokenExpired, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // Fetch tournaments
    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/tournaments', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                if (response.ok) {
                    const data = await response.json();
                    setTournaments(data);
                } else {
                    console.error('Failed to fetch tournaments:', response.status);
                }
            } catch (error) {
                console.error('Error fetching tournaments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTournaments();
    }, [token]);

    const ensureAuthenticated = () => {
        if (!token || isTokenExpired(token)) {
            alert('Please log in to perform this action.');
            navigate('/login');
            return false;
        }
        return true;
    };

    const handleJoinTournament = async (tournament) => {
        if (!ensureAuthenticated()) return;

        if (tournament.gameId !== user.game.id) {
            alert('You cannot join this tournament because it is for a different game.');
            return;
        }

        if (tournament.trustFactorRequirement > user.trustFactor) {
            alert(`Your trust factor (${user.trustFactor}) does not meet the requirement.`);
            return;
        }

        if (user.rank < tournament.rankRequirement) {
            alert(`Your rank (${user.rank}) does not meet the minimum requirement.`);
            return;
        }

        const payload = tournament.type === 'team'
            ? { teamLeader: user.username, teamMembers: [] }
            : {};

        try {
            const response = await fetch(`http://localhost:8080/api/tournaments/${tournament.id}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('Successfully joined the tournament!');
            } else {
                alert('Failed to join the tournament.');
            }
        } catch (error) {
            console.error('Error joining tournament:', error);
        }
    };

    const handleLeaveTournament = async (tournament) => {
        if (!ensureAuthenticated()) return;

        const payload = tournament.type === 'team' ? { teamLeader: user.username } : {};

        try {
            const response = await fetch(`http://localhost:8080/api/tournaments/${tournament.id}/leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('Successfully left the tournament!');
            } else {
                alert('Failed to leave the tournament.');
            }
        } catch (error) {
            console.error('Error leaving tournament:', error);
        }
    };

    const handleDeleteTournament = async (id) => {
        if (!ensureAuthenticated()) return;

        try {
            const response = await fetch(`http://localhost:8080/api/tournaments/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setTournaments((prev) => prev.filter((t) => t.id !== id));
                alert('Tournament deleted successfully.');
            } else {
                alert('Failed to delete the tournament.');
            }
        } catch (error) {
            console.error('Error deleting tournament:', error);
        }
    };

    const handleCreateTournament = () => {
        if (!ensureAuthenticated()) return;
        navigate('/tournament/create');
    };

    if (loading) return <div className="text-center text-white">Loading tournaments...</div>;

    return (
        <div className="p-8 text-white bg-gray-800">
            <h1 className="text-4xl font-bold text-center mb-8">Explore Tournaments</h1>

            {/* Render the "Create Tournament" button for organizers */}
            {user?.role === 'organizer' && (
                <div className="mb-4 text-center">
                    <button
                        onClick={handleCreateTournament}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded"
                    >
                        Create Tournament
                    </button>
                </div>
            )}

            {tournaments.length > 0 ? (
                <ul className="space-y-4">
                    {tournaments.map((tournament) => (
                        <li
                            key={tournament.id}
                            className="p-4 bg-gray-900 rounded-lg shadow-md flex justify-between items-center"
                        >
                            <div>
                                <h2 className="text-2xl font-bold">{tournament.name}</h2>
                                <p>{tournament.description}</p>
                                <p>Type: {tournament.type}</p>
                                <p>Game: {tournament.gameId}</p>
                                <p>Rank Requirement: {tournament.rankRequirement}</p>
                                <p>Trust Factor Requirement: {tournament.trustFactorRequirement}</p>
                            </div>
                            <div>
                                {user?.role === 'organizer' && user.username === tournament.organizerId ? (
                                    <div className="flex space-x-4">
                                        <Link
                                            to={`/tournament/explore/${tournament.id}/edit`}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteTournament(tournament.id)}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ) : user?.role === 'player' && tournament.participatingTeamIds?.includes(user.username) ? (
                                    <button
                                        onClick={() => handleLeaveTournament(tournament)}
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded"
                                    >
                                        Leave
                                    </button>
                                ) : (
                                    user?.role === 'player' && (
                                        <button
                                            onClick={() => handleJoinTournament(tournament)}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded"
                                        >
                                            Join
                                        </button>
                                    )
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center">No tournaments available at the moment.</p>
            )}
        </div>
    );
};

export default TournamentExplore;

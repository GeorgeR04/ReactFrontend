import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../security/AuthContext.jsx'; // Adjust the import path based on your project structure

const TournamentExplore = () => {
    const [tournaments, setTournaments] = useState([]);
    const [filteredTournaments, setFilteredTournaments] = useState([]); // For search results
    const [searchQuery, setSearchQuery] = useState(''); // Search input state
    const [loading, setLoading] = useState(true);

    const { token, user } = useContext(AuthContext); // Use AuthContext
    const navigate = useNavigate();




    const fetchTournaments = async () => {
        try {
            setLoading(true);
            const tournamentsResponse = await fetch('http://localhost:8080/api/tournaments/list');
            if (tournamentsResponse.ok) {
                const tournamentsData = await tournamentsResponse.json();
                setTournaments(tournamentsData);
                setFilteredTournaments(tournamentsData); // Initialize filtered list
            } else {
                console.error('Failed to fetch tournaments.');
            }
        } catch (error) {
            console.error('Error fetching tournaments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    // Update filtered tournaments based on search query
    useEffect(() => {
        const results = tournaments.filter((tournament) =>
            tournament.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredTournaments(results);
    }, [searchQuery, tournaments]);

    const handleJoinTournament = async (tournament) => {
        if (!token) {
            alert('Please log in to join the tournament.');
            navigate('/login');
            return;
        }

        if (tournament.gameId !== user?.game?.id) {
            alert('You cannot join this tournament because it is for a different game.');
            return;
        }

        if (tournament.trustFactorRequirement > user?.trustFactor) {
            alert(`Your trust factor (${user?.trustFactor}) does not meet the requirement.`);
            return;
        }

        if (user?.rank < tournament.minRankRequirement || user?.rank > tournament.maxRankRequirement) {
            alert(
                `Your rank (${user?.rank}) does not meet the rank requirements (${tournament.minRankRequirement} - ${tournament.maxRankRequirement}).`
            );
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
                fetchTournaments(); // Refresh the list after joining
            } else {
                alert('Failed to join the tournament.');
            }
        } catch (error) {
            console.error('Error joining tournament:', error);
        }
    };

    const handleDeleteTournament = async (id) => {
        if (!token) {
            alert('Please log in to delete the tournament.');
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/tournaments/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                alert('Tournament deleted successfully.');
                fetchTournaments(); // Refresh the list after deletion
            } else {
                alert('Failed to delete the tournament.');
            }
        } catch (error) {
            console.error('Error deleting tournament:', error);
        }
    };

    const handleCreateTournament = () => {
        if (!token) {
            alert('Please log in to create a tournament.');
            navigate('/login');
            return;
        }
        navigate('/tournament/create');
    };

    const handleEditTournament = (id) => {
        if (user?.role === 'organizer') {
            navigate(`/tournament/edit/${id}`);
        } else {
            alert('You are not authorized to edit this tournament.');
        }
    };

    if (loading) return <div className="text-center text-white">Loading tournaments...</div>;

    return (
        <div className="p-8 text-white bg-gray-800">
            <h1 className="text-4xl font-bold text-center mb-8">Explore Tournaments</h1>

            {/* Search Bar */}
            <div className="mb-6 text-center">
                <input
                    type="text"
                    placeholder="Search tournaments by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 w-1/2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
            </div>

            {/* Render the "Create Tournament" button for organizers */}
            {user?.role === 'organizer' && (
                <div className="mb-8 text-center">
                    <button
                        onClick={handleCreateTournament}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg"
                    >
                        Create New Tournament
                    </button>
                </div>
            )}

            {filteredTournaments.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTournaments.map((tournament) => {
                        const maxTeamsOrPlayers = tournament.maxTeams || 0; // Total slots
                        const currentParticipants = tournament.participatingIds?.length || 0; // Slots filled
                        const availableSlots = maxTeamsOrPlayers - currentParticipants; // Remaining slots

                        return (
                            <li
                                key={tournament.id}
                                className="bg-gray-900 rounded-lg shadow-lg flex flex-col overflow-hidden"
                            >
                                {/* Tournament Image */}
                                <div className="w-full h-48 bg-gray-700 flex items-center justify-center overflow-hidden">
                                    {tournament.image ? (
                                        <img
                                            src={`data:image/jpeg;base64,${tournament.image}`}
                                            alt={tournament.name}
                                            className="w-48 h-48 object-cover"
                                        />
                                    ) : (
                                        <div className="text-gray-400">No Image</div>
                                    )}
                                </div>

                                {/* Tournament Details */}
                                <div className="p-4">
                                    <h2 className="text-lg font-bold">{tournament.name}</h2>
                                    <p className="text-sm">{tournament.description}</p>
                                    <p>Type: {tournament.type}</p>
                                    <p>Game: {tournament.gameName}</p>
                                    <p>
                                        Rank: {tournament.minRankRequirement} - {tournament.maxRankRequirement}
                                    </p>
                                    <p>Trust Factor: {tournament.trustFactorRequirement}</p>
                                    <p>Cash Prize: ${tournament.cashPrize}</p>
                                    <p>Reputation: {tournament.reputation}</p>
                                    <p>Rank: {tournament.rank}</p>
                                    <p>Status: {tournament.status}</p>
                                    <p>
                                        {tournament.type === 'team' ? 'Teams' : 'Players'}: {currentParticipants} / {maxTeamsOrPlayers}
                                    </p>
                                    {availableSlots > 0 ? (
                                        <p className="text-green-500">
                                            {availableSlots} {tournament.type === 'team' ? 'slots for teams' : 'slots for players'} available
                                        </p>
                                    ) : (
                                        <p className="text-red-500">Tournament is full</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex p-4 space-x-2">
                                    <Link
                                        to={`/tournament/explore/${tournament.id}`}
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded"
                                    >
                                        Details
                                    </Link>
                                    {user?.role === 'organizer' &&
                                        tournament.organizerIds?.includes(user.username) && (
                                            <>
                                                <button
                                                    onClick={() => handleEditTournament(tournament.id)}
                                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTournament(tournament.id)}
                                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    {user?.role === 'player' &&
                                        !tournament.participatingIds?.includes(user.username) && (
                                            <button
                                                onClick={() => handleJoinTournament(tournament)}
                                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded"
                                            >
                                                Join
                                            </button>
                                        )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="text-center">No tournaments found matching your search.</p>
            )}
        </div>
    );
};

export default TournamentExplore;

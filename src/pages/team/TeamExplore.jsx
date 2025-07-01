import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../security/AuthContext.jsx';

const TeamExplore = () => {
    const { token, user } = useContext(AuthContext);
    const [teams, setTeams] = useState([]);
    const [games, setGames] = useState([]); // List of all games
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [error, setError] = useState('');
    const [playerTeam, setPlayerTeam] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRank, setFilterRank] = useState('');
    const [filterGame, setFilterGame] = useState('');
    const navigate = useNavigate();

    // Fetch teams and games from the backend
    const fetchTeamsAndGames = async () => {
        try {
            const teamsResponse = await fetch('http://localhost:8080/api/teams/list', {
                method: 'GET',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            if (!teamsResponse.ok) {
                throw new Error('Failed to fetch teams');
            }

            const teamsData = await teamsResponse.json();
            setTeams(teamsData);
            setFilteredTeams(teamsData);

            if (user?.username) {
                const memberTeam = teamsData.find((team) =>
                    team.members.some((member) => member.playerId === user.username)
                );
                setPlayerTeam(memberTeam || null);
            }

            const gamesResponse = await fetch('http://localhost:8080/api/games/list');
            if (!gamesResponse.ok) {
                throw new Error('Failed to fetch games');
            }

            const gamesData = await gamesResponse.json();
            setGames(gamesData);
        } catch (error) {
            setError(`Error: ${error.message}`);
        }
    };

    useEffect(() => {
        fetchTeamsAndGames();
    }, [token]);

    useEffect(() => {
        const filtered = teams.filter((team) => {
            const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRank = !filterRank || team.rank === filterRank;
            const matchesGame = !filterGame || games.find((game) => game.id === team.gameId)?.name === filterGame;
            return matchesSearch && matchesRank && matchesGame;
        });
        setFilteredTeams(filtered);
    }, [searchQuery, filterRank, filterGame, teams, games]);

    const handleCreateTeam = () => {
        if (!token) {
            alert('Please log in to create a team.');
            navigate('/login');
            return;
        }

        navigate('/teams/create');
    };

    const handleJoinTeam = async (teamId) => {
        if (!user || user.role !== 'player') {
            alert('Only players can join a team.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/teams/${teamId}/join?playerId=${user.username}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                alert('Successfully joined the team!');
                fetchTeamsAndGames();
            } else {
                const errorText = await response.text();
                alert(`Failed to join the team: ${errorText}`);
            }
        } catch (error) {
            console.error('Error joining team:', error);
            alert('An error occurred while joining the team.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-800 text-white p-8">
            <h1 className="text-4xl font-bold text-center mb-8">Explore Teams</h1>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {/* Search Bar and Filters */}
            <div className="mb-8 flex flex-wrap justify-center gap-4">
                <input
                    type="text"
                    placeholder="Search teams by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 w-1/2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <select
                    value={filterRank}
                    onChange={(e) => setFilterRank(e.target.value)}
                    className="px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                    <option value="">All Ranks</option>
                    <option value="D">D</option>
                    <option value="C">C</option>
                    <option value="B">B</option>
                    <option value="A">A</option>
                    <option value="S">S</option>
                </select>
                <select
                    value={filterGame}
                    onChange={(e) => setFilterGame(e.target.value)}
                    className="px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                    <option value="">All Games</option>
                    {games.map((game) => (
                        <option key={game.id} value={game.name}>
                            {game.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Create Team Button */}
            {user?.role === 'player' && !playerTeam && (
                <div className="mb-8 text-center">
                    <button
                        onClick={handleCreateTeam}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg"
                    >
                        Create New Team
                    </button>
                </div>
            )}

            {/* Team List */}
            <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-semibold mb-6">Available Teams</h2>
                {filteredTeams.length > 0 ? (
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeams.map((team, index) => (
                            <li
                                key={team.id}
                                onClick={() => navigate(`/teams/${team.id}`)}
                                className="cursor-pointer relative bg-gray-900 rounded-lg shadow-lg overflow-hidden hover:scale-105 transition transform"
                            >
                                {/* Rank Badge */}
                                <div
                                    className="absolute top-2 left-2 bg-gray-700 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold"
                                    style={{ zIndex: 10 }}
                                >
                                    {index + 1}
                                </div>

                                <div className="p-4 mt-8">
                                    <h3 className="text-xl font-bold mb-2">{team.name}</h3>
                                    {team.teamLogo ? (
                                        <img
                                            src={`data:image/png;base64,${team.teamLogo}`}
                                            alt={`${team.name} Logo`}
                                            className="w-full h-40 object-cover rounded mb-4"
                                        />
                                    ) : (
                                        <div className="w-full h-40 bg-gray-700 flex items-center justify-center text-gray-400 rounded mb-4">
                                            No Logo
                                        </div>
                                    )}
                                    <p>
                                        <strong>Leader:</strong> {team.teamLeaderId}
                                    </p>
                                    <p>
                                        <strong>Rank:</strong> {team.rank}
                                    </p>
                                    <p>
                                        <strong>Game:</strong> {games.find((game) => game.id === team.gameId)?.name || 'Unknown'}
                                    </p>
                                    <p>
                                        <strong>Members:</strong>{' '}
                                        {team.members
                                            .map((member) => `${member.playerId} (${member.role})`)
                                            .join(', ')}
                                    </p>
                                    {user?.role === 'player' && !playerTeam && (
                                        <button
                                            onClick={() => handleJoinTeam(team.id)}
                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded mt-4 block w-full text-center"
                                        >
                                            Join Team
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center">No teams available.</p>
                )}
            </div>
        </div>
    );
};

export default TeamExplore;

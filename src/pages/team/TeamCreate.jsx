import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../security/AuthContext.jsx';

const TeamCreate = () => {
    const { token, user, isTokenExpired, logout } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [gameId, setGameId] = useState('');
    const [games, setGames] = useState([]); // Games fetched from backend
    const [image, setImage] = useState(null); // Base64 image
    const [loadingGames, setLoadingGames] = useState(true); // Loading indicator
    const navigate = useNavigate();

    useEffect(() => {
        if (!token || isTokenExpired(token)) {
            logout();
            alert('Session expired. Please log in again.');
            navigate('/login');
            return;
        }

        const fetchGames = async () => {
            try {
                setLoadingGames(true);
                const response = await fetch('http://localhost:8080/api/games/list', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const gamesData = await response.json();
                    setGames(gamesData);
                } else if (response.status === 403) {
                    alert('You are not authorized to view games.');
                }
            } catch (error) {
                console.error('Error fetching games:', error);
            } finally {
                setLoadingGames(false);
            }
        };

        fetchGames();
    }, [token, isTokenExpired, logout, navigate]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setImage(reader.result.split(',')[1]);
            reader.readAsDataURL(file);
        }
    };

    const handleCreate = async () => {
        if (!token || isTokenExpired(token)) {
            logout();
            alert('Session expired. Please log in again.');
            navigate('/login');
            return;
        }

        if (!name) {
            alert('You must specify a team name.');
            return;
        }

        if (!gameId) {
            alert('You must select a game.');
            return;
        }

        try {
            const payload = {
                name,
                gameId,
                playerIds: [user.username], // Set logged-in user as the first player
                teamLeaderId: user.username, // Logged-in user is the team leader
                teamLogo: image, // Base64-encoded image string
            };

            console.log('Payload:', payload);

            const response = await fetch('http://localhost:8080/api/teams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('Team created successfully!');
                navigate('/teams/explore'); // Redirect to team exploration page
            } else {
                const errorText = await response.text();
                console.error('Server Error:', errorText);
                alert(`Failed to create team: ${errorText}`);
            }
        } catch (error) {
            console.error('Error creating team:', error);
            alert('An error occurred while creating the team.');
        }
    };

    return (
        <div className="p-8 text-white bg-gray-800">
            <h1 className="text-4xl font-bold text-center mb-8">Create Team</h1>
            <div className="max-w-md mx-auto space-y-4">
                <input
                    type="text"
                    placeholder="Team Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-gray-900 text-white"
                />
                <div>
                    <label className="block mb-2 font-bold">Select a Game</label>
                    <select
                        value={gameId}
                        onChange={(e) => setGameId(e.target.value)}
                        className="w-full px-4 py-2 rounded bg-gray-900 text-white"
                        disabled={loadingGames || games.length === 0}
                    >
                        <option value="" disabled>
                            {loadingGames ? 'Loading games...' : 'Select Game'}
                        </option>
                        {games.map((game) => (
                            <option key={game.id} value={game.id}>
                                {game.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block mb-2 font-bold">Team Logo</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-4 py-2 text-white bg-gray-900 rounded"
                    />
                </div>
                <button
                    onClick={handleCreate}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded"
                >
                    Create Team
                </button>
            </div>
        </div>
    );
};

export default TeamCreate;

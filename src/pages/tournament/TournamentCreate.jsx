import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TournamentCreate = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('solo'); // Default to "solo"
    const [maxTeams, setMaxTeams] = useState(0);
    const [gameId, setGameId] = useState('');
    const [games, setGames] = useState([]); // Store games from backend
    const [rankRequirement, setRankRequirement] = useState(0);
    const [trustFactorRequirement, setTrustFactorRequirement] = useState(0);
    const [visibility, setVisibility] = useState('public'); // Default visibility
    const [image, setImage] = useState(null); // Store Base64 image
    const [loadingGames, setLoadingGames] = useState(true); // Loading state for games
    const navigate = useNavigate();

    // Fetch games from the backend
    useEffect(() => {
        const fetchGames = async () => {
            const token = sessionStorage.getItem('token');
            console.log('Token used for fetching games:', token);

            if (!token) {
                alert('Please log in to fetch games.');
                navigate('/login');
                return;
            }

            try {
                setLoadingGames(true);
                const response = await fetch('http://localhost:8080/api/games/list', {
                    headers: {
                        Authorization: `Bearer ${token.trim()}`, // Ensure token is clean
                    },
                });

                if (response.ok) {
                    const gamesData = await response.json();
                    console.log('Fetched games:', gamesData);
                    setGames(gamesData);
                } else {
                    console.error('Failed to fetch games:', response.status);
                    if (response.status === 403) {
                        alert('You are not authorized to view this resource.');
                    }
                }
            } catch (error) {
                console.error('Error fetching games:', error);
            } finally {
                setLoadingGames(false);
            }
        };

        fetchGames();
    }, [navigate]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result.split(',')[1]); // Extract Base64 string
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreate = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                alert('Please log in to create a tournament.');
                navigate('/login');
                return;
            }

            const response = await fetch('http://localhost:8080/api/tournaments/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    description,
                    type,
                    maxTeams,
                    gameId,
                    rankRequirement,
                    trustFactorRequirement,
                    visibility,
                    image,
                }),
            });

            if (response.ok) {
                const newTournament = await response.json();
                console.log('Tournament created:', newTournament);
                alert('Tournament created successfully!');
                navigate('/tournament/explore');
            } else {
                const errorText = await response.text();
                console.error('Failed to create tournament:', errorText);
                alert(`Failed to create tournament: ${errorText}`);
            }
        } catch (error) {
            console.error('Error creating tournament:', error);
            alert('An error occurred while creating the tournament.');
        }
    };

    return (
        <div className="p-8 text-white bg-gray-800">
            <h1 className="text-4xl font-bold text-center mb-8">Create Tournament</h1>
            <div className="max-w-md mx-auto space-y-4">
                <input
                    type="text"
                    placeholder="Tournament Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-gray-900 text-white"
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                        {games.length === 0 && !loadingGames ? (
                            <option disabled>No games available</option>
                        ) : (
                            games.map((game) => (
                                <option key={game.id} value={game.id}>
                                    {game.name}
                                </option>
                            ))
                        )}
                    </select>
                </div>
                <input
                    type="number"
                    placeholder="Max Teams"
                    value={maxTeams}
                    onChange={(e) => setMaxTeams(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-gray-900 text-white"
                />
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-gray-900 text-white"
                >
                    <option value="solo">Solo</option>
                    <option value="team">Team</option>
                </select>
                <input
                    type="number"
                    placeholder="Rank Requirement"
                    value={rankRequirement}
                    onChange={(e) => setRankRequirement(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-gray-900 text-white"
                />
                <input
                    type="number"
                    placeholder="Trust Factor Requirement"
                    value={trustFactorRequirement}
                    onChange={(e) => setTrustFactorRequirement(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-gray-900 text-white"
                />
                <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-gray-900 text-white"
                >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                </select>
                <div>
                    <label className="block mb-2 font-bold">Tournament Image</label>
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
                    Create
                </button>
            </div>
        </div>
    );
};

export default TournamentCreate;

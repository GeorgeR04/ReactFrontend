import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../security/AuthContext.jsx';

const TournamentCreate = () => {
    const { token, user, isTokenExpired, logout } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('solo'); // Default to "solo"
    const [maxTeams, setMaxTeams] = useState(''); // Represents "Max Players" for solo tournaments
    const [gameId, setGameId] = useState('');
    const [games, setGames] = useState([]); // Games fetched from backend
    const [minRankRequirement, setMinRankRequirement] = useState('');
    const [maxRankRequirement, setMaxRankRequirement] = useState('');
    const [trustFactorRequirement, setTrustFactorRequirement] = useState('');
    const [visibility, setVisibility] = useState('public'); // Default visibility
    const [image, setImage] = useState(null); // Base64 image
    const [cashPrize, setCashPrize] = useState(''); // Cash prize
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

        if (!maxTeams || maxTeams <= 0) {
            alert('You must specify a positive value for max players or max teams.');
            return;
        }

        if (minRankRequirement && maxRankRequirement && minRankRequirement > maxRankRequirement) {
            alert('Minimum rank cannot exceed maximum rank.');
            return;
        }

        try {
            const payload = {
                name,
                description,
                type,
                maxTeams: parseInt(maxTeams), // Map to backend's maxTeams
                gameId,
                minRankRequirement: parseInt(minRankRequirement) || null,
                maxRankRequirement: parseInt(maxRankRequirement) || null,
                trustFactorRequirement: parseInt(trustFactorRequirement) || null,
                visibility,
                image,
                cashPrize: parseFloat(cashPrize) || 0,
            };

            console.log('Payload:', payload);

            const response = await fetch('http://localhost:8080/api/tournaments/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('Tournament created successfully!');
                navigate('/tournament/explore');
            } else {
                const errorText = await response.text();
                console.error('Server Error:', errorText);
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
                        {games.map((game) => (
                            <option key={game.id} value={game.id}>
                                {game.name}
                            </option>
                        ))}
                    </select>
                </div>
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
                    placeholder={type === 'team' ? 'Max Teams' : 'Max Players'}
                    value={maxTeams}
                    onChange={(e) => setMaxTeams(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-gray-900 text-white"
                />
                <input
                    type="number"
                    placeholder="Cash Prize"
                    value={cashPrize}
                    onChange={(e) => setCashPrize(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-gray-900 text-white"
                />
                <input
                    type="number"
                    placeholder="Min Rank Requirement"
                    value={minRankRequirement}
                    onChange={(e) => setMinRankRequirement(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-gray-900 text-white"
                />
                <input
                    type="number"
                    placeholder="Max Rank Requirement"
                    value={maxRankRequirement}
                    onChange={(e) => setMaxRankRequirement(e.target.value)}
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

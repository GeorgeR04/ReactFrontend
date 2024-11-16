import React, { useState, useEffect } from 'react';

const RoleSelectionModal = ({ isOpen, onClose, onSave }) => {
    const [role, setRole] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [game, setGame] = useState('');
    const [specializations, setSpecializations] = useState([]);
    const [games, setGames] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const fetchSpecializations = async () => {
                try {
                    const response = await fetch('http://localhost:8080/api/specializations', {
                        method: 'GET',
                        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setSpecializations(data);
                    } else {
                        setSpecializations([]);
                        console.error('Failed to fetch specializations.');
                    }
                } catch (error) {
                    console.error('Error fetching specializations:', error);
                    setSpecializations([]);
                }
            };

            const fetchGames = async () => {
                try {
                    const response = await fetch('http://localhost:8080/api/games/list', {
                        method: 'GET',
                        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setGames(data);
                    } else {
                        setGames([]);
                        console.error('Failed to fetch games.');
                    }
                } catch (error) {
                    console.error('Error fetching games:', error);
                    setGames([]);
                }
            };

            fetchSpecializations();
            fetchGames();
        }
    }, [isOpen]);

    const handleSave = async () => {
        if (!role) {
            setError('Please select a role.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/profile/set-player-details', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role,
                    specialization: specialization || null,
                    game: game || null,
                }),
            });

            if (!response.ok) throw new Error('Failed to save details.');

            onSave(); // Callback to inform parent component
            onClose(); // Close modal
        } catch (error) {
            setError(error.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-lg font-semibold text-center mb-4">Select Role and Preferences</h2>

                {error && <p className="text-red-500 text-center mb-2">{error}</p>}

                {/* Role Selection */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Select Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                    >
                        <option value="">Choose a role</option>
                        <option value="player">Player</option>
                        <option value="organizer">Organizer</option>
                    </select>
                </div>

                {/* Specialization Selection */}
                {role === 'player' && (
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Select Specialization</label>
                        <select
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            <option value="">Choose a specialization</option>
                            {specializations.map((spec) => (
                                <option key={spec.id} value={spec.name}>
                                    {spec.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Game Selection */}
                {role === 'player' && specialization && (
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Select Game</label>
                        <select
                            value={game}
                            onChange={(e) => setGame(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            <option value="">Choose a game</option>
                            {games.map((game) => (
                                <option key={game.id} value={game.name}>
                                    {game.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Modal Actions */}
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionModal;

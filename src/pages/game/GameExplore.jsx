import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../security/AuthContext.jsx";

const GameExplore = () => {
    const { token, user } = useContext(AuthContext); // Access user details and token
    const [games, setGames] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/games");
                if (response.ok) {
                    const data = await response.json();
                    setGames(data);
                } else {
                    setError("Failed to fetch games.");
                }
            } catch (err) {
                setError("An error occurred while fetching games.");
            }
        };

        fetchGames();
    }, []);

    const filteredGames = games.filter((game) =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (!filterType || game.type === filterType)
    );

    const handleAddGame = () => {
        if (!token || !(user?.role === "organizer" || user?.role === "moderator")) {
            alert("You do not have permission to add a new game.");
            return;
        }
        navigate("/games/create");
    };

    return (
        <div className="min-h-screen bg-gray-800 text-white p-8">
            <h1 className="text-4xl font-bold mb-8 text-center">Explore Games</h1>
            {error && <p className="text-red-500 text-center">{error}</p>}

            {/* Add New Game Button (visible only for organizers and moderators) */}
            {user?.role && (user.role === "organizer" || user.role === "moderator") && (
                <div className="mb-6 text-right">
                    <button
                        onClick={handleAddGame}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg"
                    >
                        Add New Game
                    </button>
                </div>
            )}

            {/* Search and Filter Section */}
            <div className="flex justify-between mb-6">
                <input
                    type="text"
                    placeholder="Search games..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-2 rounded bg-gray-700 text-white w-1/2"
                />
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="p-2 rounded bg-gray-700 text-white"
                >
                    <option value="">All Types</option>
                    <option value="FPS">FPS</option>
                    <option value="MOBA">MOBA</option>
                    {/* Add more types */}
                </select>
            </div>

            {/* Game Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGames.map((game) => (
                    <div key={game.id} className="bg-gray-900 rounded-lg p-4 shadow-lg">
                        <h3 className="text-xl font-bold">{game.name}</h3>
                        {game.gameImage ? (
                            <img
                                src={`data:image/png;base64,${game.gameImage}`}
                                alt={`${game.name} Logo`}
                                className="w-full h-40 object-cover mt-4"
                            />
                        ) : (
                            <div className="w-full h-40 bg-gray-700 mt-4 flex items-center justify-center text-gray-400">
                                No Image
                            </div>
                        )}
                        <p className="mt-2">Type: {game.type}</p>
                        <p>Year: {game.yearOfExistence}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameExplore;

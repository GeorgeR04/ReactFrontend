import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../security/AuthContext.jsx";

const GameExplore = () => {
    const { token, user } = useContext(AuthContext);
    const [games, setGames] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("");
    const [error, setError] = useState("");
    const [gameToDelete, setGameToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/games/list");
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
        // Only organisers and moderators can create games directly
        if (!token || !(user?.role === "organizer" || user?.role === "moderator")) {
            alert("You do not have permission to add a new game.");
            return;
        }
        navigate("/games/create");
    };

    const handleSuggestGame = () => {
        // Only players can suggest a new game.
        if (!token || user?.role !== "player") {
            alert("Only players can suggest a new game.");
            return;
        }
        navigate("/games/suggest");
    };

    const handleModifyGame = (gameId) => {
        navigate(`/games/${gameId}/edit`);
    };

    const handleDeleteGame = async () => {
        if (!gameToDelete) return;

        try {
            const response = await fetch(`http://localhost:8080/api/games/${gameToDelete.id}/delete`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setGames((prevGames) => prevGames.filter((game) => game.id !== gameToDelete.id));
                setGameToDelete(null);
            } else {
                alert("Failed to delete game. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting game:", error);
            alert("An error occurred. Please try again.");
        }
    };

    const isGameOwnerOrModerator = (game) =>
        user?.role === "moderator" || game.organizerId === user?.userId;

    return (
        <div className="min-h-screen bg-gray-800 text-white p-8">
            <h1 className="text-4xl font-bold mb-8 text-center">Explore Games</h1>
            {error && <p className="text-red-500 text-center">{error}</p>}

            {/* Add New Game Button for Organisers/Moderators */}
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

            {/* Suggest New Game Button for Players */}
            {user?.role === "player" && (
                <div className="mb-6 text-right">
                    <button
                        onClick={handleSuggestGame}
                        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg"
                    >
                        Suggest New Game
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
                    <div
                        key={game.id}
                        onClick={() => navigate(`/games/${game.id}`)}
                        className="bg-gray-900 rounded-lg p-4 shadow-lg hover:scale-105 transition transform cursor-pointer"
                    >
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
                        {/* If a tutorial is available, show a button to view it */}
                        {game.tutorial && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/games/${game.id}/tutorial`);
                                }}
                                className="mt-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded"
                            >
                                View Tutorial
                            </button>
                        )}
                        {isGameOwnerOrModerator(game) && (
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleModifyGame(game.id);
                                    }}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded"
                                >
                                    Modify
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setGameToDelete(game);
                                    }}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Delete Confirmation Modal */}
            {gameToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-gray-800 text-white p-6 rounded-lg">
                        <h2 className="text-xl font-bold mb-4">
                            Are you sure you want to delete the game "{gameToDelete.name}"?
                        </h2>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setGameToDelete(null)}
                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg mr-4"
                            >
                                No
                            </button>
                            <button
                                onClick={handleDeleteGame}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg"
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameExplore;

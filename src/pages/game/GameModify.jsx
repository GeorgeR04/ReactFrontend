import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../security/AuthContext.jsx";

const GameModify = () => {
    const { token, user } = useContext(AuthContext);
    const { gameId } = useParams();
    const navigate = useNavigate();

    const [game, setGame] = useState({
        name: "",
        type: "",
        description: "",
        maxPlayersPerTeam: "",
        yearOfExistence: "",
        publisher: "",
        platforms: [],
        tutorial: "" // New field for tutorial
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setGame({ ...game, [name]: value });
    };

    const handlePlatformChange = (platform) => {
        setGame((prevState) => ({
            ...prevState,
            platforms: prevState.platforms.includes(platform)
                ? prevState.platforms.filter((p) => p !== platform)
                : [...prevState.platforms, platform],
        }));
    };

    const fetchGameDetails = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/games/${gameId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setGame(data);
            } else {
                console.error("Failed to fetch game details.");
            }
        } catch (error) {
            console.error("Error fetching game details:", error);
        }
    };

    useEffect(() => {
        fetchGameDetails();
    }, [gameId, token]);

    const handleSaveChanges = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/games/${gameId}/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(game),
            });

            if (response.ok) {
                alert("Game updated successfully!");
                navigate("/games/explore");
            } else {
                const errorText = await response.text();
                alert(`Failed to update game: ${errorText}`);
            }
        } catch (err) {
            console.error("Error updating game:", err);
        }
    };

    const handlegoback = () => {
        navigate(-1);
    };

    // Determine if the logged-in user can modify the tutorial.
    const canModifyTutorial =
         user?.role === "organizer_moderator" || user?.role === "moderator" ||
        (user?.role === "organizer" && game.organizerId === user?.userId.toString());

    return (
        <div className="min-h-screen bg-gray-800 text-white p-8">
            <h1 className="text-4xl font-bold mb-8 text-center">Modify Game</h1>
            <div className="max-w-xl mx-auto space-y-4">
                <input
                    type="text"
                    name="name"
                    placeholder="Game Name"
                    value={game.name}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
                <input
                    type="text"
                    name="type"
                    placeholder="Game Type"
                    value={game.type}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
                <textarea
                    name="description"
                    placeholder="Game Description"
                    value={game.description}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
                <input
                    type="number"
                    name="maxPlayersPerTeam"
                    placeholder="Max Players per Team"
                    value={game.maxPlayersPerTeam}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
                <input
                    type="number"
                    name="yearOfExistence"
                    placeholder="Year of Existence (e.g., 2023)"
                    value={game.yearOfExistence}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
                <input
                    type="text"
                    name="publisher"
                    placeholder="Publisher"
                    value={game.publisher}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Platforms:</label>
                    {["PC", "PlayStation", "Xbox"].map((platform) => (
                        <label key={platform} className="block">
                            <input
                                type="checkbox"
                                checked={game.platforms.includes(platform)}
                                onChange={() => handlePlatformChange(platform)}
                                className="mr-2"
                            />
                            {platform}
                        </label>
                    ))}
                </div>
                {/* Tutorial field shown only if the user is allowed */}
                {canModifyTutorial && (
                    <input
                        type="text"
                        name="tutorial"
                        placeholder="Tutorial URL or Guide"
                        value={game.tutorial}
                        onChange={handleInputChange}
                        className="w-full p-2 rounded bg-gray-700 text-white"
                    />
                )}
                <button
                    onClick={handleSaveChanges}
                    className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded"
                >
                    Save Changes
                </button>
                <button
                    onClick={handlegoback}
                    className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded"
                >
                    Back to Menu
                </button>
            </div>
        </div>
    );
};

export default GameModify;

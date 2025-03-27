import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../security/AuthContext.jsx";

const GameSuggest = () => {
    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [description, setDescription] = useState("");
    const [rules, setRules] = useState("");
    const [maxPlayers, setMaxPlayers] = useState("");
    const [yearOfExistence, setYearOfExistence] = useState("");
    const [publisher, setPublisher] = useState("");
    const [platforms, setPlatforms] = useState([]);
    const [gameImage, setGameImage] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setGameImage(reader.result.split(",")[1]);
            reader.readAsDataURL(file);
        }
    };

    const togglePlatform = (platform) => {
        setPlatforms((prev) =>
            prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
        );
    };

    const handleSuggestGame = async () => {
        if (!name.trim()) {
            alert("Game name is required.");
            return;
        }
        if (!type.trim()) {
            alert("Game type is required.");
            return;
        }
        if (!description.trim()) {
            alert("Game description is required.");
            return;
        }
        if (!yearOfExistence || isNaN(yearOfExistence) || yearOfExistence <= 0) {
            alert("Valid year of existence is required.");
            return;
        }
        if (!maxPlayers || isNaN(maxPlayers) || maxPlayers <= 0) {
            alert("Valid max players per team is required.");
            return;
        }
        if (!publisher.trim()) {
            alert("Publisher is required.");
            return;
        }
        if (platforms.length === 0) {
            alert("Please select at least one platform.");
            return;
        }
        if (!gameImage) {
            alert("Please upload a game image.");
            return;
        }

        try {
            const payload = {
                name,
                type,
                description,
                rules,
                maxPlayersPerTeam: parseInt(maxPlayers),
                yearOfExistence: parseInt(yearOfExistence),
                publisher,
                platforms,
                gameImage,
            };

            const response = await fetch("http://localhost:8080/api/games/suggest", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert("Game suggestion submitted successfully! It will be reviewed by organisers.");
                navigate("/games/explore");
            } else {
                const errorText = await response.text();
                alert(`Failed to submit suggestion: ${errorText}`);
            }
        } catch (err) {
            alert("An error occurred while submitting your suggestion.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-800 text-white p-8">
            <h1 className="text-4xl font-bold mb-8 text-center">Suggest a New Game</h1>
            <div className="max-w-xl mx-auto space-y-4">
                <input
                    type="text"
                    placeholder="Game Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
                <input
                    type="text"
                    placeholder="Game Type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
                <textarea
                    placeholder="Game Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
                <textarea
                    placeholder="Game Rules (optional)"
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
                <input
                    type="number"
                    placeholder="Max Players per Team"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
                <input
                    type="number"
                    placeholder="Year of Existence (e.g., 2023)"
                    value={yearOfExistence}
                    onChange={(e) => setYearOfExistence(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
                <input
                    type="text"
                    placeholder="Publisher"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Platforms (Select one or more):
                    </label>
                    <div className="flex gap-4">
                        {["PC", "PlayStation", "Xbox"].map((platform) => (
                            <label key={platform}>
                                <input
                                    type="checkbox"
                                    value={platform}
                                    checked={platforms.includes(platform)}
                                    onChange={() => togglePlatform(platform)}
                                    className="mr-2"
                                />
                                {platform}
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Upload an image for the game (e.g., logo or cover art):
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full p-2 text-white"
                    />
                </div>
                <div className="flex gap-4 mt-8">
                    <button
                        onClick={handleSuggestGame}
                        className="flex-1 p-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded"
                    >
                        Submit Suggestion
                    </button>
                    <button
                        onClick={() => navigate("/games/explore")}
                        className="flex-1 p-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded"
                    >
                        Back to Explore
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameSuggest;

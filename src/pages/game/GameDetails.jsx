import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../security/AuthContext.jsx";
import GameReviews from "./GameReviews.jsx"; // Import du composant GameReviews

const GameDetails = () => {
    const { gameId } = useParams();
    const { token } = useContext(AuthContext);
    const [game, setGame] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGameDetails = async () => {
            try {
                // Construction des headers : ajout de l'Authorization uniquement si un token est présent.
                const headers = { "Content-Type": "application/json" };
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }
                const response = await fetch(`http://localhost:8080/api/games/${gameId}`, {
                    headers,
                });

                if (response.ok) {
                    const data = await response.json();
                    setGame(data);
                } else {
                    const message = await response.text();
                    setError(message || "Failed to fetch game details.");
                }
            } catch (err) {
                setError("An error occurred while fetching game details.");
            }
        };

        fetchGameDetails();
    }, [gameId, token]);

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    if (!game) {
        return <div className="text-white text-center">Loading game details...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
                {game.gameImage ? (
                    <img
                        src={`data:image/png;base64,${game.gameImage}`}
                        alt={`${game.name} Logo`}
                        className="w-full h-60 object-cover rounded"
                    />
                ) : (
                    <div className="w-full h-60 bg-gray-700 flex items-center justify-center text-gray-400">
                        No Image Available
                    </div>
                )}
                <h1 className="text-3xl font-bold mt-4">{game.name}</h1>
                <p className="mt-4">
                    <strong>Type:</strong> {game.type}
                </p>
                <p>
                    <strong>Description:</strong> {game.description}
                </p>
                <p>
                    <strong>Year of Existence:</strong> {game.yearOfExistence}
                </p>
                <p>
                    <strong>Last Tournament Date:</strong> {game.lastTournamentDate || "N/A"}
                </p>
                <p>
                    <strong>Best Player ID:</strong> {game.bestPlayerId || "N/A"}
                </p>
                <p>
                    <strong>Best Team ID:</strong> {game.bestTeamId || "N/A"}
                </p>
                <p>
                    <strong>Total Players:</strong> {game.totalPlayers}
                </p>
                <p>
                    <strong>Max Players Per Team:</strong> {game.maxPlayersPerTeam}
                </p>
                <p>
                    <strong>Publisher:</strong> {game.publisher}
                </p>
                <p>
                    <strong>Platforms:</strong> {game.platforms ? game.platforms.join(", ") : "N/A"}
                </p>
                <p>
                    <strong>Organizer ID:</strong> {game.organizerId}
                </p>
                <p>
                    <strong>Tournament IDs:</strong>{" "}
                    {game.tournamentIds && game.tournamentIds.length > 0
                        ? game.tournamentIds.join(", ")
                        : "No Tournaments"}
                </p>
                {game.rules && (
                    <p>
                        <strong>Rules:</strong> {game.rules}
                    </p>
                )}
                {game.tutorial && (
                    <p>
                        <strong>Tutorial:</strong> {game.tutorial}
                    </p>
                )}
                <div className="text-right mt-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded"
                    >
                        Back
                    </button>
                </div>
            </div>
            {/* Inclusion de la section des revues */}
            <GameReviews gameId={game.id} gameName={game.name} />
        </div>
    );
};

export default GameDetails;

import React, { useEffect, useState } from "react";

const PopularGames = () => {
    const [popularGames, setPopularGames] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPopularGames = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/games/popular");
                if (response.ok) {
                    const data = await response.json();
                    setPopularGames(data);
                } else {
                    setError("Failed to fetch popular games.");
                }
            } catch (err) {
                setError("An error occurred while fetching popular games.");
            }
        };

        fetchPopularGames();
    }, []);

    return (
        <div className="popular-games-section my-8">
            <h2 className="text-2xl font-bold mb-4">Popular & Trending Games</h2>
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {popularGames.map((game) => (
                    <div key={game.id} className="bg-gray-900 rounded-lg p-4 shadow-lg">
                        <h3 className="text-xl font-bold">{game.name}</h3>
                        {game.gameImage ? (
                            <img
                                src={`data:image/png;base64,${game.gameImage}`}
                                alt={`${game.name} Logo`}
                                className="w-full h-40 object-cover mt-2 rounded"
                            />
                        ) : (
                            <div className="w-full h-40 bg-gray-700 flex items-center justify-center text-gray-400 mt-2 rounded">
                                No Image
                            </div>
                        )}
                        <p className="mt-2">Players: {game.totalPlayers}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PopularGames;

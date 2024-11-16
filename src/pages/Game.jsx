import React from 'react';

const Games = () => {
    return (
        <div className="min-h-screen bg-gray-100 text-black flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-4">Games Page</h1>
            <p className="text-lg text-center max-w-2xl">
                Explore the list of games available on our platform. Whether you enjoy strategy, FPS, or casual gaming,
                we have something for everyone. Dive into the world of gaming now!
            </p>
            <div className="mt-6">
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Discover Games
                </button>
            </div>
        </div>
    );
};

export default Games;

import React from 'react';
import { Link } from 'react-router-dom';
import BackgroundImage from '../../assets/Image/gamebackground.jpg';

const Games = () => {
    return (
        <div
            className="relative min-h-screen w-full overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url(${BackgroundImage})` }}
        >
            {/* Top Gradient */}
            <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-black to-transparent"></div>

            {/* Bottom Gradient */}
            <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black to-transparent"></div>

            {/* Black Overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-60"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white px-4">
                <div className="p-8 bg-black bg-opacity-70 rounded-lg text-center w-11/12 sm:w-3/4 lg:w-1/2 shadow-lg">
                    <h1 className="text-5xl font-extrabold text-white mb-6 drop-shadow-md">
                        Discover Your Next Esport Adventure
                    </h1>
                    <p className="text-lg leading-relaxed text-gray-300 mb-6">
                        Whether you're into FPS, MOBA, or strategy games, this is the ultimate destination to explore the games that fuel the esports ecosystem.
                        Learn about their histories, developers, and the communities that drive them forward.
                    </p>
                    <p className="text-lg leading-relaxed text-gray-300 mb-6">
                        Dive deep into the competitive world of esports games, where every pixel matters and every second counts. It's not just gaming—it's a lifestyle.
                    </p>
                    <Link
                        to="/games/explore"
                        className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
                    >
                        Explore Games
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 px-4 py-2 rounded-md text-sm text-gray-300 italic">
                <p>&copy;Battlefield 3</p>
            </div>
        </div>
    );
};

export default Games;

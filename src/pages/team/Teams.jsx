import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackgroundImage from '../../assets/Image/teamsimage.jpg';

const Team = () => {
    const contentRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasSlidOut, setHasSlidOut] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (contentRef.current) {
                const rect = contentRef.current.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    setIsVisible(true);
                    setHasSlidOut(false);
                } else if (rect.bottom < 0) {
                    setIsVisible(false);
                    setHasSlidOut(true);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            className="relative min-h-screen flex flex-col items-center justify-center bg-cover bg-center overflow-hidden"
            style={{
                backgroundImage: `url(${BackgroundImage})`,
            }}
        >
            {/* Black Gradient Overlays */}
            <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-black to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black to-transparent"></div>

            {/* Content Section */}
            <div
                ref={contentRef}
                className={`relative z-10 text-center text-white p-8 bg-black bg-opacity-50 rounded-lg shadow-lg w-3/4 transition-all duration-1000 transform ${
                    isVisible
                        ? 'translate-y-0 opacity-100'
                        : hasSlidOut
                            ? 'translate-y-20 opacity-0'
                            : ''
                }`}
            >
                <h2 className="text-5xl font-extrabold mb-6">Team</h2>
                <p className="text-lg mb-4">
                    Welcome to the Team page! Discover, join, or create your own team. Be part of a community
                    that shares your passion for collaboration, competition, and growth.
                </p>
                <p className="text-lg mb-4">
                    Teams are the backbone of shared success, where individuals come together to achieve greatness.
                    Whether you're a seasoned leader or a new recruit, there's a place for you here.
                </p>
                <p className="text-lg">
                    Dive into the world of teamwork, strategy, and achievement. <strong>Your journey begins here.</strong>
                </p>

                {/* Explore Button */}
                <Link
                    to="/teams/explore"
                    className="mt-6 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                >
                    Explore Teams
                </Link>
            </div>

            {/* Footer Section */}
            <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-75 px-4 py-2 rounded-md italic">
                <p>&copy; IEM COLOGNE</p>
            </div>
        </div>
    );
};

export default Team;

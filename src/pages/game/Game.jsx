// src/pages/Games.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackgroundImage from '../../assets/Image/gamebackground.jpg';

const Games = () => {
    const contentRef = useRef(null);
    const [showTitle, setShowTitle] = useState(false);
    const [showText1, setShowText1] = useState(false);
    const [showText2, setShowText2] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => setShowTitle(true), 100);
                    setTimeout(() => setShowText1(true), 400);
                    setTimeout(() => setShowText2(true), 800);
                }
            },
            { threshold: 0.3 }
        );

        if (contentRef.current) observer.observe(contentRef.current);
        return () => {
            if (contentRef.current) observer.unobserve(contentRef.current);
        };
    }, []);

    return (
        <div
            className="relative min-h-screen w-full overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url(${BackgroundImage})` }}
        >
            {/* Gradients & Overlay */}
            <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-black to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black to-transparent" />
            <div className="absolute inset-0 bg-black bg-opacity-60" />

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
                <div
                    ref={contentRef}
                    className="bg-black bg-opacity-70 backdrop-blur-md rounded-lg shadow-lg text-center text-white p-8 max-w-2xl"
                >
                    <h1
                        className={`text-5xl font-extrabold mb-6 transition-all duration-700 transform ${
                            showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
                        }`}
                    >
                        Discover Your Next Esport Adventure
                    </h1>
                    <p
                        className={`text-lg leading-relaxed mb-6 transition-all duration-700 delay-200 transform ${
                            showText1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                        }`}
                    >
                        Whether you're into FPS, MOBA, or strategy games, this is the ultimate destination to
                        explore the games that fuel the esports ecosystem. Learn about their histories,
                        developers, and the communities that drive them forward.
                    </p>
                    <p
                        className={`text-lg leading-relaxed mb-6 transition-all duration-700 delay-400 transform ${
                            showText2 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                        }`}
                    >
                        Dive deep into the competitive world of esports games, where every pixel matters and
                        every second counts. It's not just gaming—it's a lifestyle.
                    </p>
                    <Link
                        to="/games/explore"
                        className={`inline-block font-bold py-3 px-6 rounded-lg shadow-md bg-blue-500 hover:bg-blue-600 transition-all duration-700 transform ${
                            showText2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                    >
                        Explore Games
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 px-4 py-2 rounded-md text-sm text-gray-300 italic">
                <p>&copy; Battlefield 3</p>
            </div>
        </div>
    );
};

export default Games;

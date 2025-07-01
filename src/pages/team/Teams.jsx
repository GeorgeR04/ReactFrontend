// src/pages/Team.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackgroundImage from '../../assets/Image/teamsimage.jpg';

const Team = () => {
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
            className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
            style={{
                backgroundImage: `
          linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.6)),
          url(${BackgroundImage})
        `,
            }}
        >
            <div className="absolute inset-0 bg-black bg-opacity-30" />

            <div
                ref={contentRef}
                className="relative z-10 max-w-3xl text-center p-8 rounded-lg bg-black bg-opacity-70 backdrop-blur-md shadow-lg"
            >
                <h1
                    className={`text-5xl text-white font-extrabold mb-4 tracking-tight transition-all duration-700 transform ${
                        showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
                    }`}
                >
                    Teams &amp; Organizations
                </h1>
                <p
                    className={`text-lg mb-4 text-gray-300 transition-all duration-700 delay-200 transform ${
                        showText1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                    }`}
                >
                    Step into the arena—join or form your dream squad, champion the game you love, and carve your place in a legacy of fierce competition.
                </p>
                <p
                    className={`text-lg mb-6 text-gray-300 transition-all duration-700 delay-400 transform ${
                        showText2 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                    }`}
                >
                    From rising crews to established organizations, unite under a single banner and explore the teams that are shaking up the scene.
                </p>

                <div className="flex justify-center gap-6 flex-wrap transition-all duration-700 delay-600 transform" style={{
                    opacity: showText2 ? 1 : 0,
                    transform: showText2 ? 'translateY(0)' : 'translateY(10px)'
                }}>
                    <Link
                        to="/teams/explore"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition rounded-lg text-white font-semibold shadow"
                    >
                        Explore Teams
                    </Link>
                    <Link
                        to="/organizations/explore"
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 transition rounded-lg text-white font-semibold shadow"
                    >
                        Explore Organizations
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-4 left-4 text-sm text-white bg-black bg-opacity-75 px-4 py-2 rounded-md italic">
                &copy; ESL IEM Cologne
            </div>
        </div>
    );
};

export default Team;

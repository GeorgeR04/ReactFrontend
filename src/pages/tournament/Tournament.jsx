// src/pages/Tournament.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Video from '../../assets/Video/BackgroundVideo.mp4';

const Tournament = () => {
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
        <div className="relative min-h-screen w-full overflow-hidden">
            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                className="absolute top-0 left-0 w-full h-full object-cover"
            >
                <source src={Video} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Black Gradients */}
            <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-black to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black to-transparent" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
                <div
                    ref={contentRef}
                    className="bg-black bg-opacity-70 backdrop-blur-md w-full max-w-3xl p-8 rounded-lg shadow-lg text-white text-center"
                >
                    <h2
                        className={`text-5xl font-extrabold mb-6 transition-all duration-700 transform ${
                            showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
                        }`}
                    >
                        Tournament
                    </h2>
                    <p
                        className={`text-lg mb-4 transition-all duration-700 delay-200 transform ${
                            showText1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                        }`}
                    >
                        Step into the realm where dreams are forged and legends are born. This platform isn’t just
                        a tool; it’s a gateway to create something extraordinary. Organizers hold the power to
                        design tournaments that ignite rivalries, unite communities, and showcase the unrelenting
                        spirit of competition.
                    </p>
                    <p
                        className={`text-lg mb-4 transition-all duration-700 delay-400 transform ${
                            showText2 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                        }`}
                    >
                        At the pinnacle stands the <strong>GEM Gaming Esport Major</strong>—the grand arena where only
                        the best dare to tread. Champions from across the globe battle for glory and immortality.
                        This is the ultimate proving ground, a celebration of skill, courage, and passion.
                    </p>
                    <Link
                        to="/tournament/gem"
                        className={`inline-block mt-6 font-bold py-2 px-6 rounded-lg bg-blue-500 hover:bg-blue-600 transition-all duration-700 transform ${
                            showText2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                    >
                        Explore
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 left-4 text-sm text-white bg-black bg-opacity-75 px-4 py-2 rounded-md italic">
                <p>&copy; MLG Major League Gaming 2006 Pro Circuit</p>
                <p>&copy; BLAST Final Singapore 2024</p>
            </div>
        </div>
    );
};

export default Tournament;

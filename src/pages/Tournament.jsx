import React, { useRef, useState, useEffect } from 'react';
import Video from '../assets/Video/BackgroundVideo.mp4';

const Tournament = () => {
    const contentRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasSlidOut, setHasSlidOut] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (contentRef.current) {
                const rect = contentRef.current.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    setIsVisible(true);
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

            {/* Black Gradient from Top */}
            <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-black to-transparent"></div>

            {/* Black Gradient from Bottom */}
            <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black to-transparent"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white">
                {/* Text Section */}
                <div
                    ref={contentRef}
                    className={`relative z-10 text-center text-white p-8 bg-black bg-opacity-50 w-3/4 rounded-lg transition-all duration-1000 transform top-[-15rem] ${
                        isVisible
                            ? 'translate-y-0 opacity-100'
                            : hasSlidOut
                                ? 'translate-y-20 opacity-0'
                                : ''
                    } mt-20`}
                >
                    <div className="mb-8">
                        <h2 className="text-4xl font-bold mb-4">
                            Tournament
                        </h2>
                        <p className="text-lg mb-4">
                            Step into the realm where dreams are forged and legends are born. This platform isn’t just a tool; it’s a gateway to create something extraordinary. Organizers hold the power to design tournaments that ignite rivalries, unite communities, and showcase the unrelenting spirit of competition. Every click, every match, every moment has the potential to shape history.
                        </p>
                        <p className="text-lg">
                            But at the pinnacle of it all stands the <strong>GEM Gaming Esport Major</strong>—the grand arena where only the best dare to tread. A spectacle that transcends gaming, it brings together champions from every corner of the globe to battle for glory and immortality. This is not just a tournament; it’s the ultimate proving ground, a celebration of skill, courage, and unyielding passion.
                        </p>
                        <p className="text-lg">
                            Are you ready to take your place in the story of esports? Whether you create, compete, or cheer from the stands, the journey begins here. <strong>The stage is set, and the world is watching.</strong>
                        </p>
                    </div>
                </div>
            </div>

            {/* Copyright Text */}
            <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-75 px-4 py-2 rounded-md italic">
                <p>&copy; MLG Major League Gaming 2006 Pro Circuit</p>
                <p>&copy; BLAST Final Singapore 2024</p>
            </div>
        </div>
    );
};

export default Tournament;

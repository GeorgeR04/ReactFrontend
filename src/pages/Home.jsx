import React, { useEffect, useState, useRef } from 'react';
import backgroundImage from "../assets/Image/pageImage/background.jpg";

function Home() {
    const [isVisible, setIsVisible] = useState(false);
    const [hasSlidOut, setHasSlidOut] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        setHasSlidOut(false);
                    } else if (!entry.isIntersecting && isVisible) {
                        setIsVisible(false);
                        setHasSlidOut(true);
                    }
                });
            },
            { threshold: 0.2 }
        );

        if (contentRef.current) {
            observer.observe(contentRef.current);
        }

        return () => {
            if (contentRef.current) {
                observer.unobserve(contentRef.current);
            }
        };
    }, [isVisible]);

    return (
        <div
            className="relative min-h-screen flex flex-col items-center justify-center bg-cover bg-center"
            style={{
                backgroundImage: `
                    linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0) 40%),
                    linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0) 40%),
                    url(${backgroundImage})
                `,
            }}
        >
            {/* Black Gradient from Top */}
            <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-black to-transparent"></div>

            {/* Black Gradient from Bottom */}
            <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black to-transparent"></div>

            {/* Content */}
            <div
                ref={contentRef}
                className={`relative z-10 text-center text-white p-8 bg-black bg-opacity-50 rounded-lg shadow-lg transition-all duration-1000 transform ${
                    isVisible
                        ? 'translate-y-0 opacity-100'
                        : hasSlidOut
                            ? 'translate-y-20 opacity-0'
                            : ''
                }`}
            >
                <h2 className="text-5xl font-extrabold mb-6">Welcome to Gaming Esport Major</h2>
                <p className="text-lg mb-4">
                    Welcome to Gaming Esport Major, the ultimate battleground where skill, passion, and courage collide.
                    Players from around the world gather here to showcase their talent and dedication,
                    along with organizers and a community of gamers from our global platform. Get ready for a ride full of thrills and surprises.
                </p>
                <p className="text-lg">
                    This is more than just a tournament; it is the proving ground of greatness, a place where dreams take shape, and new heroes rise.
                    <strong> This is where legends are born.</strong>
                </p>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 left-4 text-sm text-white bg-black bg-opacity-75 px-4 py-2 rounded-md italic">
                &copy; ESL IEM Cologne
            </div>
        </div>
    );
}

export default Home;

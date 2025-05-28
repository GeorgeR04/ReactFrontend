import React, { useEffect, useState, useRef } from 'react';
import backgroundImage from "../assets/Image/pageImage/background.jpg";

function Home() {
    const [showTitle, setShowTitle] = useState(false);
    const [showText1, setShowText1] = useState(false);
    const [showText2, setShowText2] = useState(false);
    const contentRef = useRef(null);

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

        return () => contentRef.current && observer.unobserve(contentRef.current);
    }, []);

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
            {/* Gradients */}
            <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-black to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black to-transparent" />

            {/* Content */}
            <div
                ref={contentRef}
                className="relative z-10 text-center text-white p-8 bg-black bg-opacity-70 backdrop-blur-md rounded-lg shadow-lg max-w-4xl"
            >
                <h2
                    className={`text-5xl font-extrabold mb-6 transition-all duration-700 transform ${
                        showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
                    }`}
                >
                    Welcome to Gaming Esport Major
                </h2>
                <p
                    className={`text-lg mb-4 transition-all duration-700 delay-200 transform ${
                        showText1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                    }`}
                >
                    Welcome to Gaming Esport Major, the ultimate battleground where skill, passion, and courage collide.
                    Players from around the world gather here to showcase their talent and dedication,
                    along with organizers and a community of gamers from our global platform. Get ready for a ride full of thrills and surprises.
                </p>
                <p
                    className={`text-lg transition-all duration-700 delay-400 transform ${
                        showText2 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                    }`}
                >
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

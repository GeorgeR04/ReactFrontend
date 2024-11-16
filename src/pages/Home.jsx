import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from "../assets/Image/pageImage/background.jpg";

function Home() {
    const [isVisible, setIsVisible] = useState(false);
    const [hasSlidOut, setHasSlidOut] = useState(false);
    const contentRef = useRef(null);
    const token = sessionStorage.getItem('token'); // Get the token to determine if user is logged in

    useEffect(() => {
        // Intersection Observer to handle visibility of the content
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);  // Slide-in when content enters the viewport
                        setHasSlidOut(false); // Reset the slide-out state when reappearing
                    } else if (!entry.isIntersecting && isVisible) {
                        setIsVisible(false); // Slide-out when content leaves the viewport
                        setHasSlidOut(true); // Track that the element has slid out
                    }
                });
            },
            { threshold: 0.2 } // Trigger when 20% of the content is visible
        );

        if (contentRef.current) {
            observer.observe(contentRef.current);
        }

        // Cleanup the observer on component unmount
        return () => {
            if (contentRef.current) {
                observer.unobserve(contentRef.current);
            }
        };
    }, [isVisible]);

    return (
        <div className="home-container w-full min-h-screen flex flex-col items-center">
            {/* Full-height background image section with top and bottom gradients */}
            <div
                className="relative w-full flex items-center justify-center overflow-hidden"
                style={{
                    height: '1080px', // Fixing the height to match the desired image height
                    backgroundImage: `
                        linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0) 40%),
                        linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0) 40%),
                        url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center top',
                }}
            >
                {/* Content on top of the image with slide-in and slide-out animation */}
                <div
                    ref={contentRef}
                    className={`relative z-10 text-center text-white p-8 bg-black bg-opacity-50 w-3/4 rounded-lg transition-all duration-1000 transform ${
                        isVisible
                            ? 'translate-y-0 opacity-100'
                            : hasSlidOut
                                ? 'translate-y-20 opacity-0'
                                : ''
                    }`}
                >
                    {/* Text Section */}
                    <div className="mb-8">
                        <h2 className="text-4xl font-bold mb-4">
                            Welcome to Gaming Esport Major
                        </h2>
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

                </div>

                {/* Image Credit - Bottom Left */}
                <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-75 px-4 py-2 rounded-md italic">
                    &copy;ESL IEM Cologne
                </div>
            </div>
        </div>
    );
}

export default Home;

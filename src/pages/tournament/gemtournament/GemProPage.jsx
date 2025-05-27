import React, { useEffect, useState } from 'react';

const GemProPage = () => {
    const [showTitle, setShowTitle] = useState(false);
    const [showText, setShowText] = useState(false);
    const [showCard, setShowCard] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setShowTitle(true), 100);
        const t2 = setTimeout(() => setShowText(true), 300);
        const t3 = setTimeout(() => setShowCard(true), 600);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);

    return (
        <div className="min-h-screen bg-black text-white px-6 py-16">
            <div className="max-w-5xl mx-auto">
                <h1
                    className={`text-4xl font-bold mb-6 transition-all duration-700 transform ${
                        showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
                    }`}
                >
                    GEM Pro Circuit
                </h1>

                <p
                    className={`text-lg mb-8 max-w-3xl transition-all duration-700 delay-150 transform ${
                        showText ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                    }`}
                >
                    Enter the Pro Circuit by proving your skills in the GEM Masters or selected S-tier community tournaments. The road to the GEM Major starts here.
                </p>

                <div
                    className={`bg-gray-800 rounded-lg p-6 shadow-lg transition-opacity duration-700 delay-300 ${
                        showCard ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <p className="italic text-gray-400">Tournament list coming soon...</p>
                </div>
            </div>
        </div>
    );
};

export default GemProPage;

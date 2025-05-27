import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import bg1 from '../../../assets/Image/tournamentpage/bg1.png';
import bg2 from '../../../assets/Image/tournamentpage/bg4.png';
import bg3 from '../../../assets/Image/tournamentpage/bg2.png';
import bg4 from '../../../assets/Image/tournamentpage/bg3.png';

import logo1 from '../../../assets/Image/tournamentpage/MainLogo.png';
import logo2 from '../../../assets/Image/tournamentpage/Procircuitlogo.png';
import logo3 from '../../../assets/Image/tournamentpage/masterslogo.png';
import logo4 from '../../../assets/Image/tournamentpage/Affiliated.png';

const sections = [
    {
        title: 'GEM Gaming Esport Major',
        description:
            'This is the ultimate battleground. The GEM Gaming Esport Major is the most prestigious tournament in the entire ecosystem. ' +
            'It’s where only the elite compete players and teams who have fought their way through fire to stand on the grandest stage. ' +
            'Every match here is a showcase of peak performance, mental toughness, and relentless ambition. This is where champions are crowned. T' +
            'he Major is the dream, the destination, and the reward for those who earn it. If you’re here, you’re not just good you’re one of the best.',
        bg: bg1,
        logo: logo1,
        line: 'GEM',
        layout: 'left',
    },
    {
        title: 'GEM Pro Circuit',
        description:
            'This is where the hunger shows. The GEM Pro Circuit is a fierce, high-stakes battleground where competitors fight for the chance to break into the Major. ' +
            'Only the top two from each Pro Circuit event qualify for the GEM Gaming Esport Major. This isn’t for beginners. ' +
            'It’s for those on the edge of greatness, ready to push harder, train longer, and rise faster. ' +
            'Whether you clawed your way up through the Masters or earned your shot via an S-tier community win, the Pro Circuit is your final trial. ' +
            'Survive this and the Major awaits.',
        bg: bg2,
        logo: logo2,
        line: 'PRO',
        layout: 'right',
    },
    {
        title: 'GEM Masters',
        description:
            'The GEM Masters is the open league—where anyone can enter, but only the strong climb out. ' +
            'It’s the front door to the professional circuit. The field is wide, the matchups are unpredictable, and the skill ceiling is constantly rising. ' +
            'This is the ultimate test of raw talent and drive. If you win a Masters event, you qualify for the Pro Circuit. ' +
            'This is your shot to get noticed, to build a name, and to prove that you belong on the path to the Major. Here, underdogs rise. ' +
            'Here, the grind begins.',
        bg: bg3,
        logo: logo3,
        line: 'MASTERS',
        layout: 'left',
    },
    {
        title: 'Other Community Tournaments',
        description:
            'These are the community-run tournaments that power the grassroots scene. ' +
            'Under the GEM Affiliated banner, organizers from all corners of the community host their own events—sometimes casual, sometimes cutthroat, always passionate. ' +
            'These battles are where new players get their first taste of competition, and veterans test their edge. ' +
            'And for the top-tier ones—the S-tier events—winning means more than just bragging rights. It’s a ticket straight into the Pro Circuit. ' +
            'The GEM Affiliated tournaments are where the fire starts, and for many, where the road to the Major begins.',
        bg: bg4,
        logo: logo4,
        line: 'OTHER',
        layout: 'right',
    },
];

const TournamentGEM = () => {
    const navigate = useNavigate();
    const sectionRefs = useRef([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            sectionRefs.current.forEach((section, index) => {
                if (!section) return;
                const rect = section.getBoundingClientRect();
                if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
                    setActiveIndex(index);
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="w-full min-h-screen bg-black text-white">
            {sections.map((section, index) => {
                const isVisible = index === activeIndex;
                return (
                    <section
                        key={index}
                        ref={(el) => (sectionRefs.current[index] = el)}
                        className={`w-full h-screen relative flex items-center justify-center transition-opacity duration-1000 ease-in-out ${
                            isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                        style={{
                            backgroundImage: `url(${section.bg})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div
                            className={`relative z-10 max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between bg-black bg-opacity-60 p-8 rounded-lg shadow-lg ${
                                section.layout === 'right' ? 'md:flex-row-reverse' : ''
                            }`}
                        >
                            {/* Logo */}
                            <img src={section.logo} alt="logo" className="w-48 h-48 object-contain mb-6 md:mb-0" />

                            {/* Text */}
                            <div className="max-w-xl md:px-8">
                                <h2 className="text-4xl font-bold mb-4">{section.title}</h2>
                                <p className="text-lg mb-6">{section.description}</p>
                                <button
                                    onClick={() => {
                                        if (section.line === 'GEM') navigate('/tournament/gem/major');
                                        else if (section.line === 'PRO') navigate('/tournament/gem/pro');
                                        else if (section.line === 'MASTERS') navigate('/tournament/gem/masters');
                                        else navigate('/tournament/explore?line=OTHER');
                                    }}
                                    className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded text-white font-bold transition"
                                >
                                    Explore
                                </button>
                            </div>
                        </div>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60"></div>
                    </section>
                );
            })}
        </div>
    );
};

export default TournamentGEM;

import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../security/AuthContext.jsx';
import logoImage from '../assets/Image/Logo1.png';
import RoleSelectionModal from './RoleSelectionModal';

const Header = () => {
    const location = useLocation(); // Obtenir la route active
    const navigate = useNavigate();
    const { token, user, logout } = useContext(AuthContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

    const handleLogout = () => {
        logout();

        // Rediriger uniquement si l'utilisateur est sur la page profil
        if (location.pathname.startsWith('/user')) {
            navigate('/login');
        }
    };
    return (
        <>
            <header className="w-full p-4 bg-black text-white flex justify-between items-center relative">
                {/* Header Logo */}
                <div className="flex items-center space-x-4 group transition duration-500 ease-in-out">
                    <Link
                        to="/"
                        className="flex items-center space-x-2 group-hover:bg-white/5 rounded-xl px-2 py-1 transition duration-300 backdrop-blur-sm"
                    >
                        <img
                            src={logoImage}
                            alt="Logo"
                            className="h-14 w-auto cursor-pointer transform transition duration-500 group-hover:scale-110 group-hover:rotate-3"
                        />
                        <div className="flex items-baseline space-x-2">
                            <span className="text-2xl font-bold text-white">GEM</span>
                                <span className="text-2xl font-bold text-white flex">
                                    {"Gaming Esport Major".split("").map((char, index) => (
                                    <span key={index} className="opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" style={{ transitionDelay: `${index * 50}ms` }}>
                                        {char === " " ? "\u00A0" : char}
                                    </span>
                                    ))}
                                </span>
                        </div>
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="flex items-center space-x-6 group">
                    <Link
                        to="/tournament"
                        className="relative text-lg font-medium transition duration-300 transform hover:scale-105 text-white hover:text-indigo-400"
                    >
                        Tournament
                        <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-indigo-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>

                    <Link
                        to="/games"
                        className="relative text-lg font-medium transition duration-300 transform hover:scale-105 text-white hover:text-purple-400"
                    >
                        Games
                        <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>

                    <Link
                        to="/teams"
                        className="relative text-lg font-medium transition duration-300 transform hover:scale-105 text-white hover:text-pink-400"
                    >
                        Teams
                        <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                </div>

                {/* Profile and Dropdown */}
                <div
                    className="relative flex items-center space-x-4"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                >
                    {token && user ? (
                        <>
                            <button className="bg-black text-white font-bold px-4 py-2 rounded-lg transition duration-300 transform hover:scale-105 shadow-sm hover:shadow-md hover:bg-indigo-600">
                                My Profile
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute top-[2.5rem] right-0 bg-gray-800 text-white rounded-xl shadow-xl z-50 w-48 animate-fade-slide">
                                    <button
                                        className="block px-4 py-2 w-full text-left transition duration-200 hover:bg-indigo-600 hover:text-white hover:pl-5"
                                        onClick={() => navigate(`/user/${user.username}`)}
                                    >
                                        Go to Profile
                                    </button>
                                    {token && user && (
                                        <button
                                            onClick={() => navigate('/chat')}
                                            className="block px-4 py-2 w-full text-left transition duration-200 hover:bg-pink-600 hover:text-white hover:pl-5"
                                        >
                                            Chat
                                        </button>
                                    )}
                                    {user?.role !== 'moderator' && (
                                        <button
                                            className="block px-4 py-2 w-full text-left transition duration-200 hover:bg-purple-600 hover:text-white hover:pl-5"
                                            onClick={() => setIsRoleModalOpen(true)}
                                        >
                                            Select Role
                                        </button>
                                    )}
                                    <button
                                        className="block px-4 py-2 w-full text-left transition duration-200 hover:bg-pink-600 hover:text-white hover:pl-5"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="bg-black text-white px-4 py-2 rounded-lg transition duration-300 transform hover:scale-105 shadow-sm hover:shadow-md hover:bg-indigo-600"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </header>

            {/* Role Selection Modal */}
            <RoleSelectionModal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                onSave={() => {
                    alert('Role details saved!');
                }}
            />
        </>
    );
};

export default Header;

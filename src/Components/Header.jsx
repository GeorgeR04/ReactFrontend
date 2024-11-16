import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoImage from '../assets/Image/LogoHome.png';
import RoleSelectionModal from './RoleSelectionModal';

const Header = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem('token');
    const username = sessionStorage.getItem('username');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

    const handleProfileNavigation = () => {
        if (token && username) {
            navigate(`/user/${username}`);
        } else {
            navigate('/login');
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <>
            <header className="w-full p-4 bg-black text-white flex justify-between items-center relative">
                {/* Header Logo */}
                <div className="flex items-center space-x-4">
                    <Link to="/" className="flex items-center space-x-2">
                        <img src={logoImage} alt="Logo" className="h-12 w-auto cursor-pointer" />
                        <span className="text-2xl font-bold">GEM Gaming Esport Major</span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="flex items-center space-x-6">
                    <Link to="/tournament" className="text-lg hover:underline">
                        Tournament
                    </Link>
                    <Link to="/games" className="text-lg hover:underline">
                        Games
                    </Link>
                </div>

                {/* Profile and Dropdown */}
                <div
                    className="relative flex items-center space-x-4"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                >
                    {token && username ? (
                        <>
                            <button className="bg-black hover:bg-gray-800 text-white font-bold px-4 py-2 rounded-lg">
                                My Profile
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute top-[2.5rem] right-0 bg-gray-800 text-white rounded-lg shadow-xl z-50 w-48">
                                    <button
                                        onClick={handleProfileNavigation}
                                        className="block px-4 py-2 hover:bg-gray-950 w-full text-left"
                                    >
                                        Go to Profile
                                    </button>
                                    <button
                                        onClick={() => setIsRoleModalOpen(true)}
                                        className="block px-4 py-2 hover:bg-gray-950 w-full text-left"
                                    >
                                        Select Role
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="block px-4 py-2 hover:bg-gray-950 w-full text-left"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
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

import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../security/AuthContext.jsx';
import logoImage from '../assets/Image/LogoHome.png';
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
                    <Link to="/teams" className="text-lg hover:underline">
                        Teams
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
                            <button className="bg-black hover:bg-gray-800 text-white font-bold px-4 py-2 rounded-lg">
                                My Profile
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute top-[2.5rem] right-0 bg-gray-800 text-white rounded-lg shadow-xl z-50 w-48">
                                    <button
                                        className="block px-4 py-2 hover:bg-gray-950 w-full text-left"
                                        onClick={() => navigate(`/user/${user.username}`)}
                                    >
                                        Go to Profile
                                    </button>
                                    <button
                                        className="block px-4 py-2 hover:bg-gray-950 w-full text-left"
                                        onClick={() => setIsRoleModalOpen(true)}
                                    >
                                        Select Role
                                    </button>
                                    <button
                                        className="block px-4 py-2 hover:bg-gray-950 w-full text-left"
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

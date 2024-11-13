import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logoImage from '../assets/Image/LogoHome.png';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = sessionStorage.getItem('token');
    const username = sessionStorage.getItem('username');

    const handleProfileNavigation = () => {
        if (token && username) {
            navigate(`/user/${username}`);
        } else {
            navigate('/login');
        }
    };

    // Hide Login/Register buttons if on the Login or Register page
    const onLoginPage = location.pathname === '/login';
    const onRegisterPage = location.pathname === '/register';

    return (
        <header className="w-full p-4 bg-black text-white flex justify-between items-center">
            {/* Header Logo and Title */}
            <div className="flex items-center space-x-4">
                <Link to="/" className="flex items-center space-x-2">
                    <img
                        src={logoImage}
                        alt="Logo"
                        className="h-12 w-auto cursor-pointer"
                    />
                    <span className="text-2xl font-bold">GEM Gaming Esport Major</span>
                </Link>
            </div>

            {/* Navigation Links or Profile Button */}
            <div className="flex items-center space-x-4">
                {token && username ? (
                    <button
                        onClick={handleProfileNavigation}
                        className="bg-black hover:bg-gray-800 text-white font-bold px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ease-in-out"
                    >
                        My Profile
                    </button>
                ) : !onLoginPage && !onRegisterPage ? (
                    <>
                        <Link
                            to="/login"
                            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ease-in-out"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ease-in-out"
                        >
                            Register
                        </Link>
                    </>
                ) : null}
            </div>
        </header>
    );
};

export default Header;

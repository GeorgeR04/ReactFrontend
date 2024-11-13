import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../security/AuthContext';
import backgroundImage from '../assets/Image/pageImage/loginbacbg.jpg';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const { login } = useContext(AuthContext);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loginRequest = { username, password };

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginRequest),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData || 'Login failed');
            }

            const data = await response.json();
            login(data.token); // Store the JWT token using login function
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div
            className="login-container w-full h-screen flex items-center justify-start relative"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Gradient Layer with Animation */}
            <div
                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                    backgroundImage: `
                        linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0) 40%),
                        linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0) 40%)`,
                }}
            ></div>

            {/* Login Form Section with Slide-in Animation */}
            <div
                className={`w-full max-w-md ml-20 bg-gray-900 p-8 rounded-lg shadow-lg transform transition-transform duration-1000 ${
                    isLoaded ? 'translate-x-0' : '-translate-x-20'
                }`}
                style={{ marginTop: '2rem' }}
            >
                <h1 className="text-3xl font-bold mb-2 text-white">Login</h1>
                <p className="text-lg mb-6 text-gray-300 italic">
                    The Return of the Legend.
                </p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2 text-gray-300">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold mb-2 text-gray-300">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    {/* Login and Register Buttons with Their Phrases */}
                    <div className="flex items-start justify-between mt-6">
                        {/* Login Section */}
                        <div className="flex flex-col items-center">
                            <p className="text-sm italic text-gray-300 mb-1">
                                Ready to join the battle?
                            </p>
                            <button
                                type="submit"
                                className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out"
                            >
                                Login
                            </button>
                        </div>

                        {/* Register Section */}
                        <div className="flex flex-col items-center">
                            <p className="text-sm italic text-gray-300 mb-1">
                                Don't have an account?
                            </p>
                            <Link
                                to="/register"
                                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ease-in-out"
                            >
                                Register
                            </Link>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-xs mt-4">{error}</p>}
                </form>
            </div>

            {/* Copyright Section in the Bottom Left */}
            <div className="absolute bottom-4 left-4 text-white italic text-sm">
                © ESL IEM COLOGNE
            </div>
        </div>
    );
}

export default Login;

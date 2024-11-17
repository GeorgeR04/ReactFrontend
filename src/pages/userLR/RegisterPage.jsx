import React, { useState, useEffect } from 'react';
import "../../index.css";
import backgroundImage1 from "../../assets/Image/regjsterImage/G2.jpg";
import backgroundImage2 from "../../assets/Image/regjsterImage/TS.jpg";
import backgroundImage3 from "../../assets/Image/regjsterImage/Navi.jpg";
import backgroundImage4 from "../../assets/Image/regjsterImage/Liquid.jpg";
import backgroundImage5 from "../../assets/Image/regjsterImage/faze.jpg";
import { Link } from 'react-router-dom';

function Register() {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = [backgroundImage1, backgroundImage2, backgroundImage3, backgroundImage4, backgroundImage5];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);

        setIsLoaded(true);

        return () => clearInterval(interval);
    }, [images.length]);

    const validateForm = () => {
        const newErrors = {};

        if (username.length < 4 || username.length > 20) {
            newErrors.username = 'Username must be between 4 and 20 characters.';
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Invalid email address.';
        }

        if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!validateForm()) {
            return;
        }

        const user = { firstname, lastname, username, email, password };

        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });

            const data = await response.text();
            if (response.ok) {
                alert('User registered successfully!');
            } else {
                setErrors({ form: data });
            }
        } catch (err) {
            setErrors({ form: 'Error connecting to server.' });
        }
    };

    return (
        <div className="register-container w-full h-screen relative overflow-hidden">
            {/* Background Image Slider with Crossfade Effect */}
            {images.map((image, index) => (
                <div
                    key={index}
                    className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
                        currentImageIndex === index ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                        backgroundImage: `url(${image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        transition: 'opacity 1s ease-in-out',
                    }}
                >
                    {/* Copyright Section for Each Image */}
                    <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-75 px-4 py-2 rounded-md italic">
                        &copy;Blast Final 2024
                    </div>
                </div>
            ))}

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

            {/* Register Form Section with Slide-in and Fade-in Animation */}
            <div
                className={`w-full max-w-md mt-8 ml-20 bg-gray-900 p-8 rounded-lg shadow-lg transform transition-all duration-1000 ease-in-out ${
                    isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
                }`}
                style={{ marginTop: '2rem' }}
            >
                <h1 className="text-3xl font-bold mb-2 text-white">Register</h1>
                {/* Additional Phrase Under the Title */}
                <p className="text-lg mb-6 text-gray-300 italic">
                    Become the new legend.
                </p>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2 text-gray-300">First Name</label>
                        <input
                            type="text"
                            value={firstname}
                            onChange={(e) => setFirstname(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Enter first name"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2 text-gray-300">Last Name</label>
                        <input
                            type="text"
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Enter last name"
                            required
                        />
                    </div>

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
                        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2 text-gray-300">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Enter email"
                            required
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    {/* Register and Login Buttons with Their Phrases */}
                    <div className="flex items-start justify-between mt-6">
                        {/* Register Section */}
                        <div className="flex flex-col items-center">
                            <p className="text-sm italic text-gray-300 mb-1">
                                Ready to become a champion?
                            </p>
                            <button
                                type="submit"
                                className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out"
                            >
                                Register
                            </button>
                        </div>

                        {/* Login Section */}
                        <div className="flex flex-col items-center">
                            <p className="text-sm italic text-gray-300 mb-1">
                                Already have an account?
                            </p>
                            <Link
                                to="/login"
                                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ease-in-out"
                            >
                                Login
                            </Link>
                        </div>
                    </div>

                    {errors.form && <p className="text-red-500 text-xs mt-4">{errors.form}</p>}
                </form>
            </div>
        </div>
    );
}

export default Register;

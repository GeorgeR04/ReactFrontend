import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../security/AuthContext';

function UserPage() {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [error, setError] = useState('');
    const { token, logout } = useContext(AuthContext);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/profile`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.status === 401) {
                    logout();
                    return;
                }

                if (response.status === 403) {
                    setError('Access forbidden: You do not have permission to view this profile.');
                    return;
                }

                if (!response.ok) {
                    throw new Error('User not found');
                }

                const data = await response.json();
                setUserProfile(data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchUserProfile();
    }, [navigate, token, logout]);

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <p className="text-red-500">{error}</p>
                <Link to="/" className="text-blue-500 underline">Back to Home</Link>
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="container mx-auto p-4">
                <p>Loading...</p>
                <Link to="/" className="text-blue-500 underline">Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            {/* Logout Button */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-5xl">Profile of {userProfile.username}</h1>
                <button
                    onClick={() => {
                        logout();
                        navigate('/login');
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-500"
                >
                    Logout
                </button>
            </div>

            {/* User Profile Information */}
            <img src={userProfile.profileImage} alt="Profile" className="rounded-full w-32 h-32 mb-4"/>
            <img src={userProfile.bannerImage} alt="Banner" className="w-full h-48 object-cover mb-4"/>
            <p className="mt-4 text-lg">First Name: {userProfile.firstname}</p>
            <p className="text-lg">Last Name: {userProfile.lastname}</p>
            <p className="text-lg">Email: {userProfile.email}</p>
            <div className="mt-4">
                <h2 className="text-2xl">Tournament Images</h2>
                <div className="flex flex-wrap">
                    {(userProfile.tournamentImages || []).map((image, index) => (
                        <img key={index} src={image} alt="Tournament" className="w-24 h-24 m-2"/>
                    ))}
                </div>
            </div>

            {/* Back to Home Link */}
            <div className="mt-6">
                <Link to="/" className="text-blue-500 underline">Back to Home</Link>
            </div>
        </div>
    );
}

export default UserPage;

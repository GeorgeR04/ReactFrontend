import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AuthContext } from '../security/AuthContext';

function UserPage() {
    const navigate = useNavigate();
    const { username } = useParams(); // Get the username from the URL
    const [userProfile, setUserProfile] = useState(null);
    const [error, setError] = useState('');
    const { token, user, logout } = useContext(AuthContext);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImageType, setSelectedImageType] = useState('');

    const getCleanToken = () => (token ? token.trim() : '');

    useEffect(() => {
        const cleanToken = getCleanToken();

        if (!cleanToken) {
            navigate('/login');
            return;
        }


        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/profile/username/${username}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${cleanToken}`,
                    },
                });

                if (response.status === 401) {
                    logout();
                    navigate('/login');
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
                console.error("Fetch error:", error);
                setError(error.message);
            }
        };

        fetchUserProfile();
    }, [username, token, navigate, logout]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleImageUpload = async () => {
        if (!selectedImage) return;

        const cleanToken = getCleanToken();

        try {
            const blob = await fetch(selectedImage).then(res => res.blob());
            const formData = new FormData();
            formData.append('file', blob, 'image.jpg');
            formData.append('type', selectedImageType);

            const response = await fetch('http://localhost:8080/api/profile/upload-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${cleanToken}`,
                },
                body: formData,
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Access forbidden: You do not have permission to upload images.');
                }
                throw new Error('Failed to upload image');
            }

            const updatedData = await response.json();
            setUserProfile(updatedData);
            setIsModalOpen(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const openModal = (imageType) => {
        setSelectedImageType(imageType);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedImage(null);
        setSelectedImageType('');
    };

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
        <div className="w-full min-h-screen bg-gray-900 text-white p-4">
            {/* Full-Width Banner starting from Left Edge */}
            <div
                className="relative w-screen h-72 bg-black cursor-pointer hover:opacity-90 transition duration-300 mb-8"
                onClick={() => openModal('banner')}
                style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }} // Start at screen's left edge
            >
                {userProfile.bannerImage && (
                    <img
                        src={`data:image/jpeg;base64,${userProfile.bannerImage}`}
                        alt="Banner"
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Profile Section Overlapping the Banner */}
            <div className="relative flex gap-8 mt-4">
                {/* Profile Info Positioned Overlapping the Banner */}
                <div
                    className="absolute left-16 transform translate-y-[-50%] bg-gray-800 text-white rounded-lg p-6 shadow-lg flex flex-col items-center space-y-4"
                    style={{ top: '65%', left: '4rem' }}  // Positioned 1rem higher
                >
                    {/* Profile Image */}
                    <div
                        className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer hover:opacity-90 transition duration-300"
                        onClick={() => openModal('profile')}
                    >
                        <img
                            src={userProfile.profileImage ? `data:image/jpeg;base64,${userProfile.profileImage}` : ""}
                            alt="Profile"
                            className="w-full h-full object-cover shadow-md"
                        />
                    </div>

                    {/* User Info */}
                    <div className="text-center">
                        <h2 className="text-xl font-semibold">
                            {userProfile.firstname} <span>"{userProfile.username}"</span> {userProfile.lastname}
                        </h2>
                    </div>
                </div>

                {/* Tournament Images Section with Distinct Background */}
                <div className="ml-auto bg-gray-800 text-white rounded-lg p-6 shadow-lg w-96 h-auto">
                    <h3 className="text-2xl font-semibold mb-4">Tournament Images</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {(userProfile.tournamentImages || []).map((image, index) => (
                            <img
                                key={index}
                                src={`data:image/jpeg;base64,${image}`}
                                alt="Tournament"
                                className="w-24 h-24 object-cover rounded-lg shadow-md"
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Logout Button */}
            <div className="flex justify-end mt-8">
                <button
                    onClick={() => {
                        logout();
                        navigate('/login');
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 shadow-lg transition duration-500"
                >
                    Logout
                </button>
            </div>

            {/* Modal for Image Upload */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                        <h2 className="text-2xl font-semibold mb-4 text-center">Upload New {selectedImageType === 'profile' ? 'Profile' : 'Banner'} Image</h2>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="mb-4 w-full"
                        />
                        {selectedImage && (
                            <img src={selectedImage} alt="Preview" className="w-full h-40 object-cover mb-4 rounded-lg shadow-md" />
                        )}
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={closeModal}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImageUpload}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-500"
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Back to Home Link */}
            <div className="mt-6 text-center">
                <Link to="/" className="text-blue-500 underline">Back to Home</Link>
            </div>
        </div>
    );
}

export default UserPage;

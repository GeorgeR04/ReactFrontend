import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AuthContext } from '../security/AuthContext';

function UserPage() {
    const navigate = useNavigate();
    const { username } = useParams();
    const [userProfile, setUserProfile] = useState(null);
    const [error, setError] = useState('');
    const { token, logout } = useContext(AuthContext);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImageType, setSelectedImageType] = useState('');
    const [slideIn, setSlideIn] = useState(false);
    const [modalPosition, setModalPosition] = useState('50%'); // Default to center

    const getCleanToken = () => (token ? token.trim() : '');

    useEffect(() => {
        setSlideIn(true);

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

        return () => setSlideIn(false);
    }, [username, token, navigate, logout]);

    useEffect(() => {
        if (isModalOpen) {
            // Calculate viewport center relative to scroll position
            const viewportCenter = window.scrollY + window.innerHeight / 2;
            setModalPosition(viewportCenter);
        }
    }, [isModalOpen]);

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
        <div className="w-full min-h-screen bg-gray-900 text-white overflow-hidden">
            {/* Full-Width Banner with Top Gradient */}
            <div
                className="relative w-full h-72 bg-black cursor-pointer hover:opacity-90 transition duration-300 mb-8"
                onClick={() => openModal('banner')}
            >
                {/* Dark gradient over the banner */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-transparent"></div>
                {userProfile.bannerImage && (
                    <img
                        src={`data:image/jpeg;base64,${userProfile.bannerImage}`}
                        alt="Banner"
                        className="w-full h-full object-cover bg-no-repeat"
                        style={{ backgroundRepeat: 'no-repeat' }}
                    />
                )}
            </div>

            {/* Main Container with Slide-In Animation */}
            <div className={`relative w-full min-h-screen bg-gray-900 text-white p-4 transition transform duration-1000 ease-out ${slideIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                {/* Profile and Tournament Section */}
                <div className="relative flex flex-col md:flex-row gap-8 mt-4">
                    {/* Profile Rectangle */}
                    <div
                        className="absolute transform translate-y-[-100%] bg-gray-800 text-white rounded-lg p-6 shadow-lg flex flex-col items-center space-y-4"
                        style={{ top: '60%', left: '10rem' }}
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

                    {/* Tournament Images Section */}
                    <div className="md:ml-auto bg-gray-800 text-white rounded-lg p-6 shadow-lg w-full md:w-96 h-auto mt-48 md:mt-0">
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

                {/* Compact Modal for Image Upload Centered in the User's Viewport */}
                {isModalOpen && (
                    <div className="top-[-20rem] fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-[1000]">
                        <div
                            className="bg-white p-6 rounded-lg shadow-lg w-1/4 max-w-xs transform transition duration-500 scale-100"
                            style={{ position: 'absolute', top: `${modalPosition - window.innerHeight / 3}px`, left: '50%', transform: 'translateX(-50%)' }}
                        >
                            <h2 className="text-black text-xl font-semibold mb-4 text-center">
                                Upload {selectedImageType === 'profile' ? 'Profile' : 'Banner'} Image
                            </h2>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="mb-4 w-full"
                            />
                            {selectedImage && (
                                <img src={selectedImage} alt="Preview" className="w-full h-24 object-cover mb-4 rounded-lg shadow-md" />
                            )}
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={closeModal}
                                    className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition duration-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleImageUpload}
                                    className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition duration-500"
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

                {/* Bottom Gradient */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gray-900 to-transparent"></div>
            </div>
        </div>
    );
}

export default UserPage;

import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../security/AuthContext';

function UserPage() {
    const navigate = useNavigate();
    const { username } = useParams();
    const location = useLocation();
    const [userProfile, setUserProfile] = useState(null);
    const [error, setError] = useState('');
    const { token, logout } = useContext(AuthContext);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImageType, setSelectedImageType] = useState('');
    const [slideIn, setSlideIn] = useState(false);
    const [modalPosition, setModalPosition] = useState('50%');

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
                    headers: { Authorization: `Bearer ${cleanToken}` },
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
                console.log(data);
                setUserProfile(data);
            } catch (error) {
                console.error('Fetch error:', error);
                setError(error.message);
            }
        };

        fetchUserProfile();

        const params = new URLSearchParams(location.search);
        if (params.get('selectRole') === 'true') {
            setShowRoleMenu(true);
        }

        return () => setSlideIn(false);
    }, [username, token, navigate, logout, location.search]);

    useEffect(() => {
        if (isModalOpen) {
            const viewportCenter = window.scrollY + window.innerHeight / 2;
            setModalPosition(viewportCenter);
        }
    }, [isModalOpen]);


    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setSelectedImage(reader.result);
        reader.readAsDataURL(file);
    };

    const handleImageUpload = async () => {
        if (!selectedImage) {
            setError('Please select an image before uploading.');
            return;
        }

        const cleanToken = getCleanToken();

        try {
            const blob = await fetch(selectedImage).then((res) => res.blob());
            const formData = new FormData();
            formData.append('file', blob, 'image.jpg');
            formData.append('type', selectedImageType);

            const response = await fetch('http://localhost:8080/api/profile/upload-image', {
                method: 'POST',
                headers: { Authorization: `Bearer ${cleanToken}` },
                body: formData,
            });

            if (!response.ok) {
                setError('Image upload failed. Please try again later.');
                return;
            }

            const updatedData = await response.json();
            setUserProfile(updatedData);
            setIsModalOpen(false);
        } catch (error) {
            setError('An error occurred while uploading the image. Please try again.');
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
                <Link to="/" className="text-blue-500 underline">
                    Back to Home
                </Link>
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="container mx-auto p-4">
                <p>Loading...</p>
                <Link to="/" className="text-blue-500 underline">
                    Back to Home
                </Link>
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
                <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent"></div>
                {userProfile.bannerImage && (
                    <img
                        src={`data:image/jpeg;base64,${userProfile.bannerImage}`}
                        alt="Banner"
                        className="w-full h-full object-cover bg-no-repeat"
                        style={{ backgroundRepeat: 'no-repeat' }}
                    />
                )}
            </div>

            {/* Main Container */}
            <div className={`relative w-full min-h-screen bg-gray-900 text-white p-4 transition transform duration-1000 ease-out ${slideIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                {/* Profile and Tournament Section */}
                <div className="relative flex flex-col md:flex-row gap-8 mt-4">
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

                        {/* Profile Details */}
                        <div className="text-center">
                            <h2 className="text-xl font-semibold">
                                {userProfile.firstname} <span>"{userProfile.username}"</span> {userProfile.lastname}
                            </h2>
                        </div>

                        {/* Role, Specialization, and Game */}
                        <div className="text-center mt-4">
                            <div className="flex flex-col items-start space-y-2">
                                <p className="text-lg font-bold capitalize">
                                    <strong>Role:</strong> {userProfile.role ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1) : 'Not specified'}
                                </p>
                                {userProfile.role === 'player' && (
                                    <>
                                        <p className="text-lg">
                                            <strong>Specialization:</strong> {userProfile.specialization || 'Not specified'}
                                        </p>
                                        <p className="text-lg">
                                            <strong>Game:</strong> {userProfile.game || 'Not specified'}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tournament Images Section */}
                    <div className="md:ml-auto bg-gray-800 text-white text-center rounded-lg p-6 shadow-lg w-full md:w-[50rem] h-auto mt-48 md:mt-0">
                        <h3 className="text-2xl font-semibold mb-4">Tournament Achievement</h3>
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

                {/* Compact Modal for Image Upload */}
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


                {/* Bottom Gradient */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black to-transparent"></div>
            </div>
        </div>
    );


}

export default UserPage;

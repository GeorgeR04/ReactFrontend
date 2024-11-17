import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../security/AuthContext.jsx';

const TournamentEdit = () => {
    const { id } = useParams();
    const { token, user, isTokenExpired } = useContext(AuthContext);
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTournament = async () => {
            if (!token || isTokenExpired(token)) {
                alert('Please log in to access this page.');
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(`http://localhost:8080/api/tournaments/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setTournament(data);
                } else {
                    console.error('Failed to fetch tournament details');
                }
            } catch (error) {
                console.error('Error fetching tournament details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTournament();
    }, [id, token, navigate, isTokenExpired]);

    const handleUpdate = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/tournaments/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(tournament),
            });

            if (response.ok) {
                alert('Tournament updated successfully!');
                navigate(`/tournament/explore/${id}`);
            } else {
                alert('Failed to update the tournament.');
            }
        } catch (error) {
            console.error('Error updating tournament:', error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTournament((prevTournament) => ({
                    ...prevTournament,
                    image: reader.result.split(',')[1], // Extract Base64 content
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) return <div className="text-center text-white">Loading tournament details...</div>;

    if (!tournament) return <div className="text-center text-white">Tournament not found</div>;

    const isParticipantsExist = tournament.participatingIds?.length > 0;

    return (
        <div className="p-8 text-white bg-gray-800">
            <h1 className="text-4xl font-bold text-center mb-8">Edit Tournament</h1>
            <div className="max-w-2xl mx-auto bg-gray-900 p-6 rounded-lg shadow-md space-y-4">
                {/* Tournament Name */}
                <input
                    type="text"
                    value={tournament.name}
                    onChange={(e) => setTournament({ ...tournament, name: e.target.value })}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                    placeholder="Tournament Name"
                />

                {/* Tournament Description */}
                <textarea
                    value={tournament.description}
                    onChange={(e) => setTournament({ ...tournament, description: e.target.value })}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                    placeholder="Tournament Description"
                />

                {/* Cash Prize */}
                <input
                    type="number"
                    value={tournament.cashPrize}
                    onChange={(e) => setTournament({ ...tournament, cashPrize: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                    placeholder="Cash Prize"
                />

                {/* Tournament Type */}
                <select
                    value={tournament.type}
                    onChange={(e) => setTournament({ ...tournament, type: e.target.value })}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                    disabled={isParticipantsExist} // Disable if participants exist
                >
                    <option value="solo">Solo</option>
                    <option value="team">Team</option>
                </select>

                {/* Max Players or Teams */}
                <input
                    type="number"
                    value={tournament.maxTeams}
                    onChange={(e) => setTournament({ ...tournament, maxTeams: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                    placeholder={
                        tournament.type === 'solo' ? 'Maximum Players' : 'Maximum Teams'
                    }
                />

                {/* Visibility */}
                <select
                    value={tournament.visibility}
                    onChange={(e) => setTournament({ ...tournament, visibility: e.target.value })}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                </select>

                {/* Trust Factor Requirement */}
                <input
                    type="number"
                    value={tournament.trustFactorRequirement}
                    onChange={(e) =>
                        setTournament({ ...tournament, trustFactorRequirement: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                    placeholder="Trust Factor Requirement"
                />

                {/* Tournament Image */}
                <div>
                    <label className="block text-gray-400 mb-2">Tournament Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                    />
                    {tournament.image && (
                        <div className="mt-4">
                            <img
                                src={`data:image/jpeg;base64,${tournament.image}`}
                                alt="Tournament"
                                className="w-full h-48 object-cover rounded"
                            />
                        </div>
                    )}
                </div>

                {/* Update Button */}
                <button
                    onClick={handleUpdate}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded"
                >
                    Update Tournament
                </button>
            </div>
        </div>
    );
};

export default TournamentEdit;

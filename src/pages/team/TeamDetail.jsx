import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../security/AuthContext.jsx';

const TeamDetail = () => {
    const { token, user } = useContext(AuthContext);
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [error, setError] = useState('');
    const [otherTeams, setOtherTeams] = useState([]);

    const canInvite = user && otherTeams.length > 0 && team?.teamLeaderId !== user.username;

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/teams/${teamId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

                const data = await res.json();
                setTeam(data);
            } catch (err) {
                setError('Failed to load team');
            }
        };

        const fetchMyTeams = async () => {
            if (!token || !user?.username) return;

            try {
                const res = await fetch('http://localhost:8080/api/teams/list', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

                const data = await res.json();
                const mine = data.filter(t =>
                    t.members.some(m => m.playerId === user.username && m.role === 'LEADER')
                );
                setOtherTeams(mine.filter(t => t.id !== teamId));
            } catch (err) {
                console.error(err);
            }
        };

        fetchTeam();
        fetchMyTeams();
    }, [token, teamId, user?.username]);

    const handleInvite = async (targetTeamId) => {
        const confirm = window.confirm(`Send organization invite to team ${targetTeamId}?`);
        if (!confirm) return;

        try {
            const res = await fetch(`http://localhost:8080/api/organizations/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify({
                    fromTeamId: targetTeamId,
                    fromLeaderId: '', // fromLeaderId optional or auto set backend
                    toTeamId: team.id,
                    toLeaderId: team.teamLeaderId,
                    orgId: null,
                }),
            });

            if (res.ok) {
                alert('Invite sent!');
            } else {
                const text = await res.text();
                alert('Failed: ' + text);
            }
        } catch (err) {
            alert('Error sending invite');
        }
    };

    if (error) return <p className="text-red-500">{error}</p>;
    if (!team) return <p className="text-white">Loading...</p>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <button onClick={() => navigate(-1)} className="text-blue-400 underline mb-4">
                ← Back
            </button>

            <h1 className="text-3xl font-bold mb-4">{team.name}</h1>

            {team.teamLogo ? (
                <img
                    src={`data:image/png;base64,${team.teamLogo}`}
                    alt="Logo"
                    className="w-60 h-40 object-cover rounded mb-4"
                />
            ) : (
                <div className="w-60 h-40 bg-gray-700 flex items-center justify-center rounded mb-4">
                    No Logo
                </div>
            )}

            <p><strong>Game:</strong> {team.gameId}</p>
            <p><strong>Leader:</strong> {team.teamLeaderId}</p>
            <p><strong>Rank:</strong> {team.rank}</p>

            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Members</h2>
                <ul>
                    {team.members.map(m => (
                        <li key={m.playerId}>
                            {m.playerId} - {m.role}
                        </li>
                    ))}
                </ul>
            </div>

            {canInvite && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-2">Invite another team to organization</h2>
                    <ul className="space-y-2">
                        {otherTeams.map(t => (
                            <li key={t.id} className="flex justify-between items-center bg-gray-800 p-4 rounded">
                                <span>{t.name}</span>
                                <button
                                    onClick={() => handleInvite(t.id)}
                                    className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                                >
                                    Invite
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TeamDetail;

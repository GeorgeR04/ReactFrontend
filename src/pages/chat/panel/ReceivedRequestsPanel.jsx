import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../security/AuthContext.jsx';
import { CheckCircle, XCircle } from 'lucide-react';

const ReceivedRequestsPanel = () => {
    const { user, token } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);

    const getCleanToken = () => token?.trim() || '';

    const fetchRequests = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/friends/received?username=${user.username}`, {
                headers: { Authorization: `Bearer ${getCleanToken()}` }
            });
            const data = await res.json();
            setRequests(data);
        } catch (err) {
            console.error('Failed to load received requests:', err);
        }
    };

    const respondToRequest = async (id, accept) => {
        try {
            await fetch(`http://localhost:8080/api/friends/respond?requestId=${id}&accept=${accept}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getCleanToken()}`
                },
                body: '{}'
            });
            fetchRequests();
        } catch (err) {
            console.error('Failed to respond to request', err);
        }
    };

    useEffect(() => {
        if (user?.username) fetchRequests();
    }, [user]);

    if (!user || !token) return null;

    return (
        <div className="bg-gray-800 p-4 mt-4 text-white rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Incoming Friend Requests</h2>
            {requests.length === 0 ? (
                <p className="text-sm text-gray-400">No incoming requests</p>
            ) : (
                <ul className="space-y-3">
                    {requests.map(r => (
                        <li
                            key={r.id}
                            className="bg-gray-700 rounded-2xl p-3 flex justify-between items-center hover:bg-gray-600 transition"
                        >
                            <div className="flex items-center gap-4">
                                <img
                                    src={`data:image/jpeg;base64,${r.sender.profileImage}`}
                                    alt="avatar"
                                    className="w-10 h-10 rounded-full"
                                />
                                <div>
                                    <p className="font-semibold">{r.sender.username} <span className="text-xs text-gray-400">({r.sender.role})</span></p>
                                    <p className="text-xs text-gray-300">{r.sender.firstname} {r.sender.lastname}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => respondToRequest(r.id, true)}
                                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-sm"
                                >
                                    <CheckCircle className="w-4 h-4" /> Accept
                                </button>
                                <button
                                    onClick={() => respondToRequest(r.id, false)}
                                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm"
                                >
                                    <XCircle className="w-4 h-4" /> Reject
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ReceivedRequestsPanel;

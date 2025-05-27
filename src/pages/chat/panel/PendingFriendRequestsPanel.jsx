import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../security/AuthContext.jsx';

const PendingFriendRequestsPanel = () => {
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
            console.error("Error fetching received requests", err);
        }
    };

    const respond = async (id, accept) => {
        try {
            await fetch(`http://localhost:8080/api/friends/respond?requestId=${id}&accept=${accept}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getCleanToken()}`
                },
                body: '{}' // PATCH/POST with body sometimes requires this
            });
            fetchRequests();
        } catch (err) {
            console.error("Failed to respond", err);
        }
    };

    useEffect(() => {
        if (user?.username) fetchRequests();
    }, [user]);

    if (!user || !token) return null;

    return (
        <div className="bg-gray-800 p-4 text-white rounded">
            <h2 className="text-lg font-bold mb-3">Pending Friend Requests</h2>
            <ul>
                {requests.map((r) => (
                    <li key={r.id} className="flex justify-between items-center mb-2 p-2 bg-gray-700 rounded">
                        <div>{r.sender.username}</div>
                        <div className="space-x-2">
                            <button
                                className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded"
                                onClick={() => respond(r.id, true)}
                            >
                                Accept
                            </button>
                            <button
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded"
                                onClick={() => respond(r.id, false)}
                            >
                                Decline
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PendingFriendRequestsPanel;

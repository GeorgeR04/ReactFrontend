import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../security/AuthContext.jsx';

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
                }
            });
            fetchRequests(); // refresh after response
        } catch (err) {
            console.error('Failed to respond to request', err);
        }
    };

    useEffect(() => {
        if (user?.username) fetchRequests();
    }, [user]);

    if (!user || !token) return null;

    return (
        <div className="bg-gray-800 p-4 mt-4 text-white rounded">
            <h2 className="font-bold mb-2">Friend Requests</h2>
            {requests.length === 0 ? (
                <p className="text-sm text-gray-400">No incoming requests</p>
            ) : (
                <ul className="space-y-2">
                    {requests.map(r => (
                        <li key={r.id} className="bg-gray-700 p-2 rounded flex justify-between items-center">
                            <span>{r.sender.username}</span>
                            <div className="space-x-2">
                                <button
                                    className="bg-green-600 px-3 py-1 rounded"
                                    onClick={() => respondToRequest(r.id, true)}
                                >
                                    Accept
                                </button>
                                <button
                                    className="bg-red-600 px-3 py-1 rounded"
                                    onClick={() => respondToRequest(r.id, false)}
                                >
                                    Reject
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

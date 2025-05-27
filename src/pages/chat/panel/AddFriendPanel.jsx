import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../security/AuthContext.jsx';

const AddFriendPanel = () => {
    const { user, token } = useContext(AuthContext);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [message, setMessage] = useState('');
    const [pendingUsernames, setPendingUsernames] = useState([]);

    const getCleanToken = () => token?.trim() || '';

    const search = async (q) => {
        if (q.length < 3) return setResults([]);
        try {
            const res = await fetch(`http://localhost:8080/api/friends/search?username=${q}`, {
                headers: { Authorization: `Bearer ${getCleanToken()}` }
            });
            if (!res.ok) {
                const text = await res.text();
                console.error('Server error:', text);
                setMessage('Invalid search request');
                return;
            }
            const data = await res.json();
            setResults(data);
        } catch (err) {
            console.error(err);
            setMessage('Search failed');
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/friends/pending?username=${user.username}`, {
                headers: { Authorization: `Bearer ${getCleanToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                const pending = data.map(r => r.receiver.username);
                setPendingUsernames(pending);
            }
        } catch (err) {
            console.error('Failed to fetch pending requests', err);
        }
    };

    const sendFriendRequest = async (receiverUsername, blockFriendRequests) => {
        if (blockFriendRequests) {
            alert("This user does not accept friend requests.");
            return;
        }

        try {
            await fetch(`http://localhost:8080/api/friends/request?senderId=${user.username}&receiverId=${receiverUsername}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getCleanToken()}`
                }
            });
            setMessage(`Request sent to ${receiverUsername}`);
            setPendingUsernames(prev => [...prev, receiverUsername]);
        } catch (err) {
            console.error('Failed to send request', err);
            setMessage('Request failed');
        }
    };

    useEffect(() => {
        if (user?.username) fetchPendingRequests();
    }, [user]);

    if (!user || !token) return null;

    return (
        <div className="bg-gray-800 p-4 text-white rounded">
            <h2 className="font-bold mb-2">Add a Friend</h2>
            <input
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    search(e.target.value);
                }}
                placeholder="Type username..."
                className="w-full p-2 rounded bg-gray-700 mb-3"
            />
            {message && <p className="text-sm text-green-400">{message}</p>}
            <ul>
                {results.map((u) => {
                    const isSelf = user.username === u.username;
                    const isPending = pendingUsernames.includes(u.username);
                    return (
                        <li key={u.id} className="flex justify-between items-center mb-2 p-2 bg-gray-700 rounded">
                            <div className="flex items-center gap-2">
                                <img src={`data:image/jpeg;base64,${u.profileImage}`} alt="profile" className="w-8 h-8 rounded-full" />
                                <div>
                                    <p>{u.username} <span className="text-sm text-gray-400">({u.role})</span></p>
                                    <p className="text-xs">{u.firstname} {u.lastname}</p>
                                </div>
                            </div>
                            <button
                                disabled={isSelf || u.blockFriendRequests || isPending}
                                onClick={() => sendFriendRequest(u.username, u.blockFriendRequests)}
                                className={`px-2 py-1 rounded ${
                                    isSelf || u.blockFriendRequests || isPending ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                                }`}
                            >
                                {isSelf ? "It's you" : isPending ? "Pending" : "Add"}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default AddFriendPanel;

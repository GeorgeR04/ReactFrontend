import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../security/AuthContext.jsx';
import { UserPlus } from 'lucide-react';

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
            const data = await res.json();
            const pending = data.map(r => r.receiver.username);
            setPendingUsernames(pending);
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
        <div className="bg-gray-800 p-4 text-white rounded-xl shadow space-y-4">
            <h2 className="text-xl font-semibold">Add a Friend</h2>
            <input
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    search(e.target.value);
                }}
                placeholder="Type username..."
                className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            />
            {message && <p className="text-sm text-green-400">{message}</p>}
            <ul className="space-y-3">
                {results.map((u) => {
                    const isSelf = user.username === u.username;
                    const isPending = pendingUsernames.includes(u.username);
                    const disabled = isSelf || u.blockFriendRequests || isPending;

                    return (
                        <li key={u.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-2xl hover:bg-gray-600 transition">
                            <div className="flex items-center gap-4">
                                <img src={`data:image/jpeg;base64,${u.profileImage}`} alt="profile" className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-semibold">{u.username} <span className="text-xs text-gray-400">({u.role})</span></p>
                                    <p className="text-xs text-gray-300">{u.firstname} {u.lastname}</p>
                                </div>
                            </div>
                            <button
                                disabled={disabled}
                                onClick={() => sendFriendRequest(u.username, u.blockFriendRequests)}
                                className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm ${
                                    disabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                <UserPlus className="w-4 h-4" />
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

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../security/AuthContext';
import { useNavigate } from 'react-router-dom';
import AddFriendPanel from './panel/AddFriendPanel.jsx';
import ReceivedRequestsPanel from './panel/ReceivedRequestsPanel.jsx';

const FriendChatPage = () => {
    const { user, token } = useContext(AuthContext);
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const navigate = useNavigate();

    const getCleanToken = () => token?.trim() || '';

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/friends/${user.username}`, {
                    headers: { Authorization: `Bearer ${getCleanToken()}` }
                });
                const data = await res.json();
                setFriends(data);
            } catch (err) {
                console.error('Error fetching friends:', err);
            }
        };
        if (user) fetchFriends();
    }, [user]);

    const loadMessages = async (friend) => {
        try {
            const res = await fetch(`http://localhost:8080/api/chat/conversation/${friend.id}`, {
                headers: { Authorization: `Bearer ${getCleanToken()}` }
            });
            const data = await res.json();
            setMessages(data);
            setSelectedFriend(friend);
        } catch (err) {
            console.error('Error loading messages:', err);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedFriend) return;

        try {
            const response = await fetch(`http://localhost:8080/api/chat/private`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getCleanToken()}`
                },
                body: JSON.stringify({
                    toUserId: selectedFriend.id,
                    content: newMessage
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to send message:', errorText);
                return;
            }

            setMessages(prev => [...prev, { sender: user.username, content: newMessage }]);
            setNewMessage('');
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    return (
        <div className="flex w-full h-screen bg-gray-900 text-white">
            {/* Friend List */}
            <div className="w-1/4 bg-gray-800 p-4 overflow-y-auto">
                <AddFriendPanel />
                <ReceivedRequestsPanel />
                <h2 className="text-xl font-bold mt-4 mb-2">Friends</h2>
                <ul className="space-y-2">
                    {friends.map((f) => (
                        <li
                            key={f.id}
                            className="flex items-center justify-between p-2 bg-gray-700 rounded hover:bg-gray-600"
                        >
                            <div
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => {
                                    console.log("Clicked friend:", f.username);
                                    loadMessages(f);
                                }}
                            >
                                <img
                                    src={`data:image/jpeg;base64,${f.profileImage}`}
                                    alt="avatar"
                                    className="w-8 h-8 rounded-full"
                                />
                                <div className="text-sm">
                                    <div className="font-semibold">
                                        {f.username} <span className="text-xs text-gray-400">({f.role})</span>
                                    </div>
                                    <div className="text-xs text-gray-300">{f.firstname} {f.lastname}</div>
                                </div>
                            </div>
                            <span className="text-xs px-2 py-1 rounded bg-green-600 text-white">
                                Friend
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Chat Panel */}
            <div className="w-3/4 flex flex-col p-6 space-y-4">
                {selectedFriend ? (
                    <>
                        <div className="flex-1 overflow-y-auto bg-gray-700 rounded-lg p-4">
                            {messages.length === 0 ? (
                                <div className="text-center text-sm text-gray-400">
                                    No messages yet. Start the conversation!
                                </div>
                            ) : (
                                messages.map((msg, i) => {
                                    const isMine = msg.senderId === user.id;
                                    const sender = isMine ? user : selectedFriend;

                                    return (
                                        <div
                                            key={i}
                                            className={`flex mb-3 ${isMine ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {!isMine && (
                                                <img
                                                    src={`data:image/jpeg;base64,${selectedFriend.profileImage}`}
                                                    alt="avatar"
                                                    className="w-8 h-8 rounded-full mr-2 self-end"
                                                />
                                            )}
                                            <div
                                                className={`px-4 py-2 rounded-2xl max-w-xs break-words shadow ${
                                                    isMine ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
                                                }`}
                                            >
                                                {msg.content}
                                            </div>
                                            {isMine && (
                                                <img
                                                    src={`data:image/jpeg;base64,${user.profileImage}`}
                                                    alt="avatar"
                                                    className="w-8 h-8 rounded-full ml-2 self-end"
                                                />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <div className="flex space-x-2">
                            <input
                                className="flex-1 p-2 rounded bg-gray-800 text-white"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                            />
                            <button
                                onClick={sendMessage}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                            >
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-lg text-center my-auto">
                        Select a friend to chat with
                    </p>
                )}
            </div>

        </div>
    );
};

export default FriendChatPage;

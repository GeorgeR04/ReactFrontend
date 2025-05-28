import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../security/AuthContext';
import { useNavigate } from 'react-router-dom';
import AddFriendPanel from './panel/AddFriendPanel.jsx';
import ReceivedRequestsPanel from './panel/ReceivedRequestsPanel.jsx';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const FriendChatPage = () => {
    const { user, token } = useContext(AuthContext);
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [stompClient, setStompClient] = useState(null);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const navigate = useNavigate();
    const [showContent, setShowContent] = useState(false);

    const getCleanToken = () => token?.trim() || '';

    useEffect(() => {
        const timeout = setTimeout(() => setShowContent(true), 200);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (!token || !user) return;

        const client = new Client({
            brokerURL: 'ws://localhost:8080/ws',
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            reconnectDelay: 5000,
            onConnect: () => {
                setStompClient(client);
                client.subscribe('/topic/public', message => {
                    const msg = JSON.parse(message.body);
                    if (msg.conversationId === activeConversationId) {
                        setMessages(prev => [...prev, msg]);
                    }
                });
            },
            onStompError: err => console.error('[STOMP ERROR]', err),
            onWebSocketError: err => console.error('[WS ERROR]', err)
        });

        client.activate();
        return () => { if (client.connected) client.deactivate(); };
    }, [token, user, activeConversationId]);

    useEffect(() => {
        if (!user) return;
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
        fetchFriends();
    }, [user]);

    const loadMessages = async (friend) => {
        try {
            const res = await fetch(`http://localhost:8080/api/chat/private/conversation-with/${friend.id}`, {
                headers: { Authorization: `Bearer ${getCleanToken()}` }
            });
            const conversationId = await res.text();
            setActiveConversationId(conversationId);

            const msgRes = await fetch(`http://localhost:8080/api/chat/conversation/${friend.id}`, {
                headers: { Authorization: `Bearer ${getCleanToken()}` }
            });
            const msgs = await msgRes.json();
            setMessages(msgs);
            setSelectedFriend(friend);
        } catch (err) {
            console.error('[Chat] Error loading messages:', err);
        }
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !selectedFriend || !activeConversationId || !stompClient?.connected) return;

        const payload = {
            senderId: user.id,
            receiverId: selectedFriend.id,
            conversationId: activeConversationId,
            content: newMessage,
            messageType: "PRIVATE"
        };

        stompClient.publish({
            destination: "/app/chat.sendMessage",
            body: JSON.stringify(payload)
        });

        setNewMessage('');
    };

    return (
        <div className={`flex w-full h-screen bg-gray-900 text-white transition-opacity duration-700 ease-in-out ${showContent ? 'opacity-100' : 'opacity-0'}`}>
            <aside className="w-1/4 bg-gray-850 p-4 space-y-4 overflow-y-auto border-r border-gray-700">
                <AddFriendPanel />
                <ReceivedRequestsPanel />
                <section>
                    <h2 className="text-xl font-bold mb-2">Friends</h2>
                    <ul className="space-y-2">
                        {friends.map((f) => (
                            <li key={f.id} className="p-2 bg-gray-700 rounded hover:bg-gray-600">
                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => loadMessages(f)}>
                                    <img
                                        src={`data:image/jpeg;base64,${f.profileImage}`}
                                        alt="avatar"
                                        className="w-9 h-9 rounded-full"
                                    />
                                    <div className="text-sm">
                                        <div className="font-semibold">{f.username} <span className="text-xs text-gray-400">({f.role})</span></div>
                                        <div className="text-xs text-gray-300">{f.firstname} {f.lastname}</div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </aside>

            <main className="w-3/4 flex flex-col p-6 space-y-4">
                {selectedFriend ? (
                    <>
                        <div className="flex-1 overflow-y-auto bg-gray-700 rounded-lg p-4 transition-all duration-500 ease-in-out">
                            {messages.length === 0 ? (
                                <div className="text-center text-sm text-gray-400">
                                    No messages yet. Start the conversation!
                                </div>
                            ) : (
                                messages.map((msg, i) => {
                                    const isMine = String(msg.senderId) === String(user.id);
                                    return (
                                        <div key={i} className={`flex mb-3 ${isMine ? 'justify-end' : 'justify-start'} transition-opacity duration-500`}>
                                            {!isMine && (
                                                <img src={`data:image/jpeg;base64,${selectedFriend.profileImage}`} alt="avatar" className="w-8 h-8 rounded-full mr-2 self-end" />
                                            )}
                                            <div className={`px-4 py-2 rounded-2xl max-w-xs break-words shadow ${isMine ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'}`}>
                                                {msg.content}
                                            </div>
                                            {isMine && (
                                                <img src={`data:image/jpeg;base64,${user.profileImage}`} alt="avatar" className="w-8 h-8 rounded-full ml-2 self-end" />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <div className="flex space-x-2">
                            <input
                                className="flex-1 p-2 rounded bg-gray-800 text-white border border-gray-600 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                            />
                            <button
                                onClick={sendMessage}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded shadow transition-all duration-300"
                            >
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-lg text-center my-auto">Select a friend to chat with</p>
                )}
            </main>
        </div>
    );
};

export default FriendChatPage;

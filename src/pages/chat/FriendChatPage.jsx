import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutThunk } from "../../store/slices/authSlice.js";

import AddFriendPanel from "./panel/AddFriendPanel.jsx";
import ReceivedRequestsPanel from "./panel/ReceivedRequestsPanel.jsx";
import OrganizationInvitesPanel from "./panel/OrganizationInvitesPanel.jsx";

import { Client } from "@stomp/stompjs";
import { apiFetch, wsUrl } from "../../config/apiBase.jsx";

function cx(...classes) {
    return classes.filter(Boolean).join(" ");
}

const FriendChatPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const user = useSelector((s) => s.auth.user);
    const token = useSelector((s) => s.auth.token);

    const cleanToken = useMemo(
        () => (typeof token === "string" ? token.trim().replace(/^Bearer\s+/i, "") : ""),
        [token]
    );

    const [friends, setFriends] = useState([]);
    const [friendsStatus, setFriendsStatus] = useState("loading");
    const [friendsError, setFriendsError] = useState("");

    const [selectedFriend, setSelectedFriend] = useState(null);
    const [activeConversationId, setActiveConversationId] = useState(null);

    const [messages, setMessages] = useState([]);
    const [messagesStatus, setMessagesStatus] = useState("idle");
    const [messagesError, setMessagesError] = useState("");

    const [newMessage, setNewMessage] = useState("");

    // ✅ STOMP client en ref (évite re-render + évite destroy/recreate sur deps instables)
    const stompRef = useRef(null);
    const [stompConnected, setStompConnected] = useState(false);

    const [showContent, setShowContent] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const listEndRef = useRef(null);
    const activeConversationIdRef = useRef(null);

    const on401 = () => {
        dispatch(logoutThunk());
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        const t = setTimeout(() => setShowContent(true), 150);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        listEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length, selectedFriend?.id]);

    useEffect(() => {
        activeConversationIdRef.current = activeConversationId;
    }, [activeConversationId]);

    // ✅ WebSocket / STOMP (stable)
    useEffect(() => {
        if (!cleanToken || !user?.username) return;

        // évite double init si déjà actif
        if (stompRef.current?.active) return;

        const client = new Client({
            brokerURL: wsUrl("/ws"),
            reconnectDelay: 5000,

            // ✅ Important: sur reconnect, headers à jour
            beforeConnect: () => {
                client.connectHeaders = { Authorization: `Bearer ${cleanToken}` };
            },

            onConnect: () => {
                setStompConnected(true);

                client.subscribe("/topic/public", (message) => {
                    try {
                        const msg = JSON.parse(message.body);
                        const currentConvId = activeConversationIdRef.current;

                        if (!msg?.conversationId) return;
                        if (!currentConvId) return;
                        if (String(msg.conversationId) !== String(currentConvId)) return;

                        setMessages((prev) => [...prev, msg]);
                    } catch (e) {
                        console.error("[STOMP] parse error", e);
                    }
                });
            },

            onWebSocketClose: (evt) => {
                setStompConnected(false);
                console.warn("[WS CLOSE]", evt?.code, evt?.reason);
            },

            onStompError: (err) => {
                console.error("[STOMP ERROR]", err);
            },

            onWebSocketError: (err) => {
                console.error("[WS ERROR]", err);
            },
        });

        stompRef.current = client;
        client.activate();

        return () => {
            try {
                client.deactivate();
            } catch {}
            stompRef.current = null;
            setStompConnected(false);
        };
    }, [cleanToken, user?.username]);

    useEffect(() => {
        if (!user || !cleanToken) return;

        const fetchFriends = async () => {
            setFriendsStatus("loading");
            setFriendsError("");

            try {
                const res = await apiFetch(`/friends/${user.username}`, {
                    headers: { Authorization: `Bearer ${cleanToken}` },
                });

                if (res.status === 401) return on401();
                if (!res.ok) throw new Error("Failed to load friends.");

                const data = await res.json();
                setFriends(Array.isArray(data) ? data : []);
                setFriendsStatus("ready");
            } catch (err) {
                setFriendsStatus("error");
                setFriendsError(err?.message || "Error fetching friends.");
            }
        };

        fetchFriends();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.username, cleanToken]);

    const loadMessages = async (friend) => {
        if (!friend?.id) return;

        setSelectedFriend(friend);
        setMessages([]);
        setMessagesStatus("loading");
        setMessagesError("");
        setIsSidebarOpen(false);

        try {
            const res = await apiFetch(`/private/conversation-with/${friend.id}`, {
                headers: { Authorization: `Bearer ${cleanToken}` },
            });

            if (res.status === 401) return on401();
            if (!res.ok) throw new Error("Failed to open conversation.");

            const conversationId = await res.text();
            setActiveConversationId(conversationId);

            const msgRes = await apiFetch(`/chat/conversation/${friend.id}`, {
                headers: { Authorization: `Bearer ${cleanToken}` },
            });

            if (msgRes.status === 401) return on401();
            if (!msgRes.ok) throw new Error("Failed to load messages.");

            const msgs = await msgRes.json();
            setMessages(Array.isArray(msgs) ? msgs : []);
            setMessagesStatus("ready");
        } catch (err) {
            setMessagesStatus("error");
            setMessagesError(err?.message || "Error loading messages.");
        }
    };

    useEffect(() => {
        if (friendsStatus !== "ready") return;
        if (!friends?.length) return;

        const params = new URLSearchParams(location.search);
        const withUser = params.get("with");
        if (!withUser) return;

        if (selectedFriend?.username && selectedFriend.username.toLowerCase() === withUser.toLowerCase()) return;

        const found = friends.find((f) => String(f.username).toLowerCase() === String(withUser).toLowerCase());
        if (found) loadMessages(found);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [friendsStatus, friends, location.search]);

    const sendMessage = () => {
        const client = stompRef.current;

        if (!newMessage.trim() || !selectedFriend || !activeConversationId) return;
        if (!user?.id) return;
        if (!client?.connected) return;

        const payload = {
            senderId: user.id,
            receiverId: selectedFriend.id,
            conversationId: activeConversationId,
            content: newMessage.trim(),
            messageType: "PRIVATE",
        };

        client.publish({
            destination: "/app/chat.sendMessage",
            body: JSON.stringify(payload),
        });

        setNewMessage("");
    };

    const avatarSrc = (base64) => (base64 ? `data:image/jpeg;base64,${base64}` : "");

    return (
        <div
            className={cx(
                "min-h-screen w-full bg-neutral-950 text-white",
                "transition-opacity duration-700 ease-in-out",
                showContent ? "opacity-100" : "opacity-0"
            )}
        >
            <div className="mx-auto flex min-h-screen max-w-7xl">
                <div className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-black text-white md:hidden">
                    <div className="flex items-center justify-between px-4 py-3">
                        <button
                            onClick={() => setIsSidebarOpen((v) => !v)}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                        >
                            {isSidebarOpen ? "Close" : "Friends"}
                        </button>
                        <div className="text-sm text-white/80">
                            {selectedFriend ? `Chat: ${selectedFriend.username}` : "Friend Chat"}
                        </div>
                    </div>
                </div>

                <aside
                    className={cx(
                        "fixed inset-y-0 left-0 z-50 w-[320px] border-r border-white/10 bg-black p-4 overflow-y-auto md:static md:z-auto md:h-auto md:w-[340px]",
                        "transition-transform duration-300",
                        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                        "pt-16 md:pt-4"
                    )}
                    aria-label="Friends sidebar"
                >
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-white/10 bg-black/55 p-4 shadow-2xl backdrop-blur">
                            <AddFriendPanel />
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/55 p-4 shadow-2xl backdrop-blur">
                            <ReceivedRequestsPanel />
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/55 p-4 shadow-2xl backdrop-blur">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold">Friends</h2>
                                <span className="text-xs text-white/60">{friends.length}</span>
                            </div>

                            {friendsStatus === "loading" && <p className="mt-3 text-sm text-white/70">Loading friends...</p>}

                            {friendsStatus === "error" && (
                                <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                                    {friendsError}
                                </p>
                            )}

                            {friendsStatus === "ready" && friends.length === 0 && (
                                <p className="mt-3 text-sm text-white/70">No friends yet. Add someone to start chatting.</p>
                            )}

                            {friendsStatus === "ready" && friends.length > 0 && (
                                <ul className="mt-3 space-y-2">
                                    {friends.map((f) => {
                                        const isActive = selectedFriend?.id === f.id;
                                        return (
                                            <li key={f.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => loadMessages(f)}
                                                    className={cx(
                                                        "w-full rounded-2xl border border-white/10 p-3 text-left transition",
                                                        "hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                                                        isActive ? "bg-white/10" : "bg-black/40"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-white/10">
                                                            {f.profileImage ? (
                                                                <img
                                                                    src={avatarSrc(f.profileImage)}
                                                                    alt={`${f.username} avatar`}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-baseline gap-2">
                                                                <div className="truncate font-semibold">{f.username}</div>
                                                                <div className="text-xs text-white/50">({f.role})</div>
                                                            </div>
                                                            <div className="truncate text-xs text-white/70">
                                                                {f.firstname} {f.lastname}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/55 p-4 shadow-2xl backdrop-blur">
                            <h2 className="text-base font-semibold">Organization Invites</h2>
                            <div className="mt-3">
                                <OrganizationInvitesPanel />
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="flex min-h-screen flex-1 flex-col px-4 pb-6 pt-20 md:pt-6">
                    <div className="flex-1 rounded-2xl border border-white/10 bg-black/55 shadow-2xl backdrop-blur">
                        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                            <div className="min-w-0">
                                <div className="text-sm text-white/60">Conversation</div>
                                <div className="truncate text-base font-semibold">
                                    {selectedFriend ? selectedFriend.username : "Select a friend"}
                                </div>
                            </div>
                            {selectedFriend && (
                                <div className="hidden items-center gap-2 sm:flex">
                                    <div className="text-xs text-white/60">Role:</div>
                                    <div className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs">
                                        {selectedFriend.role}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-[calc(100vh-260px)] md:h-[calc(100vh-220px)] overflow-y-auto px-4 py-4">
                            {!selectedFriend && (
                                <div className="flex h-full items-center justify-center text-sm text-white/60">
                                    Select a friend to chat with
                                </div>
                            )}

                            {selectedFriend && messagesStatus === "loading" && <div className="text-sm text-white/70">Loading messages...</div>}

                            {selectedFriend && messagesStatus === "error" && (
                                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                                    {messagesError}
                                </div>
                            )}

                            {selectedFriend && messagesStatus === "ready" && messages.length === 0 && (
                                <div className="text-center text-sm text-white/60">No messages yet. Start the conversation!</div>
                            )}

                            {selectedFriend && messages.length > 0 && (
                                <div className="space-y-3">
                                    {messages.map((msg, i) => {
                                        const isMine = String(msg.senderId) === String(user?.id);

                                        return (
                                            <div key={i} className={cx("flex items-end gap-2", isMine ? "justify-end" : "justify-start")}>
                                                {!isMine && (
                                                    <div className="h-8 w-8 overflow-hidden rounded-full border border-white/10 bg-white/10">
                                                        {selectedFriend.profileImage ? (
                                                            <img
                                                                src={avatarSrc(selectedFriend.profileImage)}
                                                                alt="avatar"
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full" />
                                                        )}
                                                    </div>
                                                )}

                                                <div
                                                    className={cx(
                                                        "max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow",
                                                        "break-words whitespace-pre-wrap",
                                                        isMine ? "bg-white text-neutral-950" : "bg-white/10 text-white"
                                                    )}
                                                >
                                                    {msg.content}
                                                </div>

                                                {isMine && (
                                                    <div className="h-8 w-8 overflow-hidden rounded-full border border-white/10 bg-white/10">
                                                        {user?.profileImage ? (
                                                            <img src={avatarSrc(user.profileImage)} alt="avatar" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <div ref={listEndRef} />
                                </div>
                            )}
                        </div>

                        <div className="border-t border-white/10 p-4">
                            <div className="flex gap-2">
                                <textarea
                                    className="min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-60"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                    placeholder={selectedFriend ? "Type a message... (Enter to send)" : "Select a friend to start chatting..."}
                                    disabled={!selectedFriend}
                                    rows={1}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!selectedFriend || !newMessage.trim() || !stompConnected}
                                    className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Send
                                </button>
                            </div>

                            {!stompConnected && <p className="mt-2 text-xs text-white/50">Connecting to chat server…</p>}
                        </div>
                    </div>
                </main>
            </div>

            {isSidebarOpen && (
                <button
                    aria-label="Close sidebar"
                    className="fixed inset-0 z-40 bg-black/60 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default FriendChatPage;

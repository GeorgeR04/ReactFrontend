import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutThunk } from "../../../store/slices/authSlice.js";
import { UserPlus, Search } from "lucide-react";
import { apiFetch } from "../../../config/apiBase.jsx";

function cx(...classes) {
    return classes.filter(Boolean).join(" ");
}

const AddFriendPanel = () => {
    const dispatch = useDispatch();
    const user = useSelector((s) => s.auth.user);
    const token = useSelector((s) => s.auth.token);

    const cleanToken = useMemo(
        () => (typeof token === "string" ? token.trim().replace(/^Bearer\s+/i, "") : ""),
        [token]
    );

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [message, setMessage] = useState("");
    const [pendingUsernames, setPendingUsernames] = useState([]);

    const on401 = () => dispatch(logoutThunk());

    const search = async (q) => {
        setMessage("");
        if (q.length < 3) return setResults([]);

        try {
            const res = await apiFetch(`/friends/search?username=${q}`, {
                headers: { Authorization: `Bearer ${cleanToken}` },
            });

            if (res.status === 401) return on401();

            if (!res.ok) {
                setMessage("Invalid search request");
                return;
            }

            const data = await res.json();
            setResults(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setMessage("Search failed");
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const res = await apiFetch(`/friends/pending?username=${user.username}`, {
                headers: { Authorization: `Bearer ${cleanToken}` },
            });

            if (res.status === 401) return on401();

            const data = await res.json();
            const pending = (Array.isArray(data) ? data : []).map((r) => r.receiver.username);
            setPendingUsernames(pending);
        } catch (err) {
            console.error("Failed to fetch pending requests", err);
        }
    };

    const sendFriendRequest = async (receiverUsername, blockFriendRequests) => {
        setMessage("");
        if (blockFriendRequests) {
            setMessage("This user does not accept friend requests.");
            return;
        }

        try {
            const res = await apiFetch(
                `/friends/request?senderId=${user.username}&receiverId=${receiverUsername}`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${cleanToken}` },
                }
            );

            if (res.status === 401) return on401();
            if (!res.ok) {
                setMessage("Request failed");
                return;
            }

            setMessage(`Request sent to ${receiverUsername}`);
            setPendingUsernames((prev) => [...prev, receiverUsername]);
        } catch (err) {
            console.error("Failed to send request", err);
            setMessage("Request failed");
        }
    };

    useEffect(() => {
        if (user?.username && cleanToken) fetchPendingRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.username, cleanToken]);

    if (!user || !cleanToken) return null;

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white/90">Add a Friend</h2>
            </div>

            <div className="mt-3">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            const v = e.target.value;
                            setQuery(v);
                            search(v);
                        }}
                        placeholder="Type username (min 3)..."
                        className="w-full rounded-xl border border-white/10 bg-black/40 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    />
                </div>

                {message && <p className="mt-2 text-xs text-white/70">{message}</p>}
            </div>

            <ul className="mt-3 space-y-2">
                {results.map((u) => {
                    const isSelf = user.username === u.username;
                    const isPending = pendingUsernames.includes(u.username);
                    const disabled = isSelf || u.blockFriendRequests || isPending;

                    return (
                        <li
                            key={u.id}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-3 hover:bg-white/5 transition"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <img
                                    src={`data:image/jpeg;base64,${u.profileImage}`}
                                    alt="profile"
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-white">
                                        {u.username} <span className="text-xs text-white/50">({u.role})</span>
                                    </p>
                                    <p className="truncate text-xs text-white/60">
                                        {u.firstname} {u.lastname}
                                    </p>
                                </div>
                            </div>

                            <button
                                disabled={disabled}
                                onClick={() => sendFriendRequest(u.username, u.blockFriendRequests)}
                                className={cx(
                                    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition",
                                    disabled ? "bg-white/10 text-white/40 cursor-not-allowed" : "bg-white text-black hover:bg-white/90"
                                )}
                            >
                                <UserPlus className="h-4 w-4" />
                                {isSelf ? "It's you" : isPending ? "Pending" : "Add"}
                            </button>
                        </li>
                    );
                })}

                {query.length >= 3 && results.length === 0 && (
                    <li className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/60">No results.</li>
                )}
            </ul>
        </div>
    );
};

export default AddFriendPanel;

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutThunk } from "../../../store/slices/authSlice.js";
import { CheckCircle, XCircle } from "lucide-react";
import { apiFetch } from "../../../config/apiBase.jsx";

const PendingFriendRequestsPanel = () => {
    const dispatch = useDispatch();
    const user = useSelector((s) => s.auth.user);
    const token = useSelector((s) => s.auth.token);

    const cleanToken = useMemo(
        () => (typeof token === "string" ? token.trim().replace(/^Bearer\s+/i, "") : ""),
        [token]
    );

    const [requests, setRequests] = useState([]);

    const on401 = () => dispatch(logoutThunk());

    const fetchRequests = async () => {
        try {
            const res = await apiFetch(`/friends/received?username=${user.username}`, {
                headers: { Authorization: `Bearer ${cleanToken}` },
            });

            if (res.status === 401) return on401();

            const data = await res.json();
            setRequests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching received requests", err);
        }
    };

    const respond = async (id, accept) => {
        try {
            const res = await apiFetch(`/friends/respond?requestId=${id}&accept=${accept}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${cleanToken}`,
                },
                body: "{}",
            });

            if (res.status === 401) return on401();

            fetchRequests();
        } catch (err) {
            console.error("Failed to respond", err);
        }
    };

    useEffect(() => {
        if (user?.username && cleanToken) fetchRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.username, cleanToken]);

    if (!user || !cleanToken) return null;

    return (
        <div className="bg-gray-800 p-4 mt-4 text-white rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Pending Friend Requests</h2>
            {requests.length === 0 ? (
                <p className="text-sm text-gray-400">No pending requests</p>
            ) : (
                <ul className="space-y-3">
                    {requests.map((r) => (
                        <li
                            key={r.id}
                            className="flex justify-between items-center p-3 bg-gray-700 rounded-2xl hover:bg-gray-600 transition"
                        >
                            <div className="flex items-center gap-4">
                                <img
                                    src={`data:image/jpeg;base64,${r.sender.profileImage}`}
                                    alt="avatar"
                                    className="w-10 h-10 rounded-full"
                                />
                                <div>
                                    <p className="font-semibold">
                                        {r.sender.username} <span className="text-xs text-gray-400">({r.sender.role})</span>
                                    </p>
                                    <p className="text-xs text-gray-300">
                                        {r.sender.firstname} {r.sender.lastname}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => respond(r.id, true)}
                                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-sm"
                                >
                                    <CheckCircle className="w-4 h-4" /> Accept
                                </button>
                                <button
                                    onClick={() => respond(r.id, false)}
                                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm"
                                >
                                    <XCircle className="w-4 h-4" /> Decline
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PendingFriendRequestsPanel;

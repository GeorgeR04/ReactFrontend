import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../../security/AuthContext.jsx";
import { CheckCircle, XCircle } from "lucide-react";
import {apiFetch} from "../../../config/apiBase.jsx";

function cx(...classes) {
    return classes.filter(Boolean).join(" ");
}

const ReceivedRequestsPanel = () => {
    const { user, token } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);

    const cleanToken = useMemo(() => token?.trim() || "", [token]);

    const fetchRequests = async () => {
        try {
            const res = await apiFetch(`/friends/received?username=${user.username}`, {
                headers: { Authorization: `Bearer ${cleanToken}` },
            });
            const data = await res.json();
            setRequests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load received requests:", err);
        }
    };

    const respondToRequest = async (id, accept) => {
        try {
            await apiFetch(`/friends/respond?requestId=${id}&accept=${accept}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${cleanToken}`,
                },
                body: "{}",
            });
            fetchRequests();
        } catch (err) {
            console.error("Failed to respond to request", err);
        }
    };

    useEffect(() => {
        if (user?.username) fetchRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.username]);

    if (!user || !token) return null;

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <h2 className="text-sm font-semibold text-white/90">Incoming Requests</h2>

            {requests.length === 0 ? (
                <p className="mt-3 text-xs text-white/60">No incoming requests</p>
            ) : (
                <ul className="mt-3 space-y-2">
                    {requests.map((r) => (
                        <li
                            key={r.id}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-3 hover:bg-white/5 transition"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <img
                                    src={`data:image/jpeg;base64,${r.sender.profileImage}`}
                                    alt="avatar"
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-white">
                                        {r.sender.username}{" "}
                                        <span className="text-xs text-white/50">({r.sender.role})</span>
                                    </p>
                                    <p className="truncate text-xs text-white/60">
                                        {r.sender.firstname} {r.sender.lastname}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => respondToRequest(r.id, true)}
                                    className={cx(
                                        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold",
                                        "bg-white text-black hover:bg-white/90 transition"
                                    )}
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Accept
                                </button>
                                <button
                                    onClick={() => respondToRequest(r.id, false)}
                                    className={cx(
                                        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold",
                                        "border border-white/15 bg-white/5 text-white hover:bg-white/10 transition"
                                    )}
                                >
                                    <XCircle className="h-4 w-4" />
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

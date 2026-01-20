import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../security/AuthContext.jsx";
import {apiFetch} from "../../config/apiBase.jsx";

const ModeratorGameRequests = () => {
    const { token } = useContext(AuthContext);

    const [requests, setRequests] = useState([]);
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState("");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    /* =========================
       LOAD PENDING REQUESTS
       ========================= */
    useEffect(() => {
        apiFetch("/game-requests/pending", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then(setRequests)
            .catch(() => setError("Failed to load requests"));
    }, [token]);

    /* =========================
       APPROVE (SEND FULL OBJECT)
       ========================= */
    const approve = async () => {
        if (!selected) return;

        setLoading(true);
        try {
            const res = await apiFetch(
                `/game-requests/${selected.id}/approve`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(selected),
                }
            );

            if (!res.ok) throw new Error();

            setRequests((prev) => prev.filter((r) => r.id !== selected.id));
            setSelected(null);
        } catch {
            alert("Failed to approve request");
        } finally {
            setLoading(false);
        }
    };

    /* =========================
       REJECT
       ========================= */
    const reject = async () => {
        if (!reason.trim()) {
            alert("Rejection reason is required");
            return;
        }

        setLoading(true);
        try {
            const res = await apiFetch(
                `/api/game-requests/${selected.id}/reject`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "text/plain",
                    },
                    body: reason,
                }
            );

            if (!res.ok) throw new Error();

            setRequests((prev) => prev.filter((r) => r.id !== selected.id));
            setSelected(null);
            setReason("");
        } catch {
            alert("Failed to reject request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
            <h1 className="text-3xl font-semibold mb-6">
                Game Requests (Moderator)
            </h1>

            {error && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                </div>
            )}

            <div className="grid md:grid-cols-[320px_1fr] gap-6">
                {/* LIST */}
                <aside className="space-y-3">
                    {requests.length === 0 && (
                        <p className="text-sm text-white/60">
                            No pending requests 🎉
                        </p>
                    )}

                    {requests.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => setSelected(r)}
                            className={`w-full text-left rounded-xl p-3 border ${
                                selected?.id === r.id
                                    ? "border-white bg-white/10"
                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                        >
                            <p className="font-semibold">{r.name}</p>
                            <p className="text-xs text-white/60">
                                by {r.createdBy}
                            </p>
                        </button>
                    ))}
                </aside>

                {/* EDIT PANEL */}
                {selected && (
                    <section className="rounded-2xl border border-white/10 bg-black/55 p-6 space-y-4">
                        <h2 className="text-xl font-semibold">
                            Review: {selected.name}
                        </h2>

                        <input
                            placeholder="Game name"
                            value={selected.name || ""}
                            onChange={(e) =>
                                setSelected({ ...selected, name: e.target.value })
                            }
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
                        />

                        <input
                            placeholder="Type"
                            value={selected.type || ""}
                            onChange={(e) =>
                                setSelected({ ...selected, type: e.target.value })
                            }
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
                        />

                        <textarea
                            rows={3}
                            placeholder="Description"
                            value={selected.description || ""}
                            onChange={(e) =>
                                setSelected({
                                    ...selected,
                                    description: e.target.value,
                                })
                            }
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
                        />

                        <textarea
                            rows={3}
                            placeholder="Rules"
                            value={selected.rules || ""}
                            onChange={(e) =>
                                setSelected({ ...selected, rules: e.target.value })
                            }
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
                        />

                        <textarea
                            rows={3}
                            placeholder="Tutorial"
                            value={selected.tutorial || ""}
                            onChange={(e) =>
                                setSelected({
                                    ...selected,
                                    tutorial: e.target.value,
                                })
                            }
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
                        />

                        <input
                            type="number"
                            placeholder="Max players per team"
                            value={selected.maxPlayersPerTeam || ""}
                            onChange={(e) =>
                                setSelected({
                                    ...selected,
                                    maxPlayersPerTeam: Number(e.target.value),
                                })
                            }
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
                        />

                        <input
                            type="number"
                            placeholder="Year of existence"
                            value={selected.yearOfExistence || ""}
                            onChange={(e) =>
                                setSelected({
                                    ...selected,
                                    yearOfExistence: Number(e.target.value),
                                })
                            }
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
                        />

                        <input
                            placeholder="Publisher"
                            value={selected.publisher || ""}
                            onChange={(e) =>
                                setSelected({
                                    ...selected,
                                    publisher: e.target.value,
                                })
                            }
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
                        />

                        {/* ACTIONS */}
                        <div className="flex gap-3 pt-4">
                            <button
                                disabled={loading}
                                onClick={approve}
                                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
                            >
                                Approve
                            </button>

                            <button
                                disabled={loading}
                                onClick={reject}
                                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/20"
                            >
                                Reject
                            </button>
                        </div>

                        <textarea
                            placeholder="Rejection reason (required if rejecting)"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
                        />
                    </section>
                )}
            </div>
        </main>
    );
};

export default ModeratorGameRequests;

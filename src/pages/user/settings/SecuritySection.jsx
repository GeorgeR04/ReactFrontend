import { useContext, useState } from "react";
import { AuthContext } from "../../../security/AuthContext.jsx";

export default function SecuritySection() {
    const { token, logout } = useContext(AuthContext);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pwOpen, setPwOpen] = useState(false);

    const [newPassword, setNewPassword] = useState("");
    const [pwError, setPwError] = useState("");
    const [deleteError, setDeleteError] = useState("");

    // 🗑️ DELETE ACCOUNT
    const handleDelete = async () => {
        setDeleteError("");

        try {
            const res = await fetch("http://localhost:8080/api/users/me", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Delete failed");
            }

            logout();
        } catch (e) {
            setDeleteError(e.message || "Failed to delete account");
        }
    };

    // 🔐 CHANGE PASSWORD
    const changePassword = async () => {
        setPwError("");

        if (!newPassword.trim()) {
            setPwError("Password is required");
            return;
        }

        if (newPassword.length < 6) {
            setPwError("Password must be at least 6 characters");
            return;
        }

        try {
            const res = await fetch(
                "http://localhost:8080/api/users/me/password",
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ newPassword }),
                }
            );

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Password update failed");
            }

            setPwOpen(false);
            setNewPassword("");
            setPwError("");
        } catch (e) {
            setPwError(e.message);
        }
    };

    return (
        <>
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 shadow-2xl">
                <h2 className="text-lg font-semibold text-red-200">
                    Danger Zone
                </h2>
                <p className="mt-2 text-sm text-red-300">
                    Security-sensitive actions.
                </p>

                {deleteError && (
                    <p className="mt-3 text-sm text-red-300">
                        {deleteError}
                    </p>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                    <button
                        onClick={() => {
                            setPwError("");
                            setPwOpen(true);
                        }}
                        className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                    >
                        Change password
                    </button>

                    <button
                        onClick={() => {
                            setDeleteError("");
                            setConfirmOpen(true);
                        }}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                        Delete account
                    </button>
                </div>
            </div>

            {/* 🔐 CHANGE PASSWORD MODAL */}
            {pwOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-6 text-white shadow-2xl">
                        <h3 className="text-lg font-semibold">
                            Change password
                        </h3>

                        {pwError && (
                            <p className="mt-3 text-sm text-red-300">
                                {pwError}
                            </p>
                        )}

                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New password"
                            className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                        />

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setPwOpen(false);
                                    setPwError("");
                                    setNewPassword("");
                                }}
                                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={changePassword}
                                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🗑️ DELETE CONFIRMATION MODAL */}
            {confirmOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-neutral-950 p-6 text-white shadow-2xl">
                        <h3 className="text-lg font-semibold text-red-300">
                            Confirm account deletion
                        </h3>

                        <p className="mt-3 text-sm text-white/70">
                            This action is permanent and cannot be undone.
                        </p>

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setConfirmOpen(false);
                                    setDeleteError("");
                                }}
                                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDelete}
                                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                            >
                                Delete permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

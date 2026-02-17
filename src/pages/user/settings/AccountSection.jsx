import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { apiFetch } from "../../../config/apiBase.jsx";
import { patchUser } from "../../../store/slices/authSlice";
import { fetchMyProfile } from "../../../store/slices/profilesSlice";


export default function AccountSection() {
    const dispatch = useDispatch();
    const token = useSelector((s) => s.auth.token);

    const [open, setOpen] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const save = async () => {
        setError("");

        if (!username.trim()) {
            setError("Username is required");
            return;
        }

        if (!email.trim()) {
            setError("Email is required");
            return;
        }

        setLoading(true);

        try {
            const res = await apiFetch("/api/users/me", {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: { username, email },
            });

            if (!res.ok) throw new Error((await res.text()) || "Update failed");

            dispatch(patchUser({ username, email }));
            dispatch(fetchMyProfile({ token: String(token).trim() }));
            setOpen(false);

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Update failed");
            }

            window.location.reload();
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <div className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur">
                <h2 className="text-lg font-semibold">Account Information</h2>
                <p className="mt-2 text-sm text-white/70">
                    Update your username or email.
                </p>

                <div className="mt-4">
                    <button
                        onClick={() => setOpen(true)}
                        className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
                    >
                        Edit account
                    </button>
                </div>
            </div>

            {open && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-6 text-white shadow-2xl">
                        <h3 className="text-lg font-semibold">Edit account</h3>

                        {error && (
                            <p className="mt-3 text-sm text-red-300">{error}</p>
                        )}

                        <div className="mt-4 space-y-3">
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="New username"
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                            />

                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="New email"
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={() => setOpen(false)}
                                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={save}
                                disabled={loading}
                                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

import React, { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AuthContext } from "../../security/AuthContext.jsx";

function cx(...classes) {
    return classes.filter(Boolean).join(" ");
}

function UserPage() {
    const navigate = useNavigate();
    const { username } = useParams(); // peut être "settings" OU un vrai username
    const { token, logout } = useContext(AuthContext);

    const cleanToken = useMemo(() => (token ? token.trim() : ""), [token]);

    const [userProfile, setUserProfile] = useState(null);
    const [status, setStatus] = useState("loading"); // loading | ready | error
    const [error, setError] = useState("");
    const [slideIn, setSlideIn] = useState(false);

    useEffect(() => {
        setSlideIn(true);

        if (!cleanToken) {
            navigate("/login");
            return;
        }

        const fetchUserProfile = async () => {
            setStatus("loading");
            setError("");

            try {
                // 🔥 LOGIQUE CLÉ : settings ≠ username
                const endpoint =
                    username === "settings"
                        ? "http://localhost:8080/api/profile/me"
                        : `http://localhost:8080/api/profile/username/${username}`;

                const response = await fetch(endpoint, {
                    headers: {
                        Authorization: `Bearer ${cleanToken}`,
                    },
                });

                if (response.status === 401) {
                    logout();
                    navigate("/login");
                    return;
                }

                if (!response.ok) {
                    throw new Error("User not found");
                }

                const data = await response.json();
                setUserProfile(data);
                setStatus("ready");
            } catch (err) {
                setStatus("error");
                setError(err?.message || "An error occurred.");
            }
        };

        fetchUserProfile();
        return () => setSlideIn(false);
    }, [username, cleanToken, navigate, logout]);

    // ---------- UI STATES ----------

    if (status === "error") {
        return (
            <main className="min-h-screen bg-neutral-950 text-white">
                <section className="mx-auto max-w-4xl px-4 py-16">
                    <div className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur">
                        <h1 className="text-2xl font-semibold">Something went wrong</h1>
                        <p className="mt-3 text-white/80">{error}</p>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-white/90"
                            >
                                Go back
                            </button>
                            <Link
                                to="/"
                                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                            >
                                Home
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    if (status === "loading" || !userProfile) {
        return (
            <main className="min-h-screen bg-neutral-950 text-white">
                <section className="mx-auto max-w-4xl px-4 py-16">
                    <div className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur">
                        <p className="text-white/80">Loading profile…</p>
                        <div className="mt-4 h-2 w-full rounded-full bg-white/10">
                            <div className="h-2 w-1/3 rounded-full bg-white/30 animate-pulse" />
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    const fullName = `${userProfile.firstname ?? ""} "${userProfile.username ?? ""}" ${
        userProfile.lastname ?? ""
    }`.trim();

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            {/* Banner */}
            <section className="relative">
                <div className="relative h-56 w-full overflow-hidden bg-black sm:h-72">
                    {userProfile.bannerImage ? (
                        <img
                            src={`data:image/jpeg;base64,${userProfile.bannerImage}`}
                            alt="User banner"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-black/70" />
                </div>

                {/* Profile header */}
                <div
                    className={cx(
                        "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8",
                        "relative -mt-14 sm:-mt-16 transition-all duration-700",
                        slideIn ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                    )}
                >
                    <div className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur sm:p-8">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 overflow-hidden rounded-full border border-white/15 bg-black sm:h-24 sm:w-24">
                                    {userProfile.profileImage ? (
                                        <img
                                            src={`data:image/jpeg;base64,${userProfile.profileImage}`}
                                            alt="User profile"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-white/10" />
                                    )}
                                </div>

                                <div>
                                    <h1 className="text-xl font-semibold sm:text-2xl">
                                        {fullName || "User"}
                                    </h1>
                                    <p className="mt-1 text-sm text-white/70">
                                        @{userProfile.username}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-sm text-white/70">Role</p>
                                <p className="mt-1 text-base font-semibold capitalize">
                                    {userProfile.role || "Not specified"}
                                </p>

                                {userProfile.role === "player" && (
                                    <div className="mt-3 space-y-1 text-sm text-white/80">
                                        <p>
                                            <span className="text-white/70">Specialization:</span>{" "}
                                            {userProfile.specialization || "Not specified"}
                                        </p>
                                        <p>
                                            <span className="text-white/70">Game:</span>{" "}
                                            {userProfile.game || "Not specified"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default UserPage;

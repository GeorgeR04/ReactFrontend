import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../security/AuthContext.jsx";
import CornerBadge from "../../Components/ui/CornerBadge.jsx";

function cx(...classes) {
    return classes.filter(Boolean).join(" ");
}

function UserPage() {
    const navigate = useNavigate();
    const { username } = useParams();
    const location = useLocation();

    const { token, logout } = useContext(AuthContext);
    const cleanToken = useMemo(() => (token ? token.trim() : ""), [token]);

    const [userProfile, setUserProfile] = useState(null);
    const [status, setStatus] = useState("loading"); // loading | ready | error
    const [error, setError] = useState("");

    // Upload modal state
    const [selectedImage, setSelectedImage] = useState(null); // dataURL
    const [selectedImageType, setSelectedImageType] = useState(""); // 'profile' | 'banner'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef(null);
    const modalRef = useRef(null);

    // Small entrance animation (like your slideIn)
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
                const response = await fetch(`http://localhost:8080/api/profile/username/${username}`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${cleanToken}` },
                });

                if (response.status === 401) {
                    logout();
                    navigate("/login");
                    return;
                }

                if (response.status === 403) {
                    setStatus("error");
                    setError("Access forbidden: You do not have permission to view this profile.");
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

        // NOTE: Ton ancien code faisait setShowRoleMenu(true) ici, mais le state n'existe pas.
        // On n'ajoute pas de comportement caché sans ton code complet du menu.
        // Si tu veux, on le remettra proprement avec un state réel.

        return () => setSlideIn(false);
    }, [username, cleanToken, navigate, logout, location.search]);

    // Modal: focus + esc close
    useEffect(() => {
        if (!isModalOpen) return;

        const prevActive = document.activeElement;

        const onKeyDown = (e) => {
            if (e.key === "Escape") closeModal();
        };

        document.addEventListener("keydown", onKeyDown);

        // focus file input (or modal)
        window.setTimeout(() => {
            fileInputRef.current?.focus?.();
            modalRef.current?.focus?.();
        }, 0);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            prevActive?.focus?.();
        };
    }, [isModalOpen]);

    const openModal = (imageType) => {
        setSelectedImageType(imageType);
        setSelectedImage(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedImage(null);
        setSelectedImageType("");
    };

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setSelectedImage(reader.result);
        reader.readAsDataURL(file);
    };

    const handleImageUpload = async () => {
        setError("");

        if (!selectedImage) {
            setError("Please select an image before uploading.");
            return;
        }

        try {
            const blob = await fetch(selectedImage).then((res) => res.blob());
            const formData = new FormData();
            formData.append("file", blob, "image.jpg");
            formData.append("type", selectedImageType);

            const response = await fetch("http://localhost:8080/api/profile/upload-image", {
                method: "POST",
                headers: { Authorization: `Bearer ${cleanToken}` },
                body: formData,
            });

            if (response.status === 401) {
                logout();
                navigate("/login");
                return;
            }

            if (!response.ok) {
                setError("Image upload failed. Please try again later.");
                return;
            }

            const updatedData = await response.json();
            setUserProfile(updatedData);
            closeModal();
        } catch {
            setError("An error occurred while uploading the image. Please try again.");
        }
    };

    // --- UI States ---
    if (status === "error") {
        return (
            <main className="min-h-screen bg-neutral-950 text-white">
                <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur">
                        <h1 className="text-2xl font-semibold">Something went wrong</h1>
                        <p className="mt-3 text-white/80">{error}</p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                                Go back
                            </button>
                            <Link
                                to="/"
                                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                                Back to Home
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
                <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur">
                        <p className="text-white/80">Loading profile...</p>
                        <div className="mt-4 h-2 w-full rounded-full bg-white/10">
                            <div className="h-2 w-1/3 rounded-full bg-white/30 animate-pulse" />
                        </div>
                        <Link to="/" className="mt-6 inline-block text-sm text-white/70 hover:text-white hover:underline">
                            Back to Home
                        </Link>
                    </div>
                </section>
            </main>
        );
    }

    const fullName = `${userProfile.firstname ?? ""} "${userProfile.username ?? ""}" ${userProfile.lastname ?? ""}`.trim();

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            {/* Banner */}
            <section className="relative">
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => openModal("banner")}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") openModal("banner");
                    }}
                    className="relative h-56 w-full cursor-pointer overflow-hidden bg-black outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:h-72"
                    aria-label="Change banner image"
                >
                    {/* image */}
                    {userProfile.bannerImage ? (
                        <img
                            src={`data:image/jpeg;base64,${userProfile.bannerImage}`}
                            alt="User banner"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
                    )}

                    {/* overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-black/70" />
                </div>

                {/* Profile header card overlay */}
                <div
                    className={cx(
                        "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8",
                        "relative -mt-14 sm:-mt-16",
                        "transition-all duration-700",
                        slideIn ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                    )}
                >
                    <div className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur sm:p-8">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                            {/* avatar + name */}
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => openModal("profile")}
                                    className="group relative h-20 w-20 overflow-hidden rounded-full border border-white/15 bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:h-24 sm:w-24"
                                    aria-label="Change profile image"
                                >
                                    {userProfile.profileImage ? (
                                        <img
                                            src={`data:image/jpeg;base64,${userProfile.profileImage}`}
                                            alt="User profile"
                                            className="h-full w-full object-cover transition group-hover:opacity-90"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-white/10" />
                                    )}
                                </button>

                                <div>
                                    <h1 className="text-xl font-semibold sm:text-2xl">{fullName || "User"}</h1>
                                    <p className="mt-1 text-sm text-white/70">@{userProfile.username}</p>
                                </div>
                            </div>

                            {/* role block */}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-sm text-white/70">Role</p>
                                <p className="mt-1 text-base font-semibold capitalize text-white">
                                    {userProfile.role ? userProfile.role : "Not specified"}
                                </p>

                                {userProfile.role === "player" && (
                                    <div className="mt-3 space-y-1 text-sm text-white/80">
                                        <p>
                                            <span className="text-white/70">Specialization:</span>{" "}
                                            <span className="font-medium text-white">{userProfile.specialization || "Not specified"}</span>
                                        </p>
                                        <p>
                                            <span className="text-white/70">Game:</span>{" "}
                                            <span className="font-medium text-white">{userProfile.game || "Not specified"}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main content */}
            <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Achievements */}
                    <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur sm:p-8">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold sm:text-xl">Tournament Achievement</h2>
                            <span className="text-xs text-white/60">
                {(userProfile.tournamentImages || []).length} images
              </span>
                        </div>

                        {(userProfile.tournamentImages || []).length === 0 ? (
                            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                                No tournament images yet.
                            </div>
                        ) : (
                            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                {(userProfile.tournamentImages || []).map((image, index) => (
                                    <img
                                        key={index}
                                        src={`data:image/jpeg;base64,${image}`}
                                        alt={`Tournament achievement ${index + 1}`}
                                        className="h-28 w-full rounded-xl object-cover shadow-md"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Side quick actions / info */}
                    <aside className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur sm:p-8">
                        <h3 className="text-lg font-semibold">Quick actions</h3>
                        <div className="mt-4 space-y-3">
                            <button
                                type="button"
                                onClick={() => openModal("profile")}
                                className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                                Change profile image
                            </button>
                            <button
                                type="button"
                                onClick={() => openModal("banner")}
                                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                                Change banner image
                            </button>

                            <Link
                                to="/"
                                className="block w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-center text-sm font-semibold text-white/90 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                                Back to Home
                            </Link>
                        </div>

                        {error && (
                            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" aria-live="polite">
                                {error}
                            </p>
                        )}
                    </aside>
                </div>
            </section>

            {/* Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Upload image dialog"
                    onMouseDown={(e) => {
                        // click outside closes
                        if (e.target === e.currentTarget) closeModal();
                    }}
                >
                    <div
                        ref={modalRef}
                        tabIndex={-1}
                        className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-6 text-white shadow-2xl outline-none"
                    >
                        <h2 className="text-lg font-semibold">
                            Upload {selectedImageType === "profile" ? "Profile" : "Banner"} Image
                        </h2>
                        <p className="mt-1 text-sm text-white/70">
                            Choose an image file, preview it, then upload.
                        </p>

                        <div className="mt-5 space-y-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="block w-full text-sm text-white/80 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-neutral-950 hover:file:bg-white/90"
                            />

                            {selectedImage && (
                                <img
                                    src={selectedImage}
                                    alt="Selected preview"
                                    className="h-40 w-full rounded-xl object-cover border border-white/10"
                                />
                            )}

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    onClick={closeModal}
                                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleImageUpload}
                                    className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                >
                                    Upload
                                </button>
                            </div>

                            {error && (
                                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" aria-live="polite">
                                    {error}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default UserPage;

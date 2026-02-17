import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutThunk } from "../../store/slices/authSlice.js";
import { Search, Plus, Lightbulb, Pencil, Trash2, BookOpen, X } from "lucide-react";
import {apiFetch} from "../../config/apiBase.jsx";

function cx(...classes) {
    return classes.filter(Boolean).join(" ");
}

const TYPES = ["FPS", "MOBA","OTHER"];

const GameExplore = () => {
    const dispatch = useDispatch();

    const token = useSelector((s) => s.auth.token);
    const user = useSelector((s) => s.auth.user);

    const [games, setGames] = useState([]);
    const [status, setStatus] = useState("loading"); // loading | ready | error
    const [error, setError] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("");

    const [gameToDelete, setGameToDelete] = useState(null);

    const navigate = useNavigate();

    const modalRef = useRef(null);
    const lastActiveElRef = useRef(null);

    const cleanToken = useMemo(
        () => (typeof token === "string" ? token.trim().replace(/^Bearer\s+/i, "") : ""),
        [token]
    );

    const on401 = () => {
        dispatch(logoutThunk());
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        const fetchGames = async () => {
            setStatus("loading");
            setError("");

            try {
                const headers = cleanToken ? { Authorization: `Bearer ${cleanToken}` } : {};
                const response = await apiFetch("/games/list", { headers });

                if (response.status === 401) return on401();
                if (!response.ok) throw new Error("Failed to fetch games.");

                const data = await response.json();
                setGames(Array.isArray(data) ? data : []);
                setStatus("ready");
            } catch (err) {
                setStatus("error");
                setError(err?.message || "An error occurred while fetching games.");
            }
        };

        fetchGames();
    }, []);

    const filteredGames = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return games.filter((game) => {
            const matchesQuery = !q || (game.name || "").toLowerCase().includes(q);
            const matchesType = !filterType || game.type === filterType;
            return matchesQuery && matchesType;
        });
    }, [games, searchQuery, filterType]);

    const canAddGame = !!cleanToken && (user?.role === "organizer" || user?.role === "moderator" || user?.role === "organizer_moderator");
    const canSuggestGame = !!cleanToken && user?.role === "player";

    const handleAddGame = () => {
        if (!canAddGame) {
            alert("You do not have permission to add a new game.");
            return;
        }
        navigate("/games/create");
    };

    const handleSuggestGame = () => {
        if (!canSuggestGame) {
            alert("Only players can suggest a new game.");
            return;
        }
        navigate("/games/suggest");
    };

    const handleModifyGame = (gameId) => navigate(`/games/${gameId}/edit`);

    const myId = user?.userId ?? user?.id ?? user?.username;
    const isGameOwnerOrModerator = (game) =>
        user?.role === "organizer_moderator" ||
        user?.role === "moderator" ||
        (myId != null && String(game.organizerId) === String(myId));

    const openDeleteModal = (game) => {
        lastActiveElRef.current = document.activeElement;
        setGameToDelete(game);
    };

    const closeDeleteModal = () => {
        setGameToDelete(null);
        // restore focus
        lastActiveElRef.current?.focus?.();
    };

    useEffect(() => {
        if (!gameToDelete) return;

        const focusTimer = setTimeout(() => modalRef.current?.focus?.(), 0);

        const onKeyDown = (e) => {
            if (e.key === "Escape") closeDeleteModal();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => {
            clearTimeout(focusTimer);
            window.removeEventListener("keydown", onKeyDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameToDelete]);

    const handleDeleteGame = async () => {
        if (!gameToDelete) return;

        try {
            const response = await apiFetch(
                `/games/${gameToDelete.id}/delete`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${cleanToken}` },
                }
            );

            if (response.status === 401) return on401();

            if (response.ok) {
                setGames((prev) => prev.filter((g) => g.id !== gameToDelete.id));
                closeDeleteModal();
            } else {
                alert("Failed to delete game. Please try again.");
            }
        } catch (err) {
            console.error("Error deleting game:", err);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Explore Games</h1>
                        <p className="mt-2 text-sm text-white/60">
                            Search, filter, and explore the competitive titles of GEM.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {canAddGame && (
                            <button
                                onClick={handleAddGame}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                                <Plus className="h-4 w-4" />
                                Add New Game
                            </button>
                        )}

                        {canSuggestGame && (
                            <button
                                onClick={handleSuggestGame}
                                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                                <Lightbulb className="h-4 w-4" />
                                Suggest Game
                            </button>
                        )}
                    </div>
                </div>

                {/* Error */}
                {status === "error" && (
                    <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </div>
                )}

                {/* Controls */}
                <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_220px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search games..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                        />
                    </div>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 [&>option]:bg-neutral-900 [&>option]:text-white"
                    >
                        <option value="">All Types</option>
                        {TYPES.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Loading */}
                {status === "loading" && (
                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse"
                            >
                                <div className="h-4 w-2/3 rounded bg-white/10" />
                                <div className="mt-4 h-40 rounded-xl bg-white/10" />
                                <div className="mt-4 h-3 w-1/2 rounded bg-white/10" />
                                <div className="mt-2 h-3 w-1/3 rounded bg-white/10" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Content */}
                {status === "ready" && (
                    <>
                        {/* Empty */}
                        {filteredGames.length === 0 ? (
                            <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                                <p className="text-sm text-white/70">No games match your search.</p>
                                <p className="mt-1 text-xs text-white/50">Try another keyword or reset filters.</p>
                            </div>
                        ) : (
                            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {filteredGames.map((game) => (
                                    <article
                                        key={game.id}
                                        onClick={() => navigate(`/games/${game.id}`)}
                                        className={cx(
                                            "group cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur",
                                            "transition hover:bg-white/10"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="truncate text-base font-semibold text-white">{game.name}</h3>
                                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/60">
                          <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1">
                            Type: <span className="text-white/80">{game.type}</span>
                          </span>
                                                    <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1">
                            Year: <span className="text-white/80">{game.yearOfExistence}</span>
                          </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                                            {game.gameImage ? (
                                                <img
                                                    src={`data:image/png;base64,${game.gameImage}`}
                                                    alt={`${game.name} logo`}
                                                    className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex h-40 items-center justify-center text-sm text-white/40">
                                                    No Image
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {game.tutorial && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/games/${game.id}/tutorial`);
                                                    }}
                                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                                >
                                                    <BookOpen className="h-4 w-4" />
                                                    Tutorial
                                                </button>
                                            )}

                                            {isGameOwnerOrModerator(game) && (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleModifyGame(game.id);
                                                        }}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                        Modify
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openDeleteModal(game);
                                                        }}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete modal */}
            {gameToDelete && (
                <div
                    className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 px-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-title"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeDeleteModal();
                    }}
                >
                    <div
                        ref={modalRef}
                        tabIndex={-1}
                        className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-5 shadow-2xl focus:outline-none"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <h2 id="delete-title" className="text-base font-semibold text-white">
                                Delete game
                            </h2>
                            <button
                                onClick={closeDeleteModal}
                                className="rounded-xl p-2 text-white/70 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                aria-label="Close"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="mt-3 text-sm text-white/70">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-white">"{gameToDelete.name}"</span>? This action cannot be undone.
                        </p>

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                onClick={closeDeleteModal}
                                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteGame}
                                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default GameExplore;

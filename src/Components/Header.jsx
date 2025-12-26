import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Menu, X ,Bell } from "lucide-react";
import { User, MessageSquare, Shield, LogOut } from "lucide-react";
import { AuthContext } from "../security/AuthContext.jsx";
import logoImage from "../assets/Image/Logo1.png";

function cx(...classes) {
    return classes.filter(Boolean).join(" ");
}

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { token, user, logout } = useContext(AuthContext);
    const [pendingCount, setPendingCount] = useState(0);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const dropdownRef = useRef(null);
    const isAuthed = Boolean(token && user);

    const pathname = useMemo(() => location.pathname, [location.pathname]);

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
        setIsMobileOpen(false);

        if (location.pathname.startsWith("/user")) {
            navigate("/login");
        }
    };

    // close menus on route change
    useEffect(() => {
        setIsDropdownOpen(false);
        setIsMobileOpen(false);
    }, [pathname]);

    // close dropdown on outside click + Escape
    useEffect(() => {
        if (!isDropdownOpen) return;

        const onPointerDown = (e) => {
            if (!dropdownRef.current) return;
            if (!dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
        };

        const onKeyDown = (e) => {
            if (e.key === "Escape") setIsDropdownOpen(false);
        };

        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [isDropdownOpen]);
    useEffect(() => {
        if (!token || !user) return;

        const isModerator =
            user.role === "moderator" || user.role === "organizer_moderator";

        if (!isModerator) return;

        const fetchPending = async () => {
            try {
                const res = await fetch(
                    "http://localhost:8080/api/game-requests/count-pending",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (!res.ok) return;
                const count = await res.json();
                setPendingCount(Number(count) || 0);
            } catch {
                // silence (badge non critique)
            }
        };

        fetchPending();

        // refresh léger toutes les 30s
        const interval = setInterval(fetchPending, 30000);
        return () => clearInterval(interval);
    }, [token, user]);

    const navLinkBase =
        "relative text-lg font-medium transition duration-300 transform hover:scale-105 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-lg px-2 py-1";

    const isActive = (to) => pathname === to || pathname.startsWith(to + "/");

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black text-white backdrop-blur">
                <div className="w-full p-4 flex justify-between items-center">
                    {/* Header Logo (unchanged style) */}
                    <div className="flex items-center space-x-4 group transition duration-500 ease-in-out">
                        <Link
                            to="/"
                            className="flex items-center space-x-2 group-hover:bg-white/5 rounded-xl px-2 py-1 transition duration-300 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            aria-label="Go to homepage"
                        >
                            <img
                                src={logoImage}
                                alt="Logo"
                                className="h-14 w-auto cursor-pointer transform transition duration-500 group-hover:scale-110 group-hover:rotate-3"
                            />
                            <div className="hidden sm:flex items-baseline space-x-2">
                                <span className="text-2xl font-bold text-white">GEM</span>
                                <span className="text-2xl font-bold text-white flex">
                  {"Gaming Esport Major".split("").map((char, index) => (
                      <span
                          key={index}
                          className="opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                          style={{ transitionDelay: `${index * 40}ms` }}
                      >
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links (same vibe + active state) */}
                    <nav className="hidden md:flex items-center space-x-6 group" aria-label="Primary">
                        <Link
                            to="/tournament"
                            aria-current={isActive("/tournament") ? "page" : undefined}
                            className={cx(navLinkBase, "hover:text-indigo-400", isActive("/tournament") && "bg-white/10")}
                        >
                            Tournament
                            <span
                                className={cx(
                                    "absolute left-2 right-2 -bottom-1 h-0.5 bg-indigo-400 transition-all duration-300",
                                    isActive("/tournament") ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                )}
                            />
                        </Link>

                        <Link
                            to="/games"
                            aria-current={isActive("/games") ? "page" : undefined}
                            className={cx(navLinkBase, "hover:text-purple-400", isActive("/games") && "bg-white/10")}
                        >
                            Games
                            <span
                                className={cx(
                                    "absolute left-2 right-2 -bottom-1 h-0.5 bg-purple-400 transition-all duration-300",
                                    isActive("/games") ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                )}
                            />
                        </Link>

                        <Link
                            to="/teams"
                            aria-current={isActive("/teams") ? "page" : undefined}
                            className={cx(navLinkBase, "hover:text-pink-400", isActive("/teams") && "bg-white/10")}
                        >
                            Teams
                            <span
                                className={cx(
                                    "absolute left-2 right-2 -bottom-1 h-0.5 bg-pink-400 transition-all duration-300",
                                    isActive("/teams") ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                )}
                            />
                        </Link>
                    </nav>

                    {/* Right side: Mobile menu + Profile */}
                    <div className="flex items-center space-x-3">
                        {/* Mobile menu toggle */}
                        <button
                            type="button"
                            className="md:hidden inline-flex items-center justify-center rounded-xl p-2 text-white hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
                            aria-expanded={isMobileOpen}
                            onClick={() => setIsMobileOpen((v) => !v)}
                        >
                            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        {/* Profile and Dropdown (old style, but click + a11y) */}
                        {/* Profile and Dropdown */}

                        <div className="relative flex items-center space-x-4">
                            {token && user ? (
                                <>
                                    {(user?.role === "moderator" || user?.role === "organizer_moderator") && (
                                        <button
                                            onClick={() => navigate("/moderator/game-requests")}
                                            className="relative rounded-xl p-2 text-white hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                            aria-label="Pending game requests"
                                        >
                                            <Bell className="h-5 w-5" />
                                            {pendingCount > 0 && (
                                                <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                                                    {pendingCount}
                                                </span>
                                            )}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen((v) => !v)}
                                        className="bg-black text-white font-bold px-4 py-2 rounded-lg transition duration-300 transform hover:scale-105 shadow-sm hover:shadow-md hover:bg-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 inline-flex items-center gap-2"
                                        aria-haspopup="menu"
                                        aria-expanded={isDropdownOpen}
                                    >
                                        My Profile
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute top-[2.9rem] right-0 bg-gray-900/95 text-white rounded-xl shadow-xl z-50 w-52 border border-white/10 backdrop-blur">
                                            <button
                                                className="block px-4 py-2 w-full text-left transition duration-200 hover:bg-indigo-600 hover:text-white hover:pl-5"
                                                onClick={() => {
                                                    navigate(`/user/${user.username}`);
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                Go to Profile
                                            </button>

                                            <button
                                                onClick={() => {
                                                    navigate("/user/settings");
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="block px-4 py-2 w-full text-left transition duration-200 hover:bg-indigo-600 hover:text-white hover:pl-5"
                                            >
                                                Settings
                                            </button>

                                            <button
                                                onClick={() => {
                                                    navigate("/chat");
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="block px-4 py-2 w-full text-left transition duration-200 hover:bg-purple-600 hover:text-white hover:pl-5"
                                            >
                                                Chat
                                            </button>
                                            <button
                                                className="block px-4 py-2 w-full text-left transition duration-200 hover:bg-pink-600 hover:text-white hover:pl-5"
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="bg-black text-white px-4 py-2 rounded-lg transition duration-300 transform hover:scale-105 shadow-sm hover:shadow-md hover:bg-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Panel (keeps same vibe) */}
                {isMobileOpen && (
                    <div className="md:hidden border-t border-white/10 bg-black/70 backdrop-blur">
                        <div className="px-4 py-3 space-y-2">
                            <Link
                                to="/tournament"
                                className={cx(
                                    "block rounded-xl px-3 py-2 text-base font-medium text-white/90 hover:bg-white/5 hover:text-indigo-300",
                                    isActive("/tournament") && "bg-white/10 text-white"
                                )}
                            >
                                Tournament
                            </Link>
                            <Link
                                to="/games"
                                className={cx(
                                    "block rounded-xl px-3 py-2 text-base font-medium text-white/90 hover:bg-white/5 hover:text-purple-300",
                                    isActive("/games") && "bg-white/10 text-white"
                                )}
                            >
                                Games
                            </Link>
                            <Link
                                to="/teams"
                                className={cx(
                                    "block rounded-xl px-3 py-2 text-base font-medium text-white/90 hover:bg-white/5 hover:text-pink-300",
                                    isActive("/teams") && "bg-white/10 text-white"
                                )}
                            >
                                Teams
                            </Link>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};

export default Header;

import React, { createContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "./jwtDecodeWrapper";
import { useNavigate, useLocation } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [token, setToken] = useState(() => {
        const t = sessionStorage.getItem("token");
        return t && t.length <= 2048 ? t.trim() : null;
    });

    const [user, setUser] = useState(() => {
        const u = sessionStorage.getItem("user");
        return u ? JSON.parse(u) : null;
    });

    /* =========================
       TOKEN CHECK
       ========================= */
    const isTokenExpired = useCallback((token) => {
        try {
            const decoded = jwtDecode(token);
            return decoded.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    }, []);

    /* =========================
       LOGOUT (GLOBAL SAFE)
       ========================= */
    const logout = useCallback(() => {
        sessionStorage.clear();
        setToken(null);
        setUser(null);

        if (location.pathname.startsWith("/user")) {
            navigate("/login", { replace: true });
        } else {
            navigate(0);
        }
    }, [navigate, location.pathname]);

    /* =========================
       FETCH PROFILE
       ========================= */
    const fetchUserProfile = useCallback(
        async (username, token) => {
            try {
                const res = await fetch(
                    `http://localhost:8080/api/profile/username/${username}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (res.status === 401) {
                    logout();
                    return;
                }

                if (!res.ok) return;

                const profile = await res.json();

                const userData = {
                    id: profile.id,
                    username: profile.username,
                    role: profile.role,
                    specialization: profile.specialization,
                    game: profile.game,
                    profileImage: profile.profileImage,
                };

                setUser(userData);
                sessionStorage.setItem("user", JSON.stringify(userData));
            } catch {
                logout();
            }
        },
        [logout]
    );

    /* =========================
       INIT ON LOAD
       ========================= */
    useEffect(() => {
        if (!token) return;

        if (isTokenExpired(token)) {
            logout();
            return;
        }

        try {
            const decoded = jwtDecode(token);
            fetchUserProfile(decoded.sub, token);
        } catch {
            logout();
        }
    }, [token, fetchUserProfile, isTokenExpired, logout]);

    /* =========================
       LOGIN
       ========================= */
    const login = async (newToken) => {
        if (!newToken || newToken.length > 2048) {
            logout();
            return;
        }

        try {
            const cleaned = newToken.trim();
            const decoded = jwtDecode(cleaned);

            sessionStorage.setItem("token", cleaned);
            setToken(cleaned);

            await fetchUserProfile(decoded.sub, cleaned);

            navigate(-1);
        } catch {
            logout();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                login,
                logout,
                isTokenExpired,
                refreshUser: fetchUserProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

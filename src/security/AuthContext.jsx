import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from './jwtDecodeWrapper';
import { useNavigate, useLocation } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => {
        const storedToken = sessionStorage.getItem('token');
        return storedToken && storedToken.length <= 2048 ? storedToken.trim() : null;
    });

    const [user, setUser] = useState(() => {
        const storedUser = sessionStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const navigate = useNavigate();
    const location = useLocation();

    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token);
            return decoded.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    };

    useEffect(() => {
        const storedToken = sessionStorage.getItem('token');
        if (storedToken && storedToken.length <= 2048 && !isTokenExpired(storedToken)) {
            setToken(storedToken.trim());
            const decoded = jwtDecode(storedToken);
            fetchUserProfile(decoded.sub, storedToken);
        } else {
            setToken(null);
            setUser(null);
        }
    }, []);

    const fetchUserProfile = async (username, token) => {
        try {
            const response = await fetch(`http://localhost:8080/api/profile/username/${username}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const profileData = await response.json();
                const userData = {
                    username: profileData.username,
                    role: profileData.role,
                    specialization: profileData.specialization,
                    game: profileData.game,
                };
                setUser(userData);
                sessionStorage.setItem('user', JSON.stringify(userData));
            } else if (response.status === 401) {
                logout();
            }
        } catch {
            // Optionnel : Gérer les erreurs globales si nécessaire
        }
    };

    const login = async (newToken) => {
        if (newToken.length > 1024) {
            logout();
            return;
        }
        const cleanedToken = newToken.trim();
        try {
            const decoded = jwtDecode(cleanedToken);
            sessionStorage.setItem('token', cleanedToken);
            sessionStorage.setItem('username', decoded.sub);
            setToken(cleanedToken);

            await fetchUserProfile(decoded.sub, cleanedToken);
            navigate(-1);
        } catch {
            setToken(null);
            setUser(null);
        }
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('username');
        setToken(null);
        setUser(null);

        if (location.pathname.startsWith('/user')) {
            navigate('/login');
        } else {
            navigate(0);
        }
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isTokenExpired }}>
            {children}
        </AuthContext.Provider>
    );
};

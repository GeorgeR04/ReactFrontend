import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from './jwtDecodeWrapper';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => {
        const storedToken = sessionStorage.getItem('token');
        return storedToken && storedToken.length <= 2048 ? storedToken.trim() : null;
    });
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token);
            return decoded.exp * 1000 < Date.now();
        } catch (e) {
            console.error('Token decoding error:', e);
            return true;
        }
    };

    useEffect(() => {
        const storedToken = sessionStorage.getItem('token');
        if (storedToken && storedToken.length <= 2048 && !isTokenExpired(storedToken)) {
            setToken(storedToken.trim());
            const decoded = jwtDecode(storedToken);
            fetchUserProfile(decoded.sub, storedToken); // Fetch full profile details
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
                setUser({
                    username: profileData.username,
                    role: profileData.role,
                    specialization: profileData.specialization,
                    game: profileData.game,
                });
            } else {
                console.error('Failed to fetch user profile:', response.status);
                if (response.status === 401) logout();
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const login = async (newToken) => {
        if (newToken.length > 1024) {
            console.error("Token size too large, rejecting token.");
            logout();
            return;
        }
        const cleanedToken = newToken.trim();
        try {
            const decoded = jwtDecode(cleanedToken);
            sessionStorage.setItem('token', cleanedToken);
            sessionStorage.setItem('username', decoded.sub);
            setToken(cleanedToken);

            // Fetch the user profile and navigate after it's fetched
            await fetchUserProfile(decoded.sub, cleanedToken);
            navigate(`/user/${decoded.sub}`);
        } catch (e) {
            console.error("Invalid token format:", e);
            setToken(null);
            setUser(null);
        }
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('username');
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isTokenExpired }}>
            {children}
        </AuthContext.Provider>
    );
};

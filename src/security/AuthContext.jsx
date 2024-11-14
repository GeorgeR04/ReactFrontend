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
            setUser(jwtDecode(storedToken));
        } else {
            setToken(null);
            setUser(null);
        }
    }, []);

    const login = (newToken) => {
        if (newToken.length > 1024) {  // Choose a sensible limit for the backend
            console.error("Token size too large, rejecting token.");
            logout();
            return;
        }
        // Continue with trimmed token
        const cleanedToken = newToken.trim();
        try {
            const decoded = jwtDecode(cleanedToken);
            sessionStorage.setItem('token', cleanedToken);
            sessionStorage.setItem('username', decoded.sub);
            setToken(cleanedToken);
            setUser(decoded);
            navigate(`/user/${decoded.sub}`);
        } catch (e) {
            console.error("Invalid token format:", e);
            setToken(null);
            setUser(null);
        }
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

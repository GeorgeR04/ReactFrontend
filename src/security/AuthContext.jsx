import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from './jwtDecodeWrapper';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => sessionStorage.getItem('token'));
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
        if (storedToken && !isTokenExpired(storedToken)) {
            setToken(storedToken);
            setUser(jwtDecode(storedToken));
        } else {
            setToken(null);
            setUser(null);
        }
    }, []);

    const login = (newToken) => {
        const decoded = jwtDecode(newToken);
        sessionStorage.setItem('token', newToken);
        sessionStorage.setItem('username', decoded.sub);
        setToken(newToken);
        setUser(decoded);
        navigate(`/user/${decoded.sub}`);
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

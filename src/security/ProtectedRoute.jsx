import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = () => {
    const { token, isTokenExpired } = useContext(AuthContext);
    const location = useLocation();

    if (!token || isTokenExpired(token)) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;

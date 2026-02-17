import { useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { jwtDecode } from "./jwtDecodeWrapper";

function isTokenExpired(token) {
    try {
        const decoded = jwtDecode(token);
        return decoded?.exp * 1000 < Date.now();
    } catch {
        return false;
    }
}

const ProtectedRoute = () => {
    const token = useSelector((s) => s.auth.token);
    const location = useLocation();

    const expired = useMemo(() => (token ? isTokenExpired(token) : true), [token]);

    if (!token || expired) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;

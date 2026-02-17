import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function RoleProtectedRoute({ allowedRoles = [] }) {
    const token = useSelector((s) => s.auth.token);
    const user = useSelector((s) => s.auth.user);

    if (!token || !user) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

    return <Outlet />;
}

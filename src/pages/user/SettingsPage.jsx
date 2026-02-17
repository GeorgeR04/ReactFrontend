import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutThunk } from "../../store/slices/authSlice";
import { fetchMyProfile } from "../../store/slices/profilesSlice";
import SettingsLayout from "../../components/layout/SettingsLayout.jsx";
import MediaSection from "./settings/MediaSection.jsx";
import AccountSection from "./settings/AccountSection.jsx";
import RoleSection from "./settings/RoleSection.jsx";
import SecuritySection from "./settings/SecuritySection.jsx";

export default function SettingsPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = useSelector((s) => s.auth.token);
    const me = useSelector((s) => s.profiles.me);
    const profile = me.data;
    const status = me.status;
    const error = me.error;

    useEffect(() => {
        if (!token) return;
        dispatch(fetchMyProfile({ token: String(token).trim() }));
    }, [token, dispatch]);

    useEffect(() => {
        if (!error) return;

        const e = String(error).toLowerCase();
        if (e.includes("unauthorized")) {
            dispatch(logoutThunk());
            navigate("/login");
        }
    }, [error, dispatch, navigate]);

    if (!profile) {
        return (
            <main className="min-h-screen bg-neutral-950 text-white">
                <div className="mx-auto max-w-4xl px-4 py-16">
                    <div className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur">
                        Loading settings…
                    </div>
                </div>
            </main>
        );
    }

    return (
        <SettingsLayout title="Account Settings">
            <MediaSection />
            <AccountSection />
            <RoleSection role={profile.role} />
            <SecuritySection />
        </SettingsLayout>
    );
}

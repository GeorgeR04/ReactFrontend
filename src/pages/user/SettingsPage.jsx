import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../security/AuthContext.jsx";

import SettingsLayout from "../../components/layout/SettingsLayout.jsx";
import MediaSection from "./settings/MediaSection.jsx";
import AccountSection from "./settings/AccountSection.jsx";
import RoleSection from "./settings/RoleSection.jsx";
import SecuritySection from "./settings/SecuritySection.jsx";

export default function SettingsPage() {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (!token) return;

        fetch("http://localhost:8080/api/profile/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load profile");
                return res.json();
            })
            .then((data) => setProfile(data))
            .catch(() => navigate("/login"));
    }, [token, navigate]);

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

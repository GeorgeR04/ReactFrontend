import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../security/AuthContext.jsx";
import SettingsLayout from "../../components/layout/SettingsLayout.jsx";
import MediaSection from "./settings/MediaSection.jsx";
import AccountSection from "./settings/AccountSection.jsx";
import SecuritySection from "./settings/SecuritySection.jsx";

export default function SettingsPage() {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    // Protection route
    useEffect(() => {
        if (!token) return;

        fetch("http://localhost:8080/api/profile/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to load profile");
                return res.json();
            })
            .then(data => {
                console.log("MY PROFILE", data);
                setProfile(data);
            })
            .catch(err => console.error(err));
    }, [token]);


    return (
        <SettingsLayout title="Account Settings">
            <MediaSection />
            <AccountSection />
            <SecuritySection />
        </SettingsLayout>
    );
}

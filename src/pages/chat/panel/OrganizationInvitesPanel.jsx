import React, { useEffect, useMemo, useState } from "react";

function cx(...classes) {
    return classes.filter(Boolean).join(" ");
}

const OrganizationInvitesPanel = ({ user, token }) => {
    const [invites, setInvites] = useState([]);
    const cleanToken = useMemo(() => token?.trim() || "", [token]);

    useEffect(() => {
        const fetchInvites = async () => {
            try {
                const res = await fetch(
                    `http://localhost:8080/api/organizations/invites/pending?leaderId=${user.username}`,
                    { headers: { Authorization: `Bearer ${cleanToken}` } }
                );
                if (res.ok) {
                    const data = await res.json();
                    setInvites(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Failed to load invites", err);
            }
        };
        if (user?.username && cleanToken) fetchInvites();
    }, [user?.username, cleanToken]);

    const handleAccept = async (inviteId) => {
        const res = await fetch(`http://localhost:8080/api/organizations/invites/${inviteId}/accept`, {
            method: "POST",
            headers: { Authorization: `Bearer ${cleanToken}` },
        });
        if (res.ok) setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    };

    const handleReject = async (inviteId) => {
        const res = await fetch(`http://localhost:8080/api/organizations/invites/${inviteId}/reject`, {
            method: "POST",
            headers: { Authorization: `Bearer ${cleanToken}` },
        });
        if (res.ok) setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    };

    if (!invites.length) return <p className="text-xs text-white/60">No invites</p>;

    return (
        <ul className="space-y-2">
            {invites.map((invite) => (
                <li
                    key={invite.id}
                    className="rounded-2xl border border-white/10 bg-black/30 p-3 text-sm"
                >
                    <div className="text-xs text-white/60">From</div>
                    <div className="text-sm font-semibold text-white">{invite.fromTeamId}</div>

                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={() => handleAccept(invite.id)}
                            className={cx(
                                "inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold",
                                "bg-white text-black hover:bg-white/90 transition"
                            )}
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => handleReject(invite.id)}
                            className={cx(
                                "inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold",
                                "border border-white/15 bg-white/5 text-white hover:bg-white/10 transition"
                            )}
                        >
                            Reject
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default OrganizationInvitesPanel;

import React, { useEffect, useState } from 'react';

const OrganizationInvitesPanel = ({ user, token }) => {
    const [invites, setInvites] = useState([]);

    useEffect(() => {
        const fetchInvites = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/organizations/invites/pending?leaderId=${user.username}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setInvites(data);
                }
            } catch (err) {
                console.error("Failed to load invites", err);
            }
        };
        fetchInvites();
    }, [user, token]);

    const handleAccept = async (inviteId) => {
        const res = await fetch(`http://localhost:8080/api/organizations/invites/${inviteId}/accept`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            setInvites(prev => prev.filter(i => i.id !== inviteId));
        }
    };

    const handleReject = async (inviteId) => {
        const res = await fetch(`http://localhost:8080/api/organizations/invites/${inviteId}/reject`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            setInvites(prev => prev.filter(i => i.id !== inviteId));
        }
    };

    if (!invites.length) return <p className="text-sm text-gray-400">No invites</p>;

    return (
        <ul className="space-y-2">
            {invites.map(invite => (
                <li key={invite.id} className="bg-gray-700 rounded p-2 text-sm">
                    <div><strong>From:</strong> {invite.fromTeamId}</div>
                    <div className="flex gap-2 mt-1">
                        <button
                            onClick={() => handleAccept(invite.id)}
                            className="bg-green-600 px-2 py-1 rounded text-white text-xs hover:bg-green-700"
                        >Accept</button>
                        <button
                            onClick={() => handleReject(invite.id)}
                            className="bg-red-600 px-2 py-1 rounded text-white text-xs hover:bg-red-700"
                        >Reject</button>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default OrganizationInvitesPanel;

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutThunk } from "../../store/slices/authSlice.js";
import { apiFetch } from "../../config/apiBase.jsx";

function Section({ title, children }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold">{title}</h2>
            {children}
        </div>
    );
}

const OrganizationExplore = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const token = useSelector((s) => s.auth.token);
    const cleanToken = useMemo(
        () => (typeof token === "string" ? token.trim().replace(/^Bearer\s+/i, "") : ""),
        [token]
    );

    const [organizations, setOrganizations] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMembers, setLoadingMembers] = useState(false);

    const on401 = () => {
        dispatch(logoutThunk());
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const headers = cleanToken ? { Authorization: `Bearer ${cleanToken}` } : {};
                const res = await apiFetch("/api/organizations", { headers });

                if (res.status === 401) return on401();

                if (res.ok) {
                    const data = await res.json();
                    setOrganizations(data);
                    setFiltered(data);
                }
            } catch (err) {
                console.error("Error fetching organizations", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cleanToken]);

    useEffect(() => {
        setFiltered(
            organizations.filter((org) => org.name.toLowerCase().includes(search.toLowerCase()))
        );
    }, [search, organizations]);

    const handleOrgClick = async (org) => {
        setSelectedOrg(org);
        setMembers([]);
        setLoadingMembers(true);

        try {
            const headers = cleanToken ? { Authorization: `Bearer ${cleanToken}` } : {};
            const res = await apiFetch(`/organizations/${org.id}/members`, { headers });

            if (res.status === 401) return on401();

            if (res.ok) setMembers(await res.json());
        } catch (err) {
            console.error("Error fetching members", err);
        } finally {
            setLoadingMembers(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
                <p className="text-white/70">Loading organizations…</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
                <h1 className="text-3xl font-semibold text-center sm:text-4xl">
                    Explore Organizations
                </h1>

                <div className="max-w-md mx-auto">
                    <input
                        placeholder="Search organizations…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    />
                </div>

                {filtered.length === 0 ? (
                    <p className="text-center text-white/60">No organizations found.</p>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((org) => (
                            <button
                                key={org.id}
                                onClick={() => handleOrgClick(org)}
                                className="text-left rounded-2xl border border-white/10 bg-black/55 p-4 shadow-2xl backdrop-blur hover:border-white/20 transition"
                            >
                                <div className="h-36 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center mb-4">
                                    {org.logo ? (
                                        <img
                                            src={`data:image/jpeg;base64,${org.logo}`}
                                            alt={org.name}
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <span className="text-sm text-white/40">No logo</span>
                                    )}
                                </div>

                                <h2 className="text-lg font-semibold">{org.name}</h2>

                                <p className="mt-1 text-sm text-white/70">
                                    Teams: {org.teamIds?.length || 0}
                                </p>

                                <p className="text-sm text-white/60">
                                    Earnings: {(org.totalEarnings ?? 0).toFixed(2)} €
                                </p>
                            </button>
                        ))}
                    </div>
                )}

                {selectedOrg && (
                    <Section title={`Members of ${selectedOrg.name}`}>
                        {loadingMembers ? (
                            <p className="text-sm text-white/70">Loading members…</p>
                        ) : members.length > 0 ? (
                            <ul className="space-y-3">
                                {members.map((m, i) => (
                                    <li
                                        key={i}
                                        className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm"
                                    >
                                        <p>
                                            <span className="text-white/60">Team:</span> {m.teamId}
                                        </p>
                                        <p>
                                            <span className="text-white/60">Leader:</span> {m.leaderId}
                                        </p>
                                        <p>
                                            <span className="text-white/60">Role:</span> {m.role}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-white/60">
                                No members found for this organization.
                            </p>
                        )}
                    </Section>
                )}
            </section>
        </main>
    );
};

export default OrganizationExplore;

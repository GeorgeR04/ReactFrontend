import React, { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AuthContext } from "../../security/AuthContext.jsx";

function cx(...classes) {
    return classes.filter(Boolean).join(" ");
}

function formatMoney(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(n);
}

function imgFromString(s) {
    if (!s) return null;
    if (typeof s !== "string") return null;
    if (s.startsWith("data:image/")) return s;
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    if (s.length > 120) return `data:image/jpeg;base64,${s}`;
    return null;
}

function Section({ title, subtitle, children, right }) {
    return (
        <section className="rounded-2xl border border-white/10 bg-black/55 p-5 shadow-2xl backdrop-blur sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
                    {subtitle && <p className="mt-1 text-sm text-white/70">{subtitle}</p>}
                </div>
                {right}
            </div>
            <div className="mt-4">{children}</div>
        </section>
    );
}

function EmptyState({ title, hint }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">{title}</div>
            {hint && <div className="mt-1 text-xs text-white/70">{hint}</div>}
        </div>
    );
}

function StatPill({ label, value }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="text-xs text-white/60">{label}</div>
            <div className="mt-0.5 text-sm font-semibold">{value ?? "—"}</div>
        </div>
    );
}

function TournamentCard({ name, imgSrc, badge }) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-xl">
            <div className="aspect-[16/9] w-full overflow-hidden bg-white/5">
                {imgSrc ? (
                    <img
                        src={imgSrc}
                        alt={name || "Tournament"}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
                )}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{name || "Tournament"}</div>
                    </div>
                    {badge && (
                        <span className="shrink-0 rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
              {badge}
            </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function UserPage() {
    const navigate = useNavigate();
    const { username } = useParams();
    const { token, logout } = useContext(AuthContext);

    const cleanToken = useMemo(() => (token ? token.trim() : ""), [token]);

    const [userProfile, setUserProfile] = useState(null);
    const [status, setStatus] = useState("loading"); // loading | ready | error
    const [error, setError] = useState("");
    const [slideIn, setSlideIn] = useState(false);

    const [activeTab, setActiveTab] = useState("player"); // player | organizer

    useEffect(() => {
        setSlideIn(true);

        if (!cleanToken) {
            navigate("/login");
            return;
        }

        const fetchUserProfile = async () => {
            setStatus("loading");
            setError("");

            try {
                const endpoint =
                    username === "settings"
                        ? "http://localhost:8080/api/profile/me"
                        : `http://localhost:8080/api/profile/username/${username}`;

                const response = await fetch(endpoint, {
                    headers: { Authorization: `Bearer ${cleanToken}` },
                });

                if (response.status === 401) {
                    logout();
                    navigate("/login");
                    return;
                }

                if (!response.ok) throw new Error("User not found");

                const data = await response.json();
                setUserProfile(data);
                setStatus("ready");
            } catch (err) {
                setStatus("error");
                setError(err?.message || "An error occurred.");
            }
        };

        fetchUserProfile();
        return () => setSlideIn(false);
    }, [username, cleanToken, navigate, logout]);

    // ---- role logic ----
    const roleRaw = useMemo(() => String(userProfile?.role || "").toLowerCase(), [userProfile?.role]);

    // Player can still be detected by role
    const isPlayer = useMemo(() => roleRaw.includes("player") || roleRaw.includes("joueur"), [roleRaw]);

    // Organizer = created at least one tournament (backend later)
    const createdTournamentIds = useMemo(() => {
        return Array.isArray(userProfile?.createdTournaments) ? userProfile.createdTournaments : [];
    }, [userProfile?.createdTournaments]);

    const isOrganizer = useMemo(() => createdTournamentIds.length > 0, [createdTournamentIds.length]);

    const isBoth = useMemo(() => isPlayer && isOrganizer, [isPlayer, isOrganizer]);

    useEffect(() => {
        if (!userProfile) return;
        if (!isBoth) setActiveTab(isOrganizer ? "organizer" : "player");
    }, [userProfile, isBoth, isOrganizer]);

    // ---- tournaments ----
    const tournamentImages = useMemo(
        () => (Array.isArray(userProfile?.tournamentImages) ? userProfile.tournamentImages : []),
        [userProfile?.tournamentImages]
    );
    const pastTournamentIds = useMemo(
        () => (Array.isArray(userProfile?.pastTournaments) ? userProfile.pastTournaments : []),
        [userProfile?.pastTournaments]
    );
    const currentTournamentIds = useMemo(
        () => (Array.isArray(userProfile?.currentTournaments) ? userProfile.currentTournaments : []),
        [userProfile?.currentTournaments]
    );

    const tournamentNameFromRaw = (raw, fallback = "Tournament") => {
        if (!raw) return fallback;
        if (typeof raw !== "string") return fallback;
        if (raw.includes("|")) return raw.split("|")[0]?.trim() || fallback;
        if (raw.startsWith("http")) {
            const last = raw.split("/").pop() || "";
            return decodeURIComponent(last).replace(/\.(png|jpg|jpeg|webp)$/i, "") || fallback;
        }
        if (raw.length < 60) return raw;
        return fallback;
    };

    const sTier = useMemo(() => {
        return tournamentImages
            .map((t) => ({ raw: t, img: imgFromString(t) }))
            .filter(
                (x) =>
                    String(x.raw).toLowerCase().includes("s-tier") ||
                    String(x.raw).toLowerCase().includes("stier")
            );
    }, [tournamentImages]);

    const normalTournaments = useMemo(() => {
        return tournamentImages
            .map((t) => ({ raw: t, img: imgFromString(t) }))
            .filter(
                (x) =>
                    !String(x.raw).toLowerCase().includes("s-tier") &&
                    !String(x.raw).toLowerCase().includes("stier")
            );
    }, [tournamentImages]);

    const fullName = useMemo(() => {
        const fn = userProfile?.firstname ?? "";
        const un = userProfile?.username ?? "";
        const ln = userProfile?.lastname ?? "";
        return `${fn} "${un}" ${ln}`.trim();
    }, [userProfile?.firstname, userProfile?.username, userProfile?.lastname]);

    // ------------------ UI blocks ------------------
    const PlayerCareer = () => (
        <div className="space-y-6">
            <Section
                title="S-Tier Highlights"
                right={
                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold">
            Player
          </span>
                }
            >
                {sTier.length === 0 ? (
                    <EmptyState title="No S-tier highlights yet" />
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {sTier.slice(0, 6).map((t, idx) => (
                            <TournamentCard
                                key={idx}
                                name={tournamentNameFromRaw(t.raw, "S-Tier Tournament")}
                                imgSrc={t.img}
                                badge="S-tier"
                            />
                        ))}
                    </div>
                )}
            </Section>

            <Section title="Player Identity">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatPill label="Game" value={userProfile?.game || "Not specified"} />
                    <StatPill label="Specialization" value={userProfile?.specialization || "Not specified"} />
                    <StatPill label="Rank" value={userProfile?.rank || "Unranked"} />
                    <StatPill label="Prize Earnings" value={formatMoney(userProfile?.cashPrize) || "—"} />
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">Trust Factor</div>
                        <div className="text-xs text-white/70">{Number(userProfile?.trustFactor ?? 0).toFixed(2)}</div>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                        <div
                            className="h-2 rounded-full bg-white/40"
                            style={{
                                width: `${Math.max(0, Math.min(100, Number(userProfile?.trustFactor ?? 0) * 100))}%`,
                            }}
                        />
                    </div>
                </div>
            </Section>

            <Section title="Career Timeline">
                <EmptyState title="Coming soon" />
            </Section>

            <Section title="Tournaments">
                <div className="grid gap-3 lg:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-sm font-semibold">Current</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {currentTournamentIds.length === 0 ? (
                                <span className="text-xs text-white/60">None</span>
                            ) : (
                                currentTournamentIds.slice(0, 12).map((id) => (
                                    <span key={id} className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs">
                    {id}
                  </span>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-sm font-semibold">Past</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {pastTournamentIds.length === 0 ? (
                                <span className="text-xs text-white/60">None</span>
                            ) : (
                                pastTournamentIds.slice(0, 12).map((id) => (
                                    <span key={id} className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs">
                    {id}
                  </span>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-sm font-semibold">Gallery</div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {tournamentImages.length === 0 ? (
                                <span className="text-xs text-white/60">No images</span>
                            ) : (
                                tournamentImages.slice(0, 6).map((raw, idx) => (
                                    <div key={idx} className="overflow-hidden rounded-xl border border-white/10 bg-black/60">
                                        {imgFromString(raw) ? (
                                            <img src={imgFromString(raw)} alt="tournament" className="h-20 w-full object-cover" />
                                        ) : (
                                            <div className="h-20 w-full bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
                                        )}
                                        <div className="px-2 py-2 text-[11px] text-white/70 truncate">
                                            {tournamentNameFromRaw(raw, "Tournament")}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {normalTournaments.length > 0 && (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {normalTournaments.slice(0, 9).map((t, idx) => (
                            <TournamentCard key={idx} name={tournamentNameFromRaw(t.raw, "Tournament")} imgSrc={t.img} />
                        ))}
                    </div>
                )}
            </Section>

            <Section title="Wins & Achievements">
                <EmptyState title="Coming soon" />
            </Section>

            {/* ✅ Organizations belongs to PLAYERS */}
            <Section title="Organizations">
                <EmptyState title="No organization listed" />
            </Section>
        </div>
    );

    const OrganizerCareer = () => (
        <div className="space-y-6">
            <Section
                title="Created Tournaments"
                right={
                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold">
            Organizer
          </span>
                }
            >
                {createdTournamentIds.length === 0 ? (
                    <EmptyState title="No created tournaments yet" />
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {createdTournamentIds.slice(0, 12).map((id) => (
                            <div
                                key={id}
                                className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                            >
                                <div className="truncate text-sm font-semibold">{id}</div>
                                <div className="mt-1 text-xs text-white/60">Tournament</div>
                            </div>
                        ))}
                    </div>
                )}
            </Section>
        </div>
    );

    if (status === "loading" || !userProfile) {
        return (
            <main className="min-h-screen bg-neutral-950 text-white">
                <section className="mx-auto max-w-4xl px-4 py-16">
                    <div className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur">
                        <p className="text-white/80">Loading profile…</p>
                        <div className="mt-4 h-2 w-full rounded-full bg-white/10">
                            <div className="h-2 w-1/3 rounded-full bg-white/30 animate-pulse" />
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    if (status === "error") {
        return (
            <main className="min-h-screen bg-neutral-950 text-white">
                <section className="mx-auto max-w-4xl px-4 py-16">
                    <div className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur">
                        <h1 className="text-2xl font-semibold">Something went wrong</h1>
                        <p className="mt-3 text-white/80">{error}</p>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-white/90"
                            >
                                Go back
                            </button>
                            <Link
                                to="/"
                                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                            >
                                Home
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <section className="relative">
                <div className="relative h-56 w-full overflow-hidden bg-black sm:h-72">
                    {userProfile.bannerImage ? (
                        <img
                            src={`data:image/jpeg;base64,${userProfile.bannerImage}`}
                            alt="User banner"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-black/70" />
                </div>

                <div
                    className={cx(
                        "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8",
                        "relative -mt-14 sm:-mt-16 transition-all duration-700",
                        slideIn ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                    )}
                >
                    <div className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur sm:p-8">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 overflow-hidden rounded-full border border-white/15 bg-black sm:h-24 sm:w-24">
                                    {userProfile.profileImage ? (
                                        <img
                                            src={`data:image/jpeg;base64,${userProfile.profileImage}`}
                                            alt="User profile"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-white/10" />
                                    )}
                                </div>

                                <div>
                                    <h1 className="text-xl font-semibold sm:text-2xl">{fullName || "User"}</h1>
                                    <p className="mt-1 text-sm text-white/70">@{userProfile.username}</p>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {isPlayer && (
                                            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold">
                        Player
                      </span>
                                        )}
                                        {isOrganizer && (
                                            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold">
                        Organizer
                      </span>
                                        )}
                                        {!isPlayer && !isOrganizer && (
                                            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold">
                        {userProfile.role || "Role not specified"}
                      </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-sm text-white/70">Role</p>
                                <p className="mt-1 text-base font-semibold capitalize">{userProfile.role || "Not specified"}</p>

                                {isPlayer && (
                                    <div className="mt-3 space-y-1 text-sm text-white/80">
                                        <p>
                                            <span className="text-white/70">Specialization:</span>{" "}
                                            {userProfile.specialization || "Not specified"}
                                        </p>
                                        <p>
                                            <span className="text-white/70">Game:</span>{" "}
                                            {userProfile.game || "Not specified"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {isBoth && (
                            <div className="mt-6 flex flex-wrap gap-2">
                                <button
                                    onClick={() => setActiveTab("player")}
                                    className={cx(
                                        "rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                                        activeTab === "player"
                                            ? "bg-white text-neutral-950"
                                            : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                                    )}
                                >
                                    Player Career
                                </button>

                                <button
                                    onClick={() => setActiveTab("organizer")}
                                    className={cx(
                                        "rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                                        activeTab === "organizer"
                                            ? "bg-white text-neutral-950"
                                            : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                                    )}
                                >
                                    Organizer Career
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 space-y-6 pb-16">
                        {!isBoth && isPlayer && <PlayerCareer />}
                        {!isBoth && isOrganizer && <OrganizerCareer />}

                        {isBoth && activeTab === "player" && <PlayerCareer />}
                        {isBoth && activeTab === "organizer" && <OrganizerCareer />}

                        {!isPlayer && !isOrganizer && (
                            <Section title="Profile">
                                <EmptyState title="No career data available" />
                            </Section>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}

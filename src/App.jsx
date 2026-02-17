import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { bootstrapAuth } from "./store/slices/authSlice";
import Login from "./pages/userLR/LoginPage.jsx";
import Register from "./pages/userLR/RegisterPage.jsx";
import Home from "./pages/Home";
import UserPage from "./pages/user/UserPage.jsx";
import ProtectedRoute from "./security/ProtectedRoute";
import RoleProtectedRoute from "./security/RoleProtectedRoute.jsx";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./ScrollToTop.jsx";
import Tournament from "./pages/tournament/Tournament.jsx";
import TournamentExplore from "./pages/tournament/TournamentExplore.jsx";
import TournamentCreate from "./pages/tournament/TournamentCreate.jsx";
import TournamentDetails from "./pages/tournament/TournamentDetails.jsx";
import TournamentEdit from "./pages/tournament/TournamentEdit.jsx";
import TournamentGEM from "./pages/tournament/gemtournament/TournamentGEM.jsx";
import GemMajorPage from "./pages/tournament/gemtournament/GemMajorPage.jsx";
import GemProPage from "./pages/tournament/gemtournament/GemProPage.jsx";
import GemMastersPage from "./pages/tournament/gemtournament/GemMastersPage.jsx";
import Games from "./pages/game/Game.jsx";
import GameExplore from "./pages/game/GameExplore.jsx";
import GameCreate from "./pages/game/GameCreate.jsx";
import GameEdit from "./pages/game/GameEdit.jsx";
import GameDetails from "./pages/game/GameDetails.jsx";
import Teams from "./pages/team/Teams.jsx";
import TeamExplore from "./pages/team/TeamExplore.jsx";
import TeamDetail from "./pages/team/TeamDetail.jsx";
import OrganizationExplore from "./pages/organization/OrganizationExplore.jsx";
import FriendChatPage from "./pages/chat/FriendChatPage.jsx";
import SettingsPage from "./pages/user/SettingsPage.jsx";
import ModeratorGameRequests from "./pages/moderator/ModeratorGameRequests.jsx";

function App() {
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(bootstrapAuth());
    }, [dispatch]);

    return (
        <div className="app-container w-full min-h-screen flex flex-col">
            <Header onOpenRoleModal={() => setIsRoleModalOpen(true)} />

            <main className="flex-grow w-full">
                <ScrollToTop />

                <Routes>
                    {/* ================= PUBLIC ================= */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/tournament" element={<Tournament />} />
                    <Route path="/tournament/explore" element={<TournamentExplore />} />
                    <Route path="/tournament/explore/:id" element={<TournamentDetails />} />

                    <Route path="/tournament/gem" element={<TournamentGEM />} />
                    <Route path="/tournament/gem/major" element={<GemMajorPage />} />
                    <Route path="/tournament/gem/pro" element={<GemProPage />} />
                    <Route path="/tournament/gem/masters" element={<GemMastersPage />} />

                    <Route path="/games" element={<Games />} />
                    <Route path="/games/explore" element={<GameExplore />} />
                    <Route path="/games/:gameId" element={<GameDetails />} />

                    <Route path="/teams" element={<Teams />} />
                    <Route path="/teams/explore" element={<TeamExplore />} />
                    <Route path="/teams/:teamId" element={<TeamDetail />} />

                    <Route
                        path="/user/:username"
                        element={
                            <UserPage
                                isRoleModalOpen={isRoleModalOpen}
                                setIsRoleModalOpen={setIsRoleModalOpen}
                            />
                        }
                    />

                    <Route path="/organizations/explore" element={<OrganizationExplore />} />

                    {/* ================= ROLE PROTECTED ================= */}
                    <Route element={<RoleProtectedRoute allowedRoles={["organizer", "moderator"]} />}>
                        <Route path="/games/create" element={<GameCreate />} />
                        <Route path="/games/:gameId/edit" element={<GameEdit />} />
                        <Route path="/tournament/create" element={<TournamentCreate />} />
                        <Route path="/tournament/edit/:id" element={<TournamentEdit />} />
                    </Route>

                    {/* ================= AUTH PROTECTED ================= */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/chat" element={<FriendChatPage />} />
                        <Route path="/user/settings" element={<SettingsPage />} />
                        <Route path="/moderator/game-requests" element={<ModeratorGameRequests />} />
                    </Route>
                </Routes>
            </main>

            <Footer />
        </div>
    );
}

export default App;

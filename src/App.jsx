import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/userLR/LoginPage.jsx';
import UserPage from './pages/user/UserPage.jsx';
import Home from './pages/Home';
import Register from './pages/userLR/RegisterPage.jsx';
import { AuthProvider } from './security/AuthContext';
import ProtectedRoute from './security/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import Tournament from './pages/tournament/Tournament.jsx';
import Games from './pages/game/Game.jsx';
import TournamentExplore from './pages/tournament/TournamentExplore.jsx';
import TournamentCreate from './pages/tournament/TournamentCreate.jsx';
import TournamentDetails from "./pages/tournament/TournamentDetails.jsx";
import TournamentEdit from "./pages/tournament/TournamentEdit.jsx";
function App() {
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

    return (
        <AuthProvider>
            <div className="app-container w-full min-h-screen flex flex-col">
                {/* Header section */}
                <Header onOpenRoleModal={() => setIsRoleModalOpen(true)} />

                {/* Main content area for routing */}
                <main className="flex-grow w-full">
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/tournament" element={<Tournament />} />
                        <Route path="/games" element={<Games />} />
                        <Route path="/tournament/explore" element={<TournamentExplore />} />
                        <Route path="/tournament/create" element={<TournamentCreate />} />
                        <Route path="/tournament/explore/:id" element={<TournamentDetails />} />
                        <Route path="/tournament/edit/:id" element={<TournamentEdit />} />
                        {/* Protected route */}
                        <Route element={<ProtectedRoute />}>
                            <Route
                                path="/user/:username"
                                element={<UserPage isRoleModalOpen={isRoleModalOpen} setIsRoleModalOpen={setIsRoleModalOpen} />}
                            />
                        </Route>
                    </Routes>
                </main>

                {/* Footer section */}
                <Footer />
            </div>
        </AuthProvider>
    );
}

export default App;

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/LoginPage';
import UserPage from './pages/UserPage';
import Home from './pages/Home';
import Register from './pages/RegisterPage';
import { AuthProvider } from './security/AuthContext';
import ProtectedRoute from './security/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
    return (
        <AuthProvider>
            <div className="app-container w-full min-h-screen flex flex-col">
                {/* Header section */}
                <Header />

                {/* Main content area for routing */}
                <main className="flex-grow w-full">
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected route */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/user/:username" element={<UserPage />} />
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

import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../security/AuthContext.jsx";
import backgroundImage from "../../assets/Image/pageImage/loginbacbg.jpg";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import Hero from "../../components/layout/Hero.jsx";
import CornerBadge from "../../components/ui/CornerBadge.jsx";
import {apiFetch} from "../../config/apiBase.jsx";

function Login() {
    const { login } = useContext(AuthContext);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [isLoaded, setIsLoaded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => setIsLoaded(true), []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const response = await apiFetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                let message = "Login failed";
                try {
                    const errorData = await response.json();
                    message = errorData.message || message;
                } catch {}
                throw new Error(message);
            }

            const data = await response.json();
            login(data.token);
        } catch (err) {
            setError(err.message || "Login failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Hero backgroundImage={backgroundImage}>
            <section className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
                <div
                    className={[
                        "w-full max-w-md rounded-2xl border border-white/10 bg-black/60 p-6 shadow-2xl backdrop-blur",
                        "transition-all duration-700",
                        isLoaded ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                    ].join(" ")}
                >
                    <h1 className="text-3xl font-semibold tracking-tight text-white">Login</h1>
                    <p className="mt-2 text-sm italic text-white/70">The Return of the Legend.</p>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-8 space-y-4"
                        aria-describedby={error ? "login-error" : undefined}
                    >
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-white/80">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                                placeholder="Enter username"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white/80">
                                Password
                            </label>
                            <div className="relative mt-2">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 pr-10 text-white placeholder:text-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                                    placeholder="Enter password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-2 inline-flex items-center rounded-lg px-2 text-white/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <Link to="/reset-password" className="text-sm text-white/70 hover:text-white hover:underline">
                                Forgot password ?
                            </Link>
                        </div>

                        {error && (
                            <p
                                id="login-error"
                                className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
                                aria-live="polite"
                            >
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={[
                                "w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-950",
                                "bg-white hover:bg-white/90 transition",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                                "disabled:opacity-60 disabled:cursor-not-allowed",
                            ].join(" ")}
                        >
                            {isSubmitting ? "Logging in..." : "Login"}
                        </button>

                        <div className="text-center text-sm text-white/70">
                            Don&apos;t have an account?{" "}
                            <Link to="/register" className="font-semibold text-white hover:underline">
                                Register
                            </Link>
                        </div>
                    </form>
                </div>
            </section>

            <CornerBadge>&copy; ESL IEM COLOGNE</CornerBadge>
        </Hero>
    );
}

export default Login;

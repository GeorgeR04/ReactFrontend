import React, { useEffect, useMemo, useState } from "react";
import "../../index.css";
import backgroundImage1 from "../../assets/Image/third_party/regjsterImage/G2.jpg";
import backgroundImage2 from "../../assets/Image/third_party/regjsterImage/TS.jpg";
import backgroundImage3 from "../../assets/Image/third_party/regjsterImage/Navi.jpg";
import backgroundImage4 from "../../assets/Image/third_party/regjsterImage/Liquid.jpg";
import backgroundImage5 from "../../assets/Image/third_party/regjsterImage/faze.jpg";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import CornerBadge from "../../components/ui/CornerBadge.jsx";
import { registerUser } from "../../store/slices/authSlice";

function Register() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const registerStatus = useSelector((s) => s.auth.registerStatus);
    const registerError = useSelector((s) => s.auth.registerError);

    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [errors, setErrors] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = useMemo(
        () => [backgroundImage1, backgroundImage2, backgroundImage3, backgroundImage4, backgroundImage5],
        []
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);

        setIsLoaded(true);

        return () => clearInterval(interval);
    }, [images.length]);

    const validateForm = () => {
        const newErrors = {};

        if (username.length < 4 || username.length > 20) {
            newErrors.username = "Username must be between 4 and 20 characters.";
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Invalid email address.";
        }
        if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters long.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!validateForm()) return;

        const user = { firstname, lastname, username, email, password };
        const action = await dispatch(registerUser(user));

        if (registerUser.fulfilled.match(action)) {
            // tu peux swap ça par un toast si tu veux
            alert("User registered successfully!");
            navigate("/login");
        }
    };

    const isSubmitting = registerStatus === "loading";

    return (
        <main className="relative isolate min-h-screen overflow-hidden bg-neutral-950">
            {images.map((image, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                        currentImageIndex === index ? "opacity-100" : "opacity-0"
                    }`}
                    style={{
                        backgroundImage: `url(${image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                    aria-hidden="true"
                />
            ))}

            <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
            <div
                className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60"
                aria-hidden="true"
            />

            <section className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
                <div
                    className={`w-full max-w-lg rounded-2xl border border-white/10 bg-black/60 p-6 shadow-2xl backdrop-blur transition-all duration-700 sm:p-8 ${
                        isLoaded ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                    }`}
                >
                    <h1 className="text-3xl font-semibold tracking-tight text-white">Register</h1>
                    <p className="mt-2 text-sm italic text-white/70">Become the new legend.</p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                        {(errors.form || registerError) && (
                            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                                {errors.form || registerError}
                            </p>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-white/80">First Name</label>
                                <input
                                    type="text"
                                    value={firstname}
                                    onChange={(e) => setFirstname(e.target.value)}
                                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                                    placeholder="Enter first name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80">Last Name</label>
                                <input
                                    type="text"
                                    value={lastname}
                                    onChange={(e) => setLastname(e.target.value)}
                                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                                    placeholder="Enter last name"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                                placeholder="Enter username"
                                required
                            />
                            {errors.username && <p className="mt-1 text-xs text-red-200">{errors.username}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                                placeholder="Enter email"
                                required
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-200">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                                placeholder="Enter password"
                                required
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-200">{errors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-white/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Creating account..." : "Register"}
                        </button>

                        <div className="text-center text-sm text-white/70">
                            Already have an account?{" "}
                            <Link to="/login" className="font-semibold text-white hover:underline">
                                Login
                            </Link>
                        </div>
                    </form>
                </div>
            </section>

            <CornerBadge>&copy; BLAST Final 2024</CornerBadge>
        </main>
    );
}

export default Register;

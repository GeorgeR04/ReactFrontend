import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../security/AuthContext.jsx";

function Section({ title, children }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold">{title}</h2>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

const GameSuggest = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        type: "",
        description: "",
        publisher: "",
        year: "",
    });

    const [status, setStatus] = useState("idle"); // idle | sending | success | error

    const update = (k, v) =>
        setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        if (!form.name || !form.description) {
            alert("Please fill required fields.");
            return;
        }

        setStatus("sending");

        try {
            const res = await fetch(
                "http://localhost:8080/api/games/suggest",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    body: JSON.stringify({
                        name: form.name,
                        type: form.type,
                        description: form.description,
                        publisher: form.publisher,
                        yearOfExistence: parseInt(form.year) || null,
                    }),
                }
            );

            if (!res.ok) throw new Error();

            setStatus("success");
            setTimeout(() => navigate("/games/explore"), 1500);
        } catch {
            setStatus("error");
        }
    };

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <section className="mx-auto max-w-4xl px-4 py-12 space-y-6">
                <h1 className="text-3xl font-semibold text-center sm:text-4xl">
                    Suggest a Game
                </h1>

                <p className="mx-auto max-w-2xl text-center text-sm text-white/70">
                    Can’t find your favorite game? Suggest it to the platform and
                    help us grow the competitive ecosystem.
                </p>

                <Section title="Game Proposal">
                    <input
                        placeholder="Game name *"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                    />

                    <input
                        placeholder="Game type (FPS, MOBA, RTS…)"
                        value={form.type}
                        onChange={(e) => update("type", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                    />

                    <textarea
                        rows={4}
                        placeholder="Why should this game be added? *"
                        value={form.description}
                        onChange={(e) => update("description", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                    />

                    <input
                        placeholder="Publisher"
                        value={form.publisher}
                        onChange={(e) => update("publisher", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                    />

                    <input
                        type="number"
                        placeholder="Year of release"
                        value={form.year}
                        onChange={(e) => update("year", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                    />
                </Section>

                {/* Feedback */}
                {status === "success" && (
                    <p className="text-center text-green-400 text-sm">
                        Game suggestion sent successfully!
                    </p>
                )}

                {status === "error" && (
                    <p className="text-center text-red-400 text-sm">
                        Failed to send suggestion. Please try again.
                    </p>
                )}

                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="rounded-xl border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold hover:bg-white/10"
                    >
                        Cancel
                    </button>

                    <button
                        disabled={status === "sending"}
                        onClick={handleSubmit}
                        className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50"
                    >
                        {status === "sending" ? "Sending…" : "Send Suggestion"}
                    </button>
                </div>
            </section>
        </main>
    );
};

export default GameSuggest;

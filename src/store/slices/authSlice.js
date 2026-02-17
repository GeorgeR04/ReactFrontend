import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "../../security/jwtDecodeWrapper";
import { apiFetch } from "../../config/apiBase.jsx";

function readSessionToken() {
    const t = sessionStorage.getItem("token");
    return t && t.length <= 2048 ? t.trim() : null;
}
function readSessionUser() {
    const u = sessionStorage.getItem("user");
    try {
        return u ? JSON.parse(u) : null;
    } catch {
        return null;
    }
}

function isExpired(token) {
    try {
        const decoded = jwtDecode(token);
        return decoded?.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}

async function fetchMeProfile(cleanToken) {
    // essaye /api/profile/me
    let res = await apiFetch("/api/profile/me", {
        headers: { Authorization: `Bearer ${cleanToken}` },
    });

    // fallback /profile/me (si ton backend utilise ça)
    if (res.status === 404) {
        res = await apiFetch("/profile/me", {
            headers: { Authorization: `Bearer ${cleanToken}` },
        });
    }

    if (res.status === 401) throw new Error("Unauthorized");
    if (!res.ok) return null;
    return await res.json();
}

export const bootstrapAuth = createAsyncThunk("auth/bootstrapAuth", async () => {
    const token = readSessionToken();

    if (!token || isExpired(token)) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        return { token: null, user: null };
    }

    const me = await fetchMeProfile(token);

    const user = me
        ? {
            id: me.id,
            username: me.username,
            role: me.role,
            specialization: me.specialization,
            game: me.game,
            profileImage: me.profileImage,
        }
        : readSessionUser();

    sessionStorage.setItem("token", token);
    if (user) sessionStorage.setItem("user", JSON.stringify(user));

    return { token, user };
});

export const loginWithCredentials = createAsyncThunk(
    "auth/loginWithCredentials",
    async ({ username, password }, { rejectWithValue }) => {
        try {
            const res = await apiFetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                let msg = "Login failed";
                try {
                    const err = await res.json();
                    msg = err?.message || msg;
                } catch {}
                return rejectWithValue(msg);
            }

            const data = await res.json();
            const token = String(data?.token || "").trim();

            if (!token || token.length > 2048 || isExpired(token)) {
                return rejectWithValue("Invalid token");
            }

            const me = await fetchMeProfile(token);
            const user = me
                ? {
                    id: me.id,
                    username: me.username,
                    role: me.role,
                    specialization: me.specialization,
                    game: me.game,
                    profileImage: me.profileImage,
                }
                : null;

            sessionStorage.setItem("token", token);
            if (user) sessionStorage.setItem("user", JSON.stringify(user));

            return { token, user };
        } catch {
            return rejectWithValue("Error connecting to server.");
        }
    }
);
export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await apiFetch("/api/auth/register", {
                method: "POST",
                body: payload, // objet => apiFetch stringify si besoin
            });

            const text = await res.text();
            if (!res.ok) return rejectWithValue(text || "Registration failed.");

            return text || "User registered successfully!";
        } catch {
            return rejectWithValue("Error connecting to server.");
        }
    }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
    sessionStorage.clear();
    return true;
});

const authSlice = createSlice({
    name: "auth",
    initialState: {
        token: readSessionToken(),
        user: readSessionUser(),
        registerStatus: "idle",
        registerError: "",
        status: "idle", // idle | loading | ready | error
        error: "",
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(bootstrapAuth.pending, (s) => {
                s.status = "loading";
                s.error = "";
            })
            .addCase(bootstrapAuth.fulfilled, (s, a) => {
                s.token = a.payload.token;
                s.user = a.payload.user;
                s.status = "ready";
            })
            .addCase(bootstrapAuth.rejected, (s) => {
                s.token = null;
                s.user = null;
                s.status = "ready";
            });

        builder
            .addCase(loginWithCredentials.pending, (s) => {
                s.status = "loading";
                s.error = "";
            })
            .addCase(loginWithCredentials.fulfilled, (s, a) => {
                s.token = a.payload.token;
                s.user = a.payload.user;
                s.status = "ready";
            })
            .addCase(loginWithCredentials.rejected, (s, a) => {
                s.status = "error";
                s.error = a.payload || "Login failed";
            });

        builder.addCase(logoutThunk.fulfilled, (s) => {
            s.token = null;
            s.user = null;
            s.status = "idle";
            s.error = "";
        });
        builder
            .addCase(registerUser.pending, (s) => {
                s.registerStatus = "loading";
                s.registerError = "";
            })
            .addCase(registerUser.fulfilled, (s) => {
                s.registerStatus = "ready";
            })
            .addCase(registerUser.rejected, (s, a) => {
                s.registerStatus = "error";
                s.registerError = a.payload || "Registration failed.";
            });
    },
});
export default authSlice.reducer;
export const { patchUser } = authSlice.actions;
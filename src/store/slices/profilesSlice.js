import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFetch } from "../../config/apiBase.jsx";

export const fetchProfileByUsername = createAsyncThunk(
    "profiles/fetchByUsername",
    async ({ username, token }, { rejectWithValue }) => {
        try {
            const endpoint = `/profile/username/${username}`;

            const res = await apiFetch(endpoint, {
                headers: { Authorization: `Bearer ${String(token || "").trim()}` },
            });

            if (res.status === 401) return rejectWithValue("Unauthorized");
            if (!res.ok) return rejectWithValue("User not found");

            return { username, profile: await res.json() };
        } catch {
            return rejectWithValue("An error occurred.");
        }
    }
);

export const fetchMyProfile = createAsyncThunk(
    "profiles/fetchMe",
    async ({ token }, { rejectWithValue }) => {
        try {
            const res = await apiFetch("/api/profile/me", {
                headers: { Authorization: `Bearer ${String(token || "").trim()}` },
            });

            if (res.status === 401) return rejectWithValue("Unauthorized");
            if (!res.ok) return rejectWithValue("Failed to load profile");

            return await res.json();
        } catch {
            return rejectWithValue("Failed to load profile");
        }
    }
);

const profilesSlice = createSlice({
    name: "profiles",
    initialState: {
        me: { data: null, status: "idle", error: "" },
        byUsername: {},
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyProfile.pending, (s) => {
                s.me.status = "loading";
                s.me.error = "";
            })
            .addCase(fetchMyProfile.fulfilled, (s, a) => {
                s.me.data = a.payload;
                s.me.status = "ready";
            })
            .addCase(fetchMyProfile.rejected, (s, a) => {
                s.me.status = "error";
                s.me.error = a.payload || "Failed to load profile";
            });

        builder
            .addCase(fetchProfileByUsername.pending, (s, a) => {
                const u = a.meta.arg.username;
                s.byUsername[u] = { data: null, status: "loading", error: "" };
            })
            .addCase(fetchProfileByUsername.fulfilled, (s, a) => {
                const { username, profile } = a.payload;
                s.byUsername[username] = { data: profile, status: "ready", error: "" };
            })
            .addCase(fetchProfileByUsername.rejected, (s, a) => {
                const u = a.meta.arg.username;
                s.byUsername[u] = { data: null, status: "error", error: a.payload || "Error" };
            });
    },
});

export default profilesSlice.reducer;

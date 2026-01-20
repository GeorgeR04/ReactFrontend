// apiBase.jsx

function isLocalHost() {
    if (typeof window === "undefined") return false;
    const h = window.location.hostname;
    return h === "localhost" || h === "127.0.0.1";
}

function getRuntimeDefaults() {
    // Par défaut:
    // - si on est sur localhost => backend exposé sur localhost:8080 (docker-compose / dev)
    // - sinon (gem.local / prod / k8s ingress) => /api et /ws via le même host
    const local = isLocalHost();

    const api = local ? "http://localhost:8080/api" : "/api";
    const ws = local ? "ws://localhost:8080/ws" : "/ws";

    return { api, ws, local };
}

const { api: DEFAULT_API, ws: DEFAULT_WS, local: LOCAL } = getRuntimeDefaults();

// Base API: priorité à window.__ENV__ puis Vite env, sinon default runtime
let API_BASE =
    (typeof window !== "undefined" && window.__ENV__ && window.__ENV__.API_BASE_URL) ||
    (import.meta?.env && import.meta.env.VITE_API_BASE_URL) ||
    (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE_URL) ||
    DEFAULT_API;

// Sécurité: si on N'EST PAS en localhost mais une env dit "http://localhost:xxxx", on l'ignore
if (!LOCAL && /^https?:\/\/localhost(?::\d+)?/i.test(API_BASE)) {
    API_BASE = "/api";
}

export { API_BASE };

export function apiUrl(path) {
    const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${base}${p}`;
}

function normalizePath(pathOrUrl) {
    const raw = String(pathOrUrl || "");

    // Accepte: "/x", "x", "/api/x", "http://localhost:8080/api/x", "https://gem.local/api/x"
    try {
        // URL() gère aussi les chemins relatifs via window.location.origin
        const u = new URL(raw, typeof window !== "undefined" ? window.location.origin : "http://localhost");
        let p = u.pathname + (u.search || "");
        p = p.replace(/^\/api(?=\/|$)/, ""); // enlève le prefix /api si fourni
        return p.startsWith("/") ? p : `/${p}`;
    } catch {
        // fallback simple
        let p = raw
            .replace(/^https?:\/\/localhost(?::\d+)?/i, "")
            .replace(/^\/api(?=\/|$)/, "")
            .replace(/^api(?=\/|$)/, "");
        return p.startsWith("/") ? p : `/${p}`;
    }
}

export async function apiFetch(pathOrUrl, options = {}) {
    const headers = new Headers(options.headers || {});

    const hasBody = options.body !== undefined && options.body !== null;
    const isStringBody = typeof options.body === "string";

    if (hasBody && !isStringBody && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const finalOptions = {
        ...options,
        headers,
        body: hasBody && !isStringBody ? JSON.stringify(options.body) : options.body,
    };

    const p = normalizePath(pathOrUrl);
    return fetch(apiUrl(p), finalOptions);
}

export function wsUrl(path = "/ws") {
    let raw =
        (typeof window !== "undefined" && window.__ENV__ && window.__ENV__.WS_BASE_URL) ||
        (import.meta?.env && import.meta.env.VITE_WS_BASE_URL) ||
        (typeof process !== "undefined" && process.env && process.env.REACT_APP_WS_BASE_URL) ||
        DEFAULT_WS;

    // Sécurité: si on n'est pas en localhost mais raw pointe sur localhost => /ws
    if (!LOCAL && /^wss?:\/\/localhost(?::\d+)?/i.test(raw)) raw = "/ws";

    // raw peut être:
    // - "ws://..." ou "wss://..." => OK
    // - "/ws" => on construit ws(s)://host/ws
    if (raw.startsWith("ws://") || raw.startsWith("wss://")) return raw;

    if (typeof window !== "undefined" && raw.startsWith("/")) {
        const proto = window.location.protocol === "https:" ? "wss" : "ws";
        return `${proto}://${window.location.host}${raw}`;
    }

    // fallback
    if (typeof window !== "undefined") {
        const proto = window.location.protocol === "https:" ? "wss" : "ws";
        const p = path.startsWith("/") ? path : `/${path}`;
        return `${proto}://${window.location.host}${p}`;
    }

    return raw;
}

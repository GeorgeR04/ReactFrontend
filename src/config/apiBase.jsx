export const API_BASE =
    (window.__ENV__ && window.__ENV__.API_BASE_URL) ||
    (import.meta?.env && import.meta.env.VITE_API_BASE_URL) ||
    (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE_URL) ||
    "/api";

export function apiUrl(path) {
    const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${base}${p}`;
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

    // accepte: "/x", "x", "/api/x", "http://localhost:8080/api/x"
    const raw = String(pathOrUrl);
    const cleaned = raw
        .replace(/^https?:\/\/localhost:8080/, "")
        .replace(/^\/api/, "")
        .replace(/^api/, "");

    const p = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
    return fetch(apiUrl(p), finalOptions);
}

export function wsUrl(path = "/ws") {
    const raw =
        (window.__ENV__ && window.__ENV__.WS_BASE_URL) ||
        (import.meta?.env && import.meta.env.VITE_WS_BASE_URL) ||
        (typeof process !== "undefined" && process.env && process.env.REACT_APP_WS_BASE_URL) ||
        "";

    if (raw) {
        // accepte "ws://host/ws" ou "wss://host/ws" ou "/ws"
        if (raw.startsWith("ws://") || raw.startsWith("wss://")) return raw;
        if (raw.startsWith("/")) {
            const proto = window.location.protocol === "https:" ? "wss" : "ws";
            return `${proto}://${window.location.host}${raw}`;
        }
    }

    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${proto}://${window.location.host}${p}`;
}

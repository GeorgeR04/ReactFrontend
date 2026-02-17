const ZERO_WIDTH_RE = /[\u200B-\u200D\u2060\uFEFF]/g;

function stripZeroWidth(value) {
    return String(value ?? "").replace(ZERO_WIDTH_RE, "");
}

function isLocalHost() {
    if (typeof window === "undefined") return false;
    const h = window.location.hostname;
    return h === "localhost" || h === "127.0.0.1";
}

function getRuntimeDefaults() {
    const local = isLocalHost();

    const api = local ? "http://localhost:8080/api" : "/api";
    const ws = local ? "ws://localhost:8080/ws" : "/ws";

    return { api, ws, local };
}

const { api: DEFAULT_API, ws: DEFAULT_WS, local: LOCAL } = getRuntimeDefaults();

let API_BASE =
    (typeof window !== "undefined" && window.__ENV__ && window.__ENV__.API_BASE_URL) ||
    (import.meta?.env && import.meta.env.VITE_API_BASE_URL) ||
    (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE_URL) ||
    DEFAULT_API;


API_BASE = stripZeroWidth(API_BASE).trim();

if (!LOCAL && /^https?:\/\/localhost(?::\d+)?/i.test(API_BASE)) {
    API_BASE = "/api";
}

export { API_BASE };

export function apiUrl(path) {
    const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;

    const cleanedPath = stripZeroWidth(path).trim();
    const p = cleanedPath.startsWith("/") ? cleanedPath : `/${cleanedPath}`;

    return `${base}${p}`;
}

function normalizePath(pathOrUrl) {

    const raw = stripZeroWidth(pathOrUrl || "").trim();


    if (import.meta?.env?.DEV && raw !== String(pathOrUrl || "")) {
        // eslint-disable-next-line no-console
        console.warn("[apiBase] cleaned zero-width chars in path:", JSON.stringify(pathOrUrl), "=>", JSON.stringify(raw));
    }

    try {

        const u = new URL(raw, typeof window !== "undefined" ? window.location.origin : "http://localhost");

        let p = stripZeroWidth(u.pathname) + stripZeroWidth(u.search || "");


        p = p.replace(/^\/api(?=\/|$)/, "");

        p = stripZeroWidth(p).trim();
        return p.startsWith("/") ? p : `/${p}`;
    } catch {

        let p = raw
            .replace(/^https?:\/\/localhost(?::\d+)?/i, "")
            .replace(/^\/api(?=\/|$)/, "")
            .replace(/^api(?=\/|$)/, "");

        p = stripZeroWidth(p).trim();
        return p.startsWith("/") ? p : `/${p}`;
    }
}

export async function apiFetch(pathOrUrl, options = {}) {
    const headers = new Headers(options.headers || {});

    const hasBody = options.body !== undefined && options.body !== null;
    const isStringBody = typeof options.body === "string";

    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
    const isBlob = typeof Blob !== "undefined" && options.body instanceof Blob;

    if (hasBody && !isStringBody && !isFormData && !isBlob && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const finalOptions = {
        ...options,
        headers,
        body:
            hasBody && !isStringBody && !isFormData && !isBlob
                ? JSON.stringify(options.body)
                : options.body,
    };

    const p = normalizePath(pathOrUrl);


    if (import.meta?.env?.DEV) {
        // eslint-disable-next-line no-console
        console.log("[apiFetch]", JSON.stringify(pathOrUrl), "=>", JSON.stringify(p), "=>", apiUrl(p));
    }

    return fetch(apiUrl(p), finalOptions);
}

export function wsUrl(path = "/ws") {
    let raw =
        (typeof window !== "undefined" && window.__ENV__ && window.__ENV__.WS_BASE_URL) ||
        (import.meta?.env && import.meta.env.VITE_WS_BASE_URL) ||
        (typeof process !== "undefined" && process.env && process.env.REACT_APP_WS_BASE_URL) ||
        DEFAULT_WS;

    raw = stripZeroWidth(raw).trim();


    if (!LOCAL && /^wss?:\/\/localhost(?::\d+)?/i.test(raw)) raw = "/ws";

    if (raw.startsWith("ws://") || raw.startsWith("wss://")) return raw;

    if (typeof window !== "undefined" && raw.startsWith("/")) {
        const proto = window.location.protocol === "https:" ? "wss" : "ws";
        return `${proto}://${window.location.host}${raw}`;
    }

    
    if (typeof window !== "undefined") {
        const proto = window.location.protocol === "https:" ? "wss" : "ws";
        const p = stripZeroWidth(path).trim();
        const finalPath = p.startsWith("/") ? p : `/${p}`;
        return `${proto}://${window.location.host}${finalPath}`;
    }

    return raw;
}

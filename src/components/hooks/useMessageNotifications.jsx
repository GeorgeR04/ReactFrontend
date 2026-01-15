import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useMessageNotifications({ token, enabled = true, pollMs = 8000 }) {
    const [totalUnread, setTotalUnread] = useState(0);
    const [items, setItems] = useState([]);

    const abortRef = useRef(null);
    const stopPollingRef = useRef(false);

    // clean token (IMPORTANT)
    const cleanToken = useMemo(() => {
        return typeof token === "string" ? token.trim().replace(/^Bearer\s+/i, "") : "";
    }, [token]);

    const refresh = useCallback(async () => {
        if (!enabled || !cleanToken) return;
        if (stopPollingRef.current) return;

        try {
            if (abortRef.current) abortRef.current.abort();
            const ac = new AbortController();
            abortRef.current = ac;

            const res = await fetch("http://localhost:8080/api/messages/unread/summary", {
                headers: { Authorization: `Bearer ${cleanToken}` },
                signal: ac.signal,
            });

            if (res.status === 401 || res.status === 403 || res.status === 404) {
                stopPollingRef.current = true;
                return;
            }

            if (!res.ok) return;

            const data = await res.json();
            setTotalUnread(Number(data?.totalUnread) || 0);
            setItems(Array.isArray(data?.items) ? data.items : []);
        } catch (e) {
            if (e?.name === "AbortError") return;
        }
    }, [enabled, cleanToken]);

    const markReadFromSender = useCallback(
        async (senderId) => {
            if (!enabled || !cleanToken || !senderId) return;

            try {
                const res = await fetch(
                    `http://localhost:8080/api/messages/mark-read/from/${encodeURIComponent(senderId)}`,
                    {
                        method: "POST",
                        headers: { Authorization: `Bearer ${cleanToken}` },
                    }
                );

                if (res.ok) {
                    refresh();
                }
            } catch {
            }
        },
        [enabled, cleanToken, refresh]
    );

    useEffect(() => {
        if (!enabled || !cleanToken) return;

        stopPollingRef.current = false;

        refresh();
        const interval = setInterval(refresh, pollMs);

        return () => {
            clearInterval(interval);
            if (abortRef.current) abortRef.current.abort();
        };
    }, [enabled, cleanToken, pollMs, refresh]);

    return { totalUnread, items, refresh, markReadFromSender };
}

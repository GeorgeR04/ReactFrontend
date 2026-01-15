import React from "react";

export default function CornerBadge({ children }) {
    return (
        <div className="absolute bottom-4 left-4 z-10">
            <div className="inline-flex rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
                {children}
            </div>
        </div>
    );
}

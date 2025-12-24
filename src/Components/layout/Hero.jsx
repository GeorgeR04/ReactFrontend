import React from "react";

export default function Hero({ backgroundImage, videoSrc, children }) {
    return (
        <main className="relative isolate min-h-screen overflow-hidden bg-neutral-950">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                {videoSrc ? (
                    <video autoPlay loop muted playsInline className="h-full w-full object-cover">
                        <source src={videoSrc} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <div
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                        aria-hidden="true"
                    />
                )}

                {/* overlays (moins “noir” => on voit bien l’image) */}
                <div className="absolute inset-0 bg-black/35" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
            </div>

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </main>
    );
}

import React from "react";

const Footer = () => {
    return (
        <footer className="w-full border-t border-white/10 bg-black text-white">
            <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-white/80 sm:px-6">
                <p className="text-white/70">
                    &copy; 2024-2025 <span className="font-semibold text-white">GAMING ESPORT MAJOR (GEM)</span>. All rights reserved.
                </p>
                <p className="mt-2 text-white/60">
                    Privacy Policy <span className="px-2">|</span> Terms of Service <span className="px-2">|</span> Contact Us
                </p>
            </div>
        </footer>
    );
};

export default Footer;

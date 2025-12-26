import { useState } from "react";
import RoleSelectionModal from "../../../components/RoleSelectionModal";

export default function RoleSection({ role }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur">
            <h2 className="text-lg font-semibold">Role & Preferences</h2>

            <p className="mt-2 text-sm text-white/70">
                Choose how you want to participate on the platform.
            </p>

            <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm text-white/60">Current role</p>
                    <p className="text-base font-semibold capitalize">
                        {role || "Not defined"}
                    </p>
                </div>

                <button
                    onClick={() => setOpen(true)}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                    Change role
                </button>
            </div>

            <RoleSelectionModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onSave={() => window.location.reload()}
            />
        </div>
    );
}

export default function SecuritySection() {
    return (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-red-200">Danger Zone</h2>
            <p className="mt-2 text-sm text-red-300">
                Change password or delete your account.
            </p>

            <button className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                Delete account
            </button>
        </div>
    );
}

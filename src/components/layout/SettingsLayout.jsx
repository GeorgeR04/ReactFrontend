export default function SettingsLayout({ title, children }) {
    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                <div className="mt-8 space-y-6">{children}</div>
            </section>
        </main>
    );
}

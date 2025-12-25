import { useRef } from "react";

export default function ImagePicker({
                                        value,
                                        onChange,
                                        label = "Choose image",
                                    }) {
    const inputRef = useRef(null);

    const handleFile = (file) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => onChange(reader.result.split(",")[1]);
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
                {label}
            </button>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="hidden"
            />

            {value ? (
                <img
                    src={`data:image/jpeg;base64,${value}`}
                    alt="Preview"
                    className="h-40 w-full rounded-xl object-cover border border-white/10"
                />
            ) : (
                <p className="text-sm text-white/60">No image selected</p>
            )}
        </div>
    );
}

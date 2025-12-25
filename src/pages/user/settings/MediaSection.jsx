import { useContext, useRef, useState } from "react";
import { AuthContext } from "../../../security/AuthContext.jsx";

export default function MediaSection() {
    const { token } = useContext(AuthContext);

    const [selectedImage, setSelectedImage] = useState(null);
    const [imageType, setImageType] = useState(null);
    const [error, setError] = useState("");

    const fileInputRef = useRef(null);

    const openFilePicker = (type) => {
        setImageType(type);
        setSelectedImage(null);
        fileInputRef.current?.click();
    };

    const handleSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setSelectedImage(reader.result);
        reader.readAsDataURL(file);
    };

    const upload = async () => {
        if (!selectedImage || !imageType) return;

        try {
            const blob = await fetch(selectedImage).then((r) => r.blob());
            const formData = new FormData();
            formData.append("file", blob);
            formData.append("type", imageType);

            const res = await fetch("http://localhost:8080/api/profile/upload-image", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            alert("Image updated successfully");
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur">
            <h2 className="text-lg font-semibold">Profile & Banner</h2>

            <div className="mt-4 flex flex-wrap gap-3">
                <button
                    onClick={() => openFilePicker("profile")}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
                >
                    Change profile image
                </button>

                <button
                    onClick={() => openFilePicker("banner")}
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                >
                    Change banner image
                </button>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleSelect}
                className="hidden"
            />

            {selectedImage && (
                <>
                    <img
                        src={selectedImage}
                        alt="Preview"
                        className="mt-4 h-40 w-full rounded-xl object-cover border border-white/10"
                    />
                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={upload}
                            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
                        >
                            Upload
                        </button>
                    </div>
                </>
            )}

            {error && (
                <p className="mt-3 text-sm text-red-300">{error}</p>
            )}
        </div>
    );
}

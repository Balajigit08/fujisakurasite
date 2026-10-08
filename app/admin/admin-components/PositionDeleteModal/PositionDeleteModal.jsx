"use client";

import { useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";

export default function PositionDeleteModal({ deletingId, onClose, onConfirm, deleting = false }) {
    useEffect(() => {
        if (!deletingId) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const mainContent = document.getElementById("admin-main-content");
        if (mainContent) mainContent.inert = true;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);

            if (mainContent) mainContent.inert = false;
        };
    }, [deletingId, onClose]);

    if (!deletingId) return null;

    return (
        <div
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Confirm Delete Position"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-[clamp(0.5rem,2vw,1.5rem)] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-[clamp(1.25rem,2.5vw,2rem)] max-w-[90vw] sm:max-w-md w-full shadow-2xl border border-gray-100 text-center"
            >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shrink-0">
                    <FaTrashAlt className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-[clamp(1.15rem,1.8vw,1.4rem)] font-bold text-[#2d3a53]">Confirm Delete</h3>
                <p className="text-gray-600 text-[clamp(13px,1.1vw,15px)] mt-2 leading-relaxed">
                    Are you sure you want to delete this position? If it has existing applications, it will be deactivated instead.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={deleting}
                        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                        {deleting ? (
                            <>
                                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                Deleting…
                            </>
                        ) : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

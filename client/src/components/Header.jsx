import React from "react";

export default function Header({ currentUser, onLogout }) {
    return (
        <header className="bg-emerald-600 text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center">
            <div>
                <h1 className="font-bold text-lg tracking-wide">KongsiStok</h1>
                {/* TAMPILKAN ALAMAT SECARA DINAMIS */}
                <p className="text-xs text-emerald-100">
                    {currentUser?.alamat || "Solidaritas Warung Lokal"}
                </p>
            </div>
            <button onClick={onLogout} className="text-xs bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 rounded-full font-medium">
                Keluar
            </button>
        </header>
    )
}
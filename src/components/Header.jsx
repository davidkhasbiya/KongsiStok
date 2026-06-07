import React from "react";
import Logo from "./Logo";

export default function Header({ currentUser, onLogout }) {
    return (
        <header className="bg-emerald-600 text-white p-4 flex justify-between items-center w-full shadow-sm">
            
            {/* SISI KIRI: Logo + Judul Aplikasi (Satu baris rapi) */}
            <div className="flex items-center gap-3">
                {/* Menggunakan variant="white" supaya logonya cerah & menyatu */}
                <Logo className="w-8 h-8" variant="white" />
                <div>
                    <h1 className="font-bold text-xl tracking-tight leading-none mb-1">
                        KongsiStok
                    </h1>
                    <p className="text-xs text-emerald-100/90 font-light">
                        {currentUser?.nama_warung 
                            ? `${currentUser.nama_warung} • ${currentUser.komunitas}` 
                            : "Solidaritas Warung Lokal"
                        }
                    </p>
                </div>
            </div>

            {/* SISI KANAN: Tombol Keluar (Tetap tampil seperti desain awal kamu) */}
            <div className="flex items-center gap-3">
                {currentUser && (
                    <span className="hidden sm:inline text-xs font-mono bg-emerald-700/40 px-2 py-1 rounded text-emerald-550">
                        {currentUser.no_wa}
                    </span>
                )}
                <button
                    type="button"
                    onClick={onLogout}
                    className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-1.5 rounded-full text-xs transition-all cursor-pointer border border-white/10"
                >
                    Keluar
                </button>
            </div>

        </header>
    );
}
import React from "react";

export default function Header({ currentUser, onLogout }) {
    return (
        <header className="bg-emerald-600 text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center">
            <div>
                <h1 className="font-bold text-lg tracking-wide">KongsiStok</h1>
                
                {/* TAMPILKAN NAMA WARUNG DAN ALAMAT/KOMUNITAS SECARA DINAMIS */}
                <p className="text-xs text-emerald-100 mt-0.5">
                    {currentUser?.nama_warung ? (
                        <>
                            <span className="font-semibold text-white">{currentUser.nama_warung}</span>
                            {(currentUser?.komunitas || currentUser?.alamat) && ` • ${currentUser.komunitas || currentUser.alamat}`}
                        </>
                    ) : (
                        "Solidaritas Warung Lokal"
                    )}
                </p>
            </div>
            
            <div className="flex items-center gap-3">
                {/* Opsional: Menampilkan No WA tipis-tipis di sebelah tombol Keluar */}
                {currentUser?.no_wa && (
                    <span className="text-[11px] bg-emerald-700/40 px-2 py-1 rounded text-emerald-100 hidden sm:inline">
                        {currentUser.no_wa}
                    </span>
                )}
                
                <button 
                    onClick={onLogout} 
                    className="text-xs bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer"
                >
                    Keluar
                </button>
            </div>
        </header>
    );
}
import React from "react";

export default function Header({ onLogout }) {
    return (
        <header className="bg-white border-b border-zinc-200/80 px-6 py-4 sticky top-0 z-10 flex justify-between items-center">
            <div>
                <h1 className="font-semibold text-base text-zinc-900 tracking-tight">KongsiStok</h1>
                <p className="text-xs text-zinc-500 mt-0.5">Warung Berkah (RT 05)</p>
            </div>
            <button 
                onClick={onLogout} 
                className="text-xs text-green-600 hover:text-zinc-950 hover:bg-zinc-50 border border-zinc-200 px-4 py-1.5 rounded-lg transition-colors font-medium cursor-pointer"
            >
                Keluar
            </button>
        </header>
    );
}
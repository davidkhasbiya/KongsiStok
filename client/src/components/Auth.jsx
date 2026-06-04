import React, { useState } from "react";

export default function Auth({ onAuthSuccess }) {
    const [tab, setTab] = useState('login');
    const [whatsapp, setWhatsapp] = useState('');
    const [password, setPassword] = useState('');
    const [namaWarung, setNamaWarung] = useState('');
    const [areaRt, setAreaRt] = useState('Komunitas RT 05 - Mampang');

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        
        const mockUser = {
            id: "user_" + Date.now(),
            whatsapp: whatsapp || "08123456789",
            nama_warung: tab === 'login' ? "Warung Berkah (RT 05)" : (namaWarung || "Warung Baru"),
            alamat: areaRt
        };

        if (typeof onAuthSuccess === 'function') {
            onAuthSuccess(mockUser, "mock-token-12345");
        }
    };

    return (
        <div className="flex-1 flex flex-col justify-center p-6 max-w-sm mx-auto w-full">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">KongsiStok</h1>
                <p className="text-xs text-zinc-500 mt-1">Platform koordinasi dan solidaritas stok antar warung</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-6">
                <div className="flex border-b border-zinc-100 mb-6 text-xs font-medium">
                    <button
                        type="button"
                        onClick={() => setTab('login')}
                        className={`w-1/2 pb-3 text-center border-b font-medium cursor-pointer transition-all ${tab === 'login' ? 'border-zinc-900 text-zinc-900 font-semibold' : 'border-transparent text-zinc-400'}`}
                    >
                        Masuk
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('register')}
                        className={`w-1/2 pb-3 text-center border-b font-medium cursor-pointer transition-all ${tab === 'register' ? 'border-zinc-900 text-zinc-900 font-semibold' : 'border-transparent text-zinc-400'}`}
                    >
                        Daftar Komunitas
                    </button>
                </div>

                {tab === 'login' ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">No. WhatsApp</label>
                            <input 
                                type="tel" 
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                placeholder="08123456xxx" 
                                className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm focus:border-zinc-950 focus:outline-none bg-zinc-50/50 text-zinc-900" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Kata Sandi</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••" 
                                className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm focus:border-zinc-950 focus:outline-none bg-zinc-50/50 text-zinc-900" 
                                required 
                            />
                        </div>
                        <button type="submit" className="w-full bg-green-900 hover:bg-zinc-800 text-white font-medium py-2.5 rounded-lg text-xs transition-colors cursor-pointer text-center mt-2">
                            Masuk Ke Dashboard
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Nama Warung</label>
                            <input 
                                type="text" 
                                value={namaWarung}
                                onChange={(e) => setNamaWarung(e.target.value)}
                                placeholder="Contoh: Warung Berkah" 
                                className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm focus:border-zinc-950 focus:outline-none bg-zinc-50/50 text-zinc-900" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Wilayah Komunitas</label>
                            <select 
                                value={areaRt}
                                onChange={(e) => setAreaRt(e.target.value)}
                                className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm focus:border-zinc-950 focus:outline-none bg-zinc-50/50 text-zinc-900"
                            >
                                <option value="Komunitas RT 05 - Mampang">Komunitas RT 05 - Mampang</option>
                                <option value="Komunitas RT 02 - Kemang">Komunitas RT 02 - Kemang</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">No. WhatsApp</label>
                            <input 
                                type="tel" 
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                placeholder="08123456xxx" 
                                className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm focus:border-zinc-950 focus:outline-none bg-zinc-50/50 text-zinc-900" 
                                required 
                            />
                        </div>
                        <button type="submit" className="w-full bg-green-900 hover:bg-zinc-800 text-white font-medium py-2.5 rounded-lg text-xs transition-colors cursor-pointer text-center mt-2">
                            Selesaikan Pendaftaran
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
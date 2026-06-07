import React, { useState } from "react";

export default function Auth({ onAuthSuccess }) {
    const [tab, setTab] = useState('login');
    const [whatsapp, setWhatsapp] = useState('');
    const [password, setPassword] = useState('');
    const [namaWarung, setNamaWarung] = useState('');
    const [alamat, setAlamat] = useState(''); // Akan dikirim sebagai 'komunitas' ke database

    // Tambahan state untuk loading dan error
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            if (tab === 'register') {
                // ALUR 1: PROSES DAFTAR (REGISTER)
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nama_warung: namaWarung,
                        komunitas: alamat, // Menyimpan input alamat ke kolom komunitas
                        no_wa: whatsapp,
                        password: password
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Gagal mendaftar');
                }

                alert("Pendaftaran berhasil! Silakan masuk menggunakan No. WA Anda.");
                setTab('login'); // Otomatis pindah ke tab login setelah sukses
                setPassword(''); // Kosongkan password demi keamanan

            } else {
                // ALUR 2: PROSES MASUK (LOGIN) ASLI
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        no_wa: whatsapp,
                        password: password
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Gagal masuk');
                }

                // Opsional: Simpan ke localStorage agar jika halaman di-refresh user tidak log out otomatis
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Kirim data user nyata dan token asli dari database ke App.js
                onAuthSuccess(data.user, data.token);
            }
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col justify-center p-6 max-w-sm mx-auto w-full">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">KongsiStok</h1>
                <p className="text-xs text-zinc-500 mt-1">Platform koordinasi dan solidaritas stok antar warung</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">

                {/* Menampilkan pesan error jika ada */}
                {errorMsg && (
                    <div className="mb-4 p-2 bg-red-50 text-red-600 text-xs text-center rounded-md border border-red-100">
                        {errorMsg}
                    </div>
                )}

                <div className="flex border-b border-zinc-100 mb-6 text-xs font-medium">
                    <button
                        type="button"
                        onClick={() => { setTab('login'); setErrorMsg(''); }}
                        className={`w-1/2 pb-3 text-center border-b font-medium cursor-pointer transition-all ${tab === 'login' ? 'border-zinc-900 text-zinc-900 font-semibold' : 'border-transparent text-zinc-400'}`}
                    >
                        Masuk
                    </button>
                    <button
                        type="button"
                        onClick={() => { setTab('register'); setErrorMsg(''); }}
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
                        <button disabled={isLoading} type="submit" className="w-full bg-green-900 hover:bg-zinc-800 text-white font-medium py-2.5 rounded-lg text-xs transition-colors cursor-pointer text-center mt-2 disabled:opacity-50">
                            {isLoading ? 'Memproses...' : 'Masuk Ke Dashboard'}
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
                            <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Alamat / Komunitas</label>
                            <input
                                type="text"
                                value={alamat}
                                onChange={(e) => setAlamat(e.target.value)}
                                placeholder="Jl. Mawar No.07"
                                className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm focus:border-zinc-950 focus:outline-none bg-zinc-50/50 text-zinc-900"
                                required
                            />
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
                        {/* INPUT PASSWORD TAMBAHAN UNTUK REGISTER */}
                        <div>
                            <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Buat Kata Sandi</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimal 6 karakter"
                                className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm focus:border-zinc-950 focus:outline-none bg-zinc-50/50 text-zinc-900"
                                required
                            />
                        </div>
                        <button disabled={isLoading} type="submit" className="w-full bg-green-900 hover:bg-zinc-800 text-white font-medium py-2.5 rounded-lg text-xs transition-colors cursor-pointer text-center mt-2 disabled:opacity-50">
                            {isLoading ? 'Mendaftarkan...' : 'Selesaikan Pendaftaran'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
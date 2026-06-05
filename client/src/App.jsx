import React, { useState, useEffect } from "react"; // Tambahkan useEffect di sini
import { Plus } from "lucide-react";
import Header from "./components/Header";
import Auth from "./components/Auth";
import FeedItem from "./components/FeedItem";
import RequestModal from "./components/RequestModal";
import Footer from "./components/Footer";

const INITIAL_FEEDS = [
    {
        id: "1",
        user_id: "user_lain",
        whatsapp: "08123456789",
        nama_warung: "Warung Berkat Sembako",
        nama_barang: "Gas LPG 3kg",
        jumlah: 5,
        satuan: "Tabung",
        keterangan: "Sembako drop terlambat, konsumen nyariin. Boleh pinjam dulu jaminan aman.",
        tipe: "BUTUH_STOK",
        status: "TERSEDIA",
        created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
    {
        id: "2",
        user_id: "user_lain_2",
        whatsapp: "08987654321",
        nama_warung: "Toko Kelontong Jaya",
        nama_barang: "Es Batu Kristal",
        jumlah: 12,
        satuan: "Kantong",
        keterangan: "Kelebihan stok kiriman dari agen, freezer ga muat. Silakan tebus murah.",
        tipe: "KELEBIHAN_STOK",
        status: "TERSEDIA",
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    }
];

export default function App() {
    const [currentUser, setCurrentUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(() => {
        return localStorage.getItem("token") || null;
    });

    // Set default awal ke array kosong, nanti kita isi dari database
    const [feeds, setFeeds] = useState([]);
    const [activeFilter, setActiveFilter] = useState('SEMUA');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ==========================================
    // FUNGSI BARU: Ambil data dari Database (GET)
    // ==========================================
    const fetchFeeds = async () => {
        try {
            // Sesuaikan url endpoint GET ini dengan yang ada di server backend-mu (misal: /api/stok)
            const response = await fetch('http://127.0.0.1:5000/api/stok');
            if (!response.ok) throw new Error('Gagal mengambil data dari database.');

            const data = await response.json();
            setFeeds(data); // Simpan data dari database ke state
        } catch (error) {
            console.error("Gagal load database, beralih ke dummy:", error);
            setFeeds(INITIAL_FEEDS); // Backup jika backend belum siap / error
        }
    };

    // Jalankan fungsi fetchFeeds otomatis saat aplikasi dibuka / di-refresh
    useEffect(() => {
        if (currentUser) {
            fetchFeeds();
        }
    }, [currentUser]);

    const handleAuthSuccess = (user, userToken) => {
        setCurrentUser(user);
        setToken(userToken);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    const handleCreateFeed = async () => {
        // Setelah sukses input dari modal, langsung panggil fetchFeeds() 
        // supaya data terbaru beserta ID asli dari database langsung turun ke halaman utama
        fetchFeeds();
    };

    // Fungsi untuk handle hapus data secara permanen
    const handleDelete = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus kiriman stok ini?")) {
            try {
                const response = await fetch(`http://localhost:5000/api/stok/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    // Update state frontend agar laporannya langsung hilang dari layar
                    setFeeds(feeds.filter(feed => feed.id !== id));
                    alert("Data berhasil dihapus!");
                }
            } catch (error) {
                console.error("Gagal menghapus data:", error);
            }
        }
    };

    // Fungsi untuk handle ceklist (mengubah status menjadi SELESAI)
    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'SELESAI' ? 'TERSEDIA' : 'SELESAI';

        try {
            const response = await fetch(`http://localhost:5000/api/stok/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                // Update state frontend agar warna komponen langsung berubah secara realtime
                setFeeds(feeds.map(feed => feed.id === id ? { ...feed, status: newStatus } : feed));
            }
        } catch (error) {
            console.error("Gagal memperbarui status:", error);
        }
    };

    // ✅ KODE BARU (Bebas Spasi Gaib & Anti-Gagal)
    const filteredFeeds = feeds.filter(feed => {
        if (activeFilter === 'SEMUA') return true;
        // ?.trim() berfungsi menghapus spasi kosong di awal/akhir teks dari database jika ada
        return feed.tipe?.trim() === activeFilter;
    });

    return (
        <div className="min-h-screen bg-[#faf9f6] flex flex-col font-sans antialiased text-stone-800">
            <Header currentUser={currentUser} onLogout={handleLogout} />

            {!currentUser ? (
                <main className="flex-grow flex items-center justify-center p-4">
                    <Auth onAuthSuccess={handleAuthSuccess} />
                </main>
            ) : (
                <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div className="bg-stone-100 p-1 rounded-lg flex gap-1 w-full sm:w-auto text-xs font-medium">
                            {[
                                { key: 'SEMUA', label: 'Semua Kategori' },
                                { key: 'BUTUH_STOK', label: 'Cari Stok' },
                                { key: 'KELEBIHAN_STOK', label: 'Kelebihan' }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveFilter(tab.key)}
                                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md transition-colors cursor-pointer text-center ${activeFilter === tab.key
                                        ? "bg-white text-stone-900 border border-stone-200/50 shadow-xs font-semibold"
                                        : "text-stone-500 hover:text-stone-900"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full sm:w-auto bg-green-900 hover:bg-stone-800 text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Buat Kiriman</span>
                        </button>
                    </div>

                    {filteredFeeds.length === 0 ? (
                        <div className="text-center py-16 border border-stone-200 rounded-xl bg-white">
                            <p className="text-xs text-stone-400">Belum ada aktivitas di kategori ini.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredFeeds.map((feed) => (
                                <FeedItem
                                    key={feed.id}
                                    feed={feed}
                                    currentUser={currentUser}
                                    onToggleStatus={handleToggleStatus}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </main>
            )}

            {isModalOpen && (
                <RequestModal
                    currentUser={currentUser} // <--- PERUBAHAN: Kirim data user yang sedang login ke modal
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreateFeed}
                    isSubmitting={isSubmitting}
                />
            )}
            <Footer />
        </div>
    );
}
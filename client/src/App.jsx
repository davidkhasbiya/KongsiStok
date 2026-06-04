import React, { useState } from "react";
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
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(null);
    const [feeds, setFeeds] = useState(INITIAL_FEEDS);
    const [activeFilter, setActiveFilter] = useState('SEMUA');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAuthSuccess = (user, userToken) => {
        setCurrentUser(user);
        setToken(userToken);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setToken(null);
    };

    const handleCreateFeed = async (formData) => {
        if (!currentUser) return;
        setIsSubmitting(true);

        const newFeed = {
            id: Date.now().toString(),
            user_id: currentUser.id,
            whatsapp: currentUser.whatsapp,
            nama_warung: currentUser.nama_warung,
            nama_barang: formData.nama_barang,
            jumlah: formData.jumlah,
            satuan: formData.satuan,
            keterangan: formData.keterangan,
            tipe: formData.tipe,
            status: "TERSEDIA",
            created_at: new Date().toISOString()
        };

        setFeeds(prev => [newFeed, ...prev]);
        setIsSubmitting(false);
        setIsModalOpen(false);
    };

    const handleToggleStatus = (id, currentStatus) => {
        setFeeds(prev => prev.map(f => f.id === id ? {
            ...f,
            status: currentStatus === "TERSEDIA" ? "TERPENUHI" : "TERSEDIA"
        } : f));
    };

    const handleDelete = (id) => {
        setFeeds(prev => prev.filter(f => f.id !== id));
    };

    const filteredFeeds = feeds.filter(feed => {
        if (activeFilter === 'SEMUA') return true;
        return feed.tipe === activeFilter;
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
                                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md transition-colors cursor-pointer text-center ${
                                        activeFilter === tab.key
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
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreateFeed}
                    isSubmitting={isSubmitting}
                />
            )}
            <Footer />
        </div>
    );
}
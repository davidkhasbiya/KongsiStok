import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import Header from "./components/Header";
import Auth from "./components/Auth";
import FeedItem from "./components/FeedItem";
import RequestModal from "./components/RequestModal";
import Footer from "./components/Footer";

export default function App() {
    const [currentUser, setCurrentUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(() => {
        return localStorage.getItem("token") || null;
    });

    const [feeds, setFeeds] = useState([]);
    const [activeFilter, setActiveFilter] = useState('SEMUA');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. PERBAIKAN: Menambahkan Authorization Header untuk mengambil data stok
    const fetchFeeds = async () => {
        if (!currentUser || !currentUser.komunitas) return;

        try {
            const komunitasUser = currentUser.komunitas;

            const response = await fetch(`/api/stok?komunitas=${encodeURIComponent(komunitasUser)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` // 🛡️ Kirim token agar diizinkan melihat data
                }
            });
            const data = await response.json();

            setFeeds(data);
        } catch (error) {
            console.error("Gagal memuat data stok:", error);
        }
    };

    // useEffect untuk Polling (Auto-Refresh setiap 10 detik)
    useEffect(() => {
        if (currentUser && currentUser.komunitas) {
            fetchFeeds();

            const intervalId = setInterval(() => {
                fetchFeeds();
            }, 10000);

            return () => {
                clearInterval(intervalId);
            };
        } else {
            setFeeds([]);
        }
    }, [currentUser, token]); // Ditambahkan 'token' sebagai dependency agar sinkron saat login ulang

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
        fetchFeeds();
    };

    // 2. PERBAIKAN: Menambahkan Authorization Header untuk menghapus data stok
    const handleDelete = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus kiriman stok ini?")) {
            try {
                const response = await fetch(`/api/stok/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}` // 🛡️ Kirim token agar diizinkan menghapus
                    }
                });

                if (response.ok) {
                    setFeeds(feeds.filter(feed => feed.id !== id));
                    alert("Data berhasil dihapus!");
                } else {
                    const data = await response.json();
                    alert(data.error || "Gagal menghapus data.");
                }
            } catch (error) {
                console.error("Gagal menghapus data:", error);
            }
        }
    };

    // 3. PERBAIKAN: Menambahkan Authorization Header untuk mengubah status stok
    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'SELESAI' ? 'TERSEDIA' : 'SELESAI';

        try {
            const response = await fetch(`/api/stok/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // 🛡️ Kirim token agar diizinkan mengubah status
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                setFeeds(feeds.map(feed => feed.id === id ? { ...feed, status: newStatus } : feed));
            } else {
                const data = await response.json();
                alert(data.error || "Gagal memperbarui status.");
            }
        } catch (error) {
            console.error("Gagal memperbarui status:", error);
        }
    };

    const filteredFeeds = feeds.filter(feed => {
        if (activeFilter === 'SEMUA') return true;
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
                    currentUser={currentUser}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreateFeed}
                    isSubmitting={isSubmitting}
                />
            )}
            <Footer />
        </div>
    );
}
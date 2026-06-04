import React from "react";
import { MessageCircle, Trash2, CheckCircle2, Clock } from "lucide-react";

export default function FeedItem({ feed, currentUser, onToggleStatus, onDelete }) {
    const isOwner = currentUser?.id === feed.user_id;
    const isButuhStok = feed.tipe === "BUTUH_STOK";

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col justify-between hover:border-stone-300 transition-colors">
            <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm ${
                        isButuhStok ? "bg-amber-50 text-amber-800" : "bg-indigo-50 text-indigo-800"
                    }`}>
                        {isButuhStok ? "Cari Stok" : "Kelebihan Stok"}
                    </span>
                    <span className={`text-[10px] font-medium ${
                        feed.status === "TERSEDIA" ? "text-emerald-600" : "text-stone-400 font-normal"
                    }`}>
                        {feed.status === "TERSEDIA" ? "● Aktif" : "Selesai"}
                    </span>
                </div>

                <h3 className="font-bold text-stone-900 text-sm mb-1">{feed.nama_barang}</h3>
                <p className="text-xs text-stone-500 mb-3">
                    {feed.jumlah} {feed.satuan} · <span className="font-medium text-stone-700">{feed.nama_warung}</span>
                </p>
                
                <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-100">
                    {feed.keterangan}
                </p>
            </div>

            <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-[10px] text-stone-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(feed.created_at)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                    {isOwner ? (
                        <>
                            <button
                                onClick={() => onToggleStatus(feed.id, feed.status)}
                                className={`p-1.5 rounded-md hover:bg-stone-100 transition-colors cursor-pointer ${
                                    feed.status === "TERPENUHI" ? "text-emerald-600" : "text-stone-400"
                                }`}
                                title="Ubah Status"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDelete(feed.id)}
                                className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
                                title="Hapus"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <a
                            href={`https://wa.me/${feed.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-900 hover:bg-stone-800 text-white text-[11px] font-medium rounded-lg transition-colors"
                        >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Hubungi</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
import React, { useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';

export default function RequestModal({ onClose, onSubmit, isSubmitting }) {
  const [tipe, setTipe] = useState('BUTUH_STOK');
  const [namaBarang, setNamaBarang] = useState('');
  const [jumlah, setJumlah] = useState(1);
  const [satuan, setSatuan] = useState('Pcs');
  const [keterangan, setKeterangan] = useState('');

  // Fitur AI dengan UI bersih
  const [aiText, setAiText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiParse = async () => {
    if (!aiText.trim()) return alert("Ketik cerita kendala stok warungmu terlebih dahulu!");
    setIsAiLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/ai/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: aiText })
      });

      if (!response.ok) {
        throw new Error('Gagal merespon dari server backend.');
      }

      const data = await response.json()
      setNamaBarang(data.nama_barang || '')
      setJumlah(data.jumlah || 1)
      setSatuan(data.satuan || 'Pcs')
    } catch (error) {
      console.error(error);
      alert("Waduh, koneksi ke AI terganggu. Silakan isi manual dulu sementara waktu.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!namaBarang.trim()) return;

    onSubmit({
      tipe,
      nama_barang: namaBarang,
      jumlah,
      satuan,
      keterangan
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white border border-stone-200 rounded-xl w-full max-w-md shadow-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-150">
          <h2 className="text-sm font-bold text-stone-900">
            {tipe === 'BUTUH_STOK' ? 'Buat Cari Bantuan Stok' : 'Laporkan Kelebihan Stok'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs">

          {/* 1. KOTAK INPUT AI (Desain Simpel & Flat) */}
          <div className="bg-stone-50 border border-stone-200 p-3 rounded-lg flex flex-col gap-2">
            <label className="block font-bold text-stone-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-stone-600" />
              <span>Isi Otomatis Pakai Cerita (AI)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                placeholder="Contoh: telur lagi habis nih butuh 5 kg..."
                className="flex-1 border border-stone-200 rounded-md p-2 bg-white text-stone-900 focus:outline-none focus:border-stone-400 text-xs"
              />
              <button
                type="button"
                onClick={handleAiParse}
                disabled={isAiLoading}
                className="bg-stone-900 hover:bg-stone-800 text-white px-3 rounded-md font-medium transition-colors text-xs shrink-0 cursor-pointer"
              >
                {isAiLoading ? 'Membaca...' : 'Urai'}
              </button>
            </div>
          </div>

          <div className="border-t border-dashed border-stone-200 my-1"></div>

          {/* Tipe Selector Tab */}
          <div className="flex bg-stone-100 p-1 rounded-lg gap-1">
            <button
              type="button"
              onClick={() => setTipe('BUTUH_STOK')}
              className={`flex-1 py-1.5 rounded-md font-medium text-center transition-colors cursor-pointer ${tipe === 'BUTUH_STOK'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-900'
                }`}
            >
              Cari Bantuan
            </button>
            <button
              type="button"
              onClick={() => setTipe('KELEBIHAN_STOK')}
              className={`flex-1 py-1.5 rounded-md font-medium text-center transition-colors cursor-pointer ${tipe === 'KELEBIHAN_STOK'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-900'
                }`}
            >
              Kelebihan Stok
            </button>
          </div>

          {/* Nama Barang */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Nama Barang</label>
            <input
              type="text"
              value={namaBarang}
              onChange={(e) => setNamaBarang(e.target.value)}
              placeholder="Gas LPG 3kg, Es Batu, dll."
              className="w-full border border-stone-200 rounded-lg p-2.5 bg-white text-stone-900 focus:outline-none focus:border-stone-400 transition-colors"
              required
            />
          </div>

          {/* Jumlah & Satuan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Jumlah</label>
              <input
                type="number"
                min="1"
                value={jumlah}
                onChange={(e) => setJumlah(parseInt(e.target.value) || 1)}
                className="w-full border border-stone-200 rounded-lg p-2.5 bg-white text-stone-900 focus:outline-none focus:border-stone-400 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Satuan</label>
              <input
                type="text"
                value={satuan}
                onChange={(e) => setSatuan(e.target.value)}
                placeholder="Tabung, Kg, Pcs"
                className="w-full border border-stone-200 rounded-lg p-2.5 bg-white text-stone-900 focus:outline-none focus:border-stone-400 transition-colors"
                required
              />
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Keterangan Tambahan</label>
            <textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Detail singkat (misal: jaminan aman, bisa barter)"
              className="w-full border border-stone-200 rounded-lg p-2.5 bg-white text-stone-900 focus:outline-none focus:border-stone-400 transition-colors h-16 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-2.5 pt-2 border-t border-stone-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 border border-stone-200 text-stone-600 py-2.5 rounded-lg font-medium hover:bg-stone-50 transition-colors cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-stone-950 hover:bg-stone-800 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Mengirim...' : 'Kirim'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
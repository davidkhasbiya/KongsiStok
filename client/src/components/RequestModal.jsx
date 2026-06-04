import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

export default function RequestModal({ onClose, onSubmit, isSubmitting }) {
  const [tipe, setTipe] = useState('BUTUH_STOK');
  const [namaBarang, setNamaBarang] = useState('');
  const [jumlah, setJumlah] = useState(1);
  const [satuan, setSatuan] = useState('Pcs');
  const [keterangan, setKeterangan] = useState('');

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
          
          {/* Tipe Selector Tab */}
          <div className="flex bg-stone-100 p-1 rounded-lg gap-1">
            <button
              type="button"
              onClick={() => setTipe('BUTUH_STOK')}
              className={`flex-1 py-1.5 rounded-md font-medium text-center transition-colors cursor-pointer ${
                tipe === 'BUTUH_STOK' 
                  ? 'bg-white text-stone-900 shadow-xs font-semibold' 
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Cari Bantuan
            </button>
            <button
              type="button"
              onClick={() => setTipe('KELEBIHAN_STOK')}
              className={`flex-1 py-1.5 rounded-md font-medium text-center transition-colors cursor-pointer ${
                tipe === 'KELEBIHAN_STOK' 
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
              placeholder="Contoh: Gas LPG 3kg, Es Batu Kristal"
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
                placeholder="Contoh: Tabung, Kantong, Pcs"
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
              placeholder="Beri detail singkat (misal: jaminan aman, bisa barter, tebus murah agen)"
              className="w-full border border-stone-200 rounded-lg p-2.5 bg-white text-stone-900 focus:outline-none focus:border-stone-400 transition-colors h-20 resize-none"
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
              className="flex-1 bg-green-900 hover:bg-stone-800 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
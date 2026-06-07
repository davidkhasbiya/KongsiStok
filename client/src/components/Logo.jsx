import React from 'react';

export default function Logo({ className = "w-8 h-8", variant = "default" }) {
    // Menyesuaikan warna dengan tema hijau tua di dashboard-mu
    const primaryGreen = "#14532d"; // Emerald/Green 900 khas KongsiStok
    const secondaryGreen = "#22c55e"; // Hijau muda sebagai aksen status/aktif

    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Kotak Pertama (Warung A / Pemberi) */}
            <path
                d="M3 9L12 4L17 6.78M3 9V17L12 21V13.5"
                stroke={variant === "white" ? "#ffffff" : primaryGreen}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Kotak Kedua yang Saling Mengunci (Warung B / Penerima) */}
            <path
                d="M21 15V7L12 3V10.5M21 15L12 20L7 17.22"
                stroke={variant === "white" ? "#A7F3D0" : secondaryGreen}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.5 0.5" /* Efek dinamis modern */
            />
            {/* Titik Tengah Solidaritas (Pusat Koordinasi) */}
            <circle
                cx="12"
                cy="12"
                r="1.5"
                fill={variant === "white" ? "#ffffff" : primaryGreen}
            />
        </svg>
    );
}
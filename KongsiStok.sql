CREATE DATABASE KongsiStok

USE KongsiStok
GO

CREATE TABLE users(
	id INT IDENTITY(1,1) PRIMARY KEY,
	nama_warung VARCHAR(100) NOT NULL,
	komunitas VARCHAR(50) NOT NULL,
    no_wa VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Tempat password terenkripsi
    created_at DATETIME DEFAULT GETDATE()
)

SELECT * FROM users

CREATE TABLE stok_requests(
	id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE, -- Siapa yang minta
    nama_barang VARCHAR(100) NOT NULL,
    jumlah INT NOT NULL CHECK (jumlah > 0),
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING' atau 'TERBANTU'
    penolong_id INT FOREIGN KEY REFERENCES users(id), -- Siapa yang bantu (bisa kosong)
    created_at DATETIME DEFAULT GETDATE()
)

SELECT * FROM stok_requests
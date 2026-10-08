import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';

function AdminAddProduct() {
    const navigate = useNavigate();
    const fileInputs = [useRef(null), useRef(null), useRef(null)];

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        category: '',
        description: '',
        material: '',
        sizes: '',
        weight: ''
    });

    const [images, setImages] = useState(['', '', '']);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (index, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const scaleSize = MAX_WIDTH / img.width;

                if (img.width > MAX_WIDTH) {
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                } else {
                    canvas.width = img.width;
                    canvas.height = img.height;
                }

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                const updatedImages = [...images];
                updatedImages[index] = compressedBase64;
                setImages(updatedImages);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = (index) => {
        const updatedImages = [...images];
        updatedImages[index] = '';
        setImages(updatedImages);
        if (fileInputs[index].current) {
            fileInputs[index].current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validImages = images.filter(img => img !== '');

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price),
                    stock: Number(formData.stock),
                    image: validImages[0] || '',
                    images: validImages
                })
            });

            if (res.ok) {
                alert('Produk berhasil ditambahkan!');
                navigate('/admin/products');
            } else {
                const errData = await res.json();
                alert(`Gagal menambahkan produk: ${errData.error || res.statusText}`);
            }
        } catch (err) {
            alert('Gagal terhubung ke server');
        }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-content">
                <div className="breadcrumb-admin">
                    <Link to="/admin/products">Produk</Link> / <span>Tambah Produk</span>
                </div>
                <h1 className="admin-page-title">Tambah Produk</h1>

                <div className="add-product-card">
                    <div className="photo-slots-wrapper">
                        <label className="slot-title">Foto Produk (Maks. 3 Foto)</label>
                        <div className="photo-slots-grid">
                            {[0, 1, 2].map((idx) => (
                                <div key={idx} className="photo-slot">
                                    <div
                                        className="photo-slot-box"
                                        onClick={() => fileInputs[idx].current.click()}
                                    >
                                        {images[idx] ? (
                                            <img src={images[idx]} alt={`Preview ${idx + 1}`} className="preview-img" />
                                        ) : (
                                            <div className="photo-placeholder-text">
                                                <span>🖼️</span>
                                                <small>{idx === 0 ? 'Foto Utama' : `Foto ${idx + 1}`}</small>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/jpeg, image/jpg, image/png, image/webp"
                                        ref={fileInputs[idx]}
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleImageChange(idx, e)}
                                    />
                                    {images[idx] && (
                                        <button
                                            type="button"
                                            className="btn-remove-slot-photo"
                                            onClick={() => handleRemoveImage(idx)}
                                        >
                                            Hapus
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <form className="add-product-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Nama produk</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Contoh: Kaos Polos Premium"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label>Harga (Rp)</label>
                                <input
                                    type="number"
                                    name="price"
                                    placeholder="0"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group flex-1">
                                <label>Stok</label>
                                <input
                                    type="number"
                                    name="stock"
                                    placeholder="0"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Kategori</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Pilih kategori</option>
                                <option value="Pakaian">Pakaian</option>
                                <option value="Sepatu">Sepatu</option>
                                <option value="Tas">Tas</option>
                                <option value="Elektronik">Elektronik</option>
                                <option value="Aksesori">Aksesori</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label>Bahan</label>
                                <input
                                    type="text"
                                    name="material"
                                    placeholder="Contoh: Katun combed 30s"
                                    value={formData.material}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group flex-1">
                                <label>Ukuran</label>
                                <input
                                    type="text"
                                    name="sizes"
                                    placeholder="Contoh: S, M, L, XL"
                                    value={formData.sizes}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group flex-1">
                                <label>Berat</label>
                                <input
                                    type="text"
                                    name="weight"
                                    placeholder="Contoh: 200 gram"
                                    value={formData.weight}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Deskripsi</label>
                            <textarea
                                name="description"
                                rows="4"
                                placeholder="Deskripsi lengkap produk..."
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-buttons">
                            <button type="submit" className="btn-submit-save">Simpan</button>
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() => navigate('/admin/products')}
                            >
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default AdminAddProduct;
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function TokokuDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedImg, setSelectedImg] = useState('');
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetch(`/api/products/${id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                const allList = (data.images && data.images.length > 0) ? data.images : [data.image];
                const validFirst = allList.find(img => Boolean(img)) || '';
                setSelectedImg(validFirst);
            })
            .catch(err => console.error(err));
    }, [id]);

    const handleAddToCart = async () => {
        if (!product) return;
        setLoading(true);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product._id,
                    productName: product.name,
                    price: Number(product.price),
                    quantity: qty,
                    totalPrice: Number(product.price) * qty
                })
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 2000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!product) {
        return (
            <div className="page-container">
                <p>Memuat produk... <Link to="/">Kembali</Link></p>
            </div>
        );
    }

    const imageList = (product.images && product.images.length > 0)
        ? product.images.filter(Boolean)
        : [product.image].filter(Boolean);

    return (
        <div className="page-container">
            <nav className="breadcrumb">
                <Link to="/">Beranda</Link> / <span>{product.category}</span> / <span>{product.name}</span>
            </nav>

            <div className="detail-container">
                <div className="gallery-section">
                    <div className="main-image-placeholder">
                        {selectedImg ? (
                            <img
                                src={selectedImg}
                                alt={product.name}
                                className="product-detail-img"
                            />
                        ) : (
                            <span>🖼️</span>
                        )}
                    </div>

                    {imageList.length > 0 && (
                        <div className="thumbnail-gallery-row">
                            {imageList.map((imgSrc, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setSelectedImg(imgSrc)}
                                    className={`thumbnail-box ${selectedImg === imgSrc ? 'active' : ''}`}
                                >
                                    <img src={imgSrc} alt={`Thumbnail ${i + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="info-section">
                    <span className="kategori-sub">Kategori: {product.category}</span>
                    <h1 className="product-title">{product.name}</h1>
                    <h2 className="product-price">Rp {Number(product.price).toLocaleString('id-ID')}</h2>
                    <p className="stock-info">Stok tersedia: {product.stock} unit</p>
                    <p className="description">{product.description || 'Tidak ada deskripsi.'}</p>

                    {(product.material || product.sizes || product.weight) && (
                        <div className="specs-card">
                            {product.material && <p><strong>Bahan:</strong> {product.material}</p>}
                            {product.sizes && <p><strong>Ukuran:</strong> {product.sizes}</p>}
                            {product.weight && <p><strong>Berat:</strong> {product.weight}</p>}
                        </div>
                    )}

                    <div className="action-row">
                        <input
                            type="number"
                            min="1"
                            value={qty}
                            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                            className="qty-input"
                        />
                        <button
                            className="btn-cart"
                            onClick={handleAddToCart}
                            disabled={loading}
                        >
                            {loading ? 'Memproses...' : success ? '✓ Berhasil Ditambahkan' : 'Tambah ke Keranjang'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TokokuDetail;
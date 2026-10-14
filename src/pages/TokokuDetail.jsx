import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function TokokuDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { customer, isLoggedIn } = useAuth();

    const [product, setProduct] = useState(null);
    const [fetchingProduct, setFetchingProduct] = useState(true);
    const [selectedImg, setSelectedImg] = useState('');
    const [qty, setQty] = useState(1);
    const [cartLoading, setCartLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        setFetchingProduct(true);
        fetch(`/st/products/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data && data._id) {
                    setProduct(data);
                    const allList = (data.images && data.images.length > 0) ? data.images : [data.image];
                    const validFirst = allList.find(img => Boolean(img)) || '';
                    setSelectedImg(validFirst);
                } else {
                    setProduct(null);
                }
            })
            .catch(err => {
                console.error(err);
                setProduct(null);
            })
            .finally(() => {
                setFetchingProduct(false);
            });
    }, [id]);

    const handleAddToCart = async () => {
        if (!product) return;

        // Validasi: jika belum login, harus login dulu
        if (!isLoggedIn) {
            setShowLoginModal(true);
            return;
        }

        setCartLoading(true);

        try {
            const res = await fetch('/st/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product._id,
                    productName: product.name,
                    price: Number(product.price),
                    quantity: qty,
                    totalPrice: Number(product.price) * qty,
                    userId: customer?.id || customer?._id || null,
                    customerName: customer?.name || '',
                    customerEmail: customer?.email || ''
                })
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 2500);
            } else {
                const errData = await res.json().catch(() => ({}));
                alert('Gagal membuat pesanan: ' + (errData.error || errData.message || 'Silakan coba lagi.'));
            }
        } catch (err) {
            console.error(err);
            alert('Gagal terhubung ke server.');
        } finally {
            setCartLoading(false);
        }
    };

    // Tampilan Skeleton saat halaman detail sedang memuat data
    if (fetchingProduct) {
        return (
            <div className="page-container">
                <nav className="breadcrumb">
                    <span style={{ color: '#ccc' }}>Beranda / Memuat...</span>
                </nav>

                <div className="skeleton-detail-container">
                    <div className="skeleton-gallery">
                        <div className="skeleton-main-img skeleton-shimmer" />
                        <div className="skeleton-thumbs-row">
                            <div className="skeleton-thumb skeleton-shimmer" />
                            <div className="skeleton-thumb skeleton-shimmer" />
                            <div className="skeleton-thumb skeleton-shimmer" />
                        </div>
                    </div>

                    <div className="skeleton-info-col">
                        <div className="skeleton-sub skeleton-shimmer" />
                        <div className="skeleton-head skeleton-shimmer" />
                        <div className="skeleton-price-large skeleton-shimmer" />
                        <div className="skeleton-stock skeleton-shimmer" />
                        <div className="skeleton-desc-lines">
                            <div className="skeleton-desc-line skeleton-shimmer" style={{ width: '100%' }} />
                            <div className="skeleton-desc-line skeleton-shimmer" style={{ width: '90%' }} />
                            <div className="skeleton-desc-line skeleton-shimmer" style={{ width: '70%' }} />
                        </div>
                        <div className="skeleton-specs-card">
                            <div className="skeleton-specs-line skeleton-shimmer" />
                            <div className="skeleton-specs-line skeleton-shimmer" style={{ width: '45%' }} />
                        </div>
                        <div className="skeleton-btn-row">
                            <div className="skeleton-qty-box skeleton-shimmer" />
                            <div className="skeleton-btn-cart skeleton-shimmer" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <h3 style={{ marginBottom: '12px', color: '#444' }}>Produk Tidak Ditemukan</h3>
                <p style={{ color: '#777', marginBottom: '20px' }}>Produk mungkin telah dihapus atau URL tidak valid.</p>
                <Link to="/" style={{ padding: '10px 20px', background: '#03ac0e', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                    Kembali ke Beranda
                </Link>
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
                            className={`btn-cart ${!isLoggedIn ? 'btn-cart-locked' : ''}`}
                            onClick={handleAddToCart}
                            disabled={cartLoading}
                        >
                            {cartLoading
                                ? 'Memproses...'
                                : success
                                    ? '✓ Berhasil Ditambahkan'
                                    : isLoggedIn
                                        ? 'Tambah ke Keranjang'
                                        : '🔒 Login untuk Memesan'}
                        </button>
                    </div>

                    {!isLoggedIn ? (
                        <div className="login-order-notice">
                            <span>🔒 <strong>Harap login terlebih dahulu.</strong> Anda harus masuk akun TokoKu untuk memesan produk ini.</span>
                            <div className="login-notice-links">
                                <Link to={`/login?redirect=${encodeURIComponent(`/produk/${id}`)}`}>Masuk</Link>
                                <span> atau </span>
                                <Link to={`/register?redirect=${encodeURIComponent(`/produk/${id}`)}`}>Daftar Akun</Link>
                            </div>
                        </div>
                    ) : (
                        <div className="logged-in-buyer-notice">
                            <span>✓ Memesan sebagai: <strong>{customer?.name}</strong> ({customer?.email})</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Popup jika pengguna mengklik pesan sebelum login */}
            {showLoginModal && (
                <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Login Diperlukan</h3>
                            <button
                                className="modal-close-btn"
                                onClick={() => setShowLoginModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-icon-badge">🔒</div>
                            <h4>Silakan Masuk Terlebih Dahulu</h4>
                            <p>
                                Untuk melakukan pemesanan produk <strong>{product.name}</strong>, Anda harus masuk dengan akun pelanggan TokoKu.
                            </p>
                            <div className="modal-btn-group">
                                <button
                                    className="btn-modal-primary"
                                    onClick={() => navigate(`/login?redirect=${encodeURIComponent(`/produk/${id}`)}`)}
                                >
                                    Masuk Sekarang
                                </button>
                                <button
                                    className="btn-modal-secondary"
                                    onClick={() => navigate(`/register?redirect=${encodeURIComponent(`/produk/${id}`)}`)}
                                >
                                    Daftar Akun Baru
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TokokuDetail;
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function Tokoku() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const searchQuery = searchParams.get('q') || '';

    useEffect(() => {
        setLoading(true);
        fetch('/st/products')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setProducts(data);
                } else {
                    setProducts([]);
                }
            })
            .catch(err => {
                console.error(err);
                setProducts([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const categories = ['Semua', 'Pakaian', 'Sepatu', 'Tas', 'Elektronik', 'Aksesori'];

    // Filter kategori dan nama produk sekaligus
    const filteredProducts = Array.isArray(products)
        ? products.filter(product => {
            const matchesCategory = selectedCategory === 'Semua' ||
                product.category?.toLowerCase() === selectedCategory.toLowerCase();
            const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        })
        : [];

    return (
        <div className="page-container">
            <div className="banner">
                <h2>Belanja kebutuhan harian, lebih mudah</h2>
                <p>Banner promo / pengumuman toko</p>
            </div>

            <div className="category-list">
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <h3 className="section-title">
                {searchQuery ? `Hasil pencarian: "${searchQuery}"` : 'Semua Produk'}
            </h3>

            <div className="product-grid">
                {loading ? (
                    // Skeleton Cards saat memuat data
                    Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="skeleton-card">
                            <div className="skeleton-img skeleton-shimmer" />
                            <div className="skeleton-info">
                                <div className="skeleton-title skeleton-shimmer" />
                                <div className="skeleton-price skeleton-shimmer" />
                                <div className="skeleton-tag skeleton-shimmer" />
                            </div>
                        </div>
                    ))
                ) : filteredProducts.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
                        Produk tidak ditemukan.
                    </div>
                ) : (
                    filteredProducts.map(product => (
                        <div
                            key={product._id}
                            className="product-card"
                            onClick={() => navigate(`/produk/${product._id}`)}
                        >
                            <div className="card-image-placeholder">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="product-card-img" />
                                ) : (
                                    <span>🖼️</span>
                                )}
                            </div>
                            <div className="card-info">
                                <h4>{product.name}</h4>
                                <p className="price">Rp {Number(product.price).toLocaleString('id-ID')}</p>
                                <span className="category-tag">{product.category}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Tokoku;
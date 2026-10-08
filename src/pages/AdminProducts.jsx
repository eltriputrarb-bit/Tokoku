import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus produk ini?')) return;
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(products.filter(p => p._id !== id));
            } else {
                alert('Gagal menghapus produk');
            }
        } catch (err) {
            alert('Gagal terhubung ke server');
        }
    };

    const totalProduk = products.length;
    const totalStok = products.reduce((acc, p) => acc + Number(p.stock || 0), 0);
    const stokMenipis = products.filter(p => Number(p.stock) < 10).length;

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-content">
                <div className="admin-header-row">
                    <h1>Kelola Produk</h1>
                    <button className="btn-admin-add" onClick={() => navigate('/admin/products/add')}>
                        + Tambah Produk
                    </button>
                </div>

                <div className="stat-grid">
                    <div className="stat-card">
                        <span>Total produk</span>
                        <h2>{totalProduk}</h2>
                    </div>
                    <div className="stat-card">
                        <span>Total stok</span>
                        <h2>{totalStok}</h2>
                    </div>
                    <div className="stat-card">
                        <span>Stok menipis</span>
                        <h2 className="text-warning">{stokMenipis}</h2>
                    </div>
                </div>

                <div className="table-card">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>PRODUK</th>
                                <th>KATEGORI</th>
                                <th>HARGA</th>
                                <th>STOK</th>
                                <th>AKSI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>
                                        Belum ada data produk di database.
                                    </td>
                                </tr>
                            ) : (
                                products.map((item) => (
                                    <tr key={item._id}>
                                        <td>
                                            <div className="table-product-info">
                                                <div className="table-thumb">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                                                    ) : (
                                                        <span>🖼️</span>
                                                    )}
                                                </div>
                                                <strong>{item.name}</strong>
                                            </div>
                                        </td>
                                        <td>{item.category}</td>
                                        <td>Rp {Number(item.price).toLocaleString('id-ID')}</td>
                                        <td>{item.stock}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    type="button"
                                                    className="btn-table-del"
                                                    style={{ backgroundColor: '#f3f4f6', color: '#111', borderColor: '#d1d5db' }}
                                                    onClick={() => navigate(`/admin/products/edit/${item._id}`)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-table-del"
                                                    onClick={() => handleDelete(item._id)}
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

export default AdminProducts;
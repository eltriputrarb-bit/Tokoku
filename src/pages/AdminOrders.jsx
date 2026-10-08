import { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar.jsx';

function AdminOrders() {
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleDeleteOrder = async (id) => {
        if (!window.confirm('Yakin ingin menghapus pesanan ini?')) return;

        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setOrders(orders.filter(order => order._id !== id));
            } else {
                alert('Gagal menghapus pesanan');
            }
        } catch (err) {
            alert('Gagal terhubung ke server');
        }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-content">
                <div className="admin-header-row">
                    <h1>Daftar Pesanan Masuk</h1>
                </div>

                <div className="table-card">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>NAMA PRODUK</th>
                                <th>JUMLAH</th>
                                <th>TOTAL HARGA</th>
                                <th>STATUS</th>
                                <th>TANGGAL</th>
                                <th>AKSI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>
                                        Belum ada pesanan masuk.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id}>
                                        <td><strong>{order.productName}</strong></td>
                                        <td>{order.quantity} pcs</td>
                                        <td>Rp {Number(order.totalPrice).toLocaleString('id-ID')}</td>
                                        <td><span className="order-badge">{order.status}</span></td>
                                        <td>{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                                        <td>
                                            <button
                                                className="btn-table-del"
                                                onClick={() => handleDeleteOrder(order._id)}
                                            >
                                                Hapus
                                            </button>
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

export default AdminOrders;
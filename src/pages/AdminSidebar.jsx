import { NavLink, useNavigate } from 'react-router-dom';

function AdminSidebar() {
    const navigate = useNavigate();

    return (
        <aside className="admin-sidebar">
            <div className="admin-brand">
                <h2>TokoKu</h2>
                <span>Admin</span>
            </div>
            <nav className="admin-nav">
                <NavLink
                    to="/admin/products"
                    className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                >
                    Produk
                </NavLink>
                <NavLink
                    to="/admin/orders"
                    className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                >
                    Pesanan
                </NavLink>
            </nav>
            <button className="btn-logout" onClick={() => navigate('/')}>
                Keluar Toko
            </button>
        </aside>
    );
}

export default AdminSidebar;
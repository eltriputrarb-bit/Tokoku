import { NavLink, useNavigate } from 'react-router-dom';

function AdminSidebar() {
    const navigate = useNavigate();

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-header">
                <div className="admin-brand">
                    <h2>TokoKu</h2>
                    <span>Admin</span>
                </div>
                <button className="btn-logout btn-logout-mobile" onClick={() => navigate('/')}>
                    Keluar
                </button>
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
            <button className="btn-logout btn-logout-desktop" onClick={() => navigate('/')}>
                Keluar Toko
            </button>
        </aside>
    );
}

export default AdminSidebar;
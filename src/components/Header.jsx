import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { customer, isLoggedIn, logoutCustomer } = useAuth();
    const currentQuery = searchParams.get('q') || '';

    const handleSearchChange = (e) => {
        const query = e.target.value;
        if (query) {
            navigate(`/?q=${encodeURIComponent(query)}`);
        } else {
            navigate('/');
        }
    };

    const handleLogout = () => {
        if (window.confirm('Apakah Anda yakin ingin keluar?')) {
            logoutCustomer();
            navigate('/');
        }
    };

    return (
        <header className="header">
            <div className="header-inner">
                <Link to="/" className="brand-logo">TokoKu</Link>
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Cari di TokoKu..."
                        value={currentQuery}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="header-actions">
                    {isLoggedIn ? (
                        <div className="customer-info-box">
                            <span className="customer-name" title={customer?.email}>
                                👤 {customer?.name}
                            </span>
                            <button
                                className="btn-header-outline"
                                onClick={handleLogout}
                                title="Keluar akun"
                            >
                                Keluar
                            </button>
                        </div>
                    ) : (
                        <div className="customer-auth-btns">
                            <button
                                className="btn-header-outline"
                                onClick={() => navigate('/login')}
                            >
                                Masuk
                            </button>
                            <button
                                className="btn-header-register"
                                onClick={() => navigate('/register')}
                            >
                                Daftar
                            </button>
                        </div>
                    )}
                    <button className="btn-admin" onClick={() => navigate('/admin')}>
                        Login Admin
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;
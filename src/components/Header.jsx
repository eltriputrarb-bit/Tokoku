import { Link, useNavigate, useSearchParams } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentQuery = searchParams.get('q') || '';

    const handleSearchChange = (e) => {
        const query = e.target.value;
        if (query) {
            navigate(`/?q=${encodeURIComponent(query)}`);
        } else {
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
                <button className="btn-admin" onClick={() => navigate('/admin')}>
                    Login Admin
                </button>
            </div>
        </header>
    );
}

export default Header;
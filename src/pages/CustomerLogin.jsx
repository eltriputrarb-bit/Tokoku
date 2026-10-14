import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function CustomerLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/';
    const { loginCustomer } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password) {
            setError('Email dan password wajib diisi.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/st/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Email atau password salah.');
                return;
            }

            if (data.user) {
                loginCustomer(data.user);
            }

            navigate(redirectUrl);
        } catch (err) {
            console.error(err);
            setError('Terjadi kesalahan koneksi ke server. Pastikan server aktif.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <h2>Masuk ke TokoKu</h2>
                <p className="login-subtitle">
                    Masuk ke akun Anda untuk memesan produk favorit dan melacak pesanan.
                </p>

                {error && (
                    <div className="auth-alert error">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="nama@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-submit-login"
                        disabled={loading}
                    >
                        {loading ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>

                <div className="auth-switch-links">
                    <p>
                        Belum punya akun?{' '}
                        <Link to={redirectUrl !== '/' ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : '/register'}>
                            Daftar Sekarang
                        </Link>
                    </p>
                    <div style={{ marginTop: '14px' }}>
                        <Link to="/" style={{ color: '#666', fontSize: '13px', textDecoration: 'none' }}>
                            ← Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomerLogin;

import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/';
    const { loginCustomer } = useAuth();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Nama lengkap wajib diisi.');
            return;
        }

        if (!email.trim()) {
            setError('Email wajib diisi.');
            return;
        }

        if (password.length < 6) {
            setError('Password minimal harus 6 karakter.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Konfirmasi password tidak cocok.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/st/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    password: password
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Gagal mendaftar akun.');
                return;
            }

            // Langsung login otomatis setelah berhasil registrasi
            if (data.user) {
                loginCustomer(data.user);
            }

            alert('Pendaftaran berhasil! Selamat datang di TokoKu, ' + data.user.name);
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
                <h2>Daftar Akun Baru</h2>
                <p className="login-subtitle">
                    Buat akun TokoKu untuk memesan produk dan menikmati kemudahan berbelanja.
                </p>

                {error && (
                    <div className="auth-alert error">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label>Nama Lengkap</label>
                        <input
                            type="text"
                            placeholder="Contoh: Budi Santoso"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

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
                        <label>Nomor HP / WhatsApp <span style={{ color: '#888', fontWeight: 'normal' }}>(Opsional)</span></label>
                        <input
                            type="tel"
                            placeholder="081234567890"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Minimal 6 karakter"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Konfirmasi Password</label>
                        <input
                            type="password"
                            placeholder="Ulangi password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-submit-login"
                        disabled={loading}
                    >
                        {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                    </button>
                </form>

                <div className="auth-switch-links">
                    <p>
                        Sudah punya akun?{' '}
                        <Link to={redirectUrl !== '/' ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}>
                            Masuk di sini
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

export default Register;

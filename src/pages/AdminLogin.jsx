import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Validasi sederhana
        if (username === 'admin' && password === 'admin') {
            alert('Login berhasil!');
            // Ganti baris navigate('/') menjadi:
            navigate('/admin/products');
        } else {
            alert('Username atau password salah! (Coba: admin / admin)');
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <h2>Login Admin</h2>
                <p className="login-subtitle">Masuk untuk mengelola produk toko.</p>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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

                    <button type="submit" className="btn-submit-login">
                        Masuk
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;
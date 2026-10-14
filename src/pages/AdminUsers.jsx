import { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar.jsx';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('Semua');

    // State untuk Modal Tambah / Edit
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);

    // State Form
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'customer'
    });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/st/users');
            const data = await res.json();
            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                setUsers([]);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const openAddModal = () => {
        setIsEditMode(false);
        setEditingUserId(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            role: 'customer'
        });
        setFormError('');
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setIsEditMode(true);
        setEditingUserId(user._id);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            password: '', // Password baru jika ingin diubah
            role: user.role || 'customer'
        });
        setFormError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!formData.name.trim() || !formData.email.trim()) {
            setFormError('Nama dan email wajib diisi!');
            return;
        }

        if (!isEditMode && (!formData.password || formData.password.length < 6)) {
            setFormError('Password minimal 6 karakter!');
            return;
        }

        if (isEditMode && formData.password && formData.password.length < 6) {
            setFormError('Password baru minimal 6 karakter jika ingin diubah!');
            return;
        }

        setSubmitting(true);

        try {
            const url = isEditMode ? `/st/users/${editingUserId}` : '/st/users';
            const method = isEditMode ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await res.json();

            if (!res.ok) {
                setFormError(result.message || result.error || 'Gagal menyimpan data pengguna.');
                return;
            }

            alert(isEditMode ? 'Pengguna berhasil diperbarui!' : 'Pengguna berhasil ditambahkan!');
            closeModal();
            fetchUsers();
        } catch (err) {
            console.error(err);
            setFormError('Terjadi kesalahan koneksi server.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`Yakin ingin menghapus pengguna "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
            return;
        }

        try {
            const res = await fetch(`/st/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setUsers(users.filter(u => u._id !== id));
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(errData.message || 'Gagal menghapus pengguna.');
            }
        } catch (err) {
            console.error(err);
            alert('Gagal terhubung ke server.');
        }
    };

    // Filter Users
    const filteredUsers = users.filter(user => {
        const matchesQuery =
            (user.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.phone?.includes(searchQuery));
        const matchesRole = roleFilter === 'Semua' || (user.role || 'customer') === roleFilter;
        return matchesQuery && matchesRole;
    });

    const totalUsers = users.length;
    const totalCustomers = users.filter(u => (u.role || 'customer') === 'customer').length;
    const totalAdmins = users.filter(u => u.role === 'admin').length;

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-content">
                <div className="admin-header-row">
                    <h1>Kelola Pengguna</h1>
                    <button className="btn-admin-add" onClick={openAddModal}>
                        + Tambah Pengguna
                    </button>
                </div>

                {/* Statistik Pengguna */}
                <div className="stat-grid">
                    <div className="stat-card">
                        <span>Total Pengguna</span>
                        <h2>{totalUsers}</h2>
                    </div>
                    <div className="stat-card">
                        <span>Pelanggan</span>
                        <h2 style={{ color: '#03ac0e' }}>{totalCustomers}</h2>
                    </div>
                    <div className="stat-card">
                        <span>Admin</span>
                        <h2 style={{ color: '#2563eb' }}>{totalAdmins}</h2>
                    </div>
                </div>

                {/* Filter & Pencarian */}
                <div className="admin-filter-bar">
                    <div className="admin-search-input-wrap">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Cari nama, email, atau no. HP..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="admin-role-filter">
                        <label>Filter Role:</label>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="Semua">Semua Role</option>
                            <option value="customer">Pelanggan (Customer)</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                </div>

                {/* Tabel Pengguna */}
                <div className="table-card">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>PENGGUNA</th>
                                <th>EMAIL</th>
                                <th>NO. HP / WA</th>
                                <th>ROLE</th>
                                <th>TERDAFTAR</th>
                                <th>AKSI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '28px', color: '#666' }}>
                                        Memuat data pengguna...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '28px', color: '#666' }}>
                                        {users.length === 0 ? 'Belum ada pengguna terdaftar.' : 'Pengguna tidak ditemukan.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div className="user-avatar-badge">
                                                    {(user.name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <strong style={{ color: '#1a202c' }}>{user.name}</strong>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>{user.phone || '-'}</td>
                                        <td>
                                            <span className={`badge-role ${user.role === 'admin' ? 'role-admin' : 'role-customer'}`}>
                                                {user.role === 'admin' ? 'Admin' : 'Pelanggan'}
                                            </span>
                                        </td>
                                        <td>
                                            {user.createdAt
                                                ? new Date(user.createdAt).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })
                                                : '-'}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    className="btn-table-edit"
                                                    onClick={() => openEditModal(user)}
                                                    title="Edit Pengguna"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn-table-del"
                                                    onClick={() => handleDeleteUser(user._id, user.name)}
                                                    title="Hapus Pengguna"
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

            {/* Modal Tambah / Edit Pengguna */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                        <div className="modal-header">
                            <h3>{isEditMode ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}</h3>
                            <button className="modal-close-btn" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body" style={{ textAlign: 'left', padding: '20px 24px' }}>
                            {formError && (
                                <div className="auth-alert error" style={{ marginBottom: '16px' }}>
                                    ⚠️ {formError}
                                </div>
                            )}

                            <div className="form-group" style={{ marginBottom: '14px' }}>
                                <label>Nama Lengkap</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Budi Santoso"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '14px' }}>
                                <label>Alamat Email</label>
                                <input
                                    type="email"
                                    placeholder="nama@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '14px' }}>
                                <label>Nomor HP / WhatsApp <span style={{ color: '#888', fontWeight: 'normal' }}>(Opsional)</span></label>
                                <input
                                    type="tel"
                                    placeholder="08123456789"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '14px' }}>
                                <label>Role Pengguna</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '11px 14px',
                                        border: '1px solid #d3d9d7',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        backgroundColor: '#fff',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="customer">Pelanggan (Customer)</option>
                                    <option value="admin">Administrator (Admin)</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label>
                                    {isEditMode ? 'Password Baru (Kosongkan jika tidak ingin mengubah)' : 'Password'}
                                </label>
                                <input
                                    type="password"
                                    placeholder={isEditMode ? 'Kosongkan jika tetap sama' : 'Minimal 6 karakter'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!isEditMode}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                                <button
                                    type="button"
                                    className="btn-modal-secondary"
                                    onClick={closeModal}
                                    disabled={submitting}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="btn-modal-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminUsers;

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Helper untuk hashing password
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Cache koneksi MongoDB untuk Serverless (Vercel) & Local
async function connectDB() {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI belum dikonfigurasi di Environment Variables!');
    }
    await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 8000,
    });
}

// Middleware koneksi database per-request (aman untuk Vercel Serverless)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('Database connection error:', err.message);
        return res.status(500).json({
            error: 'Koneksi database gagal. Pastikan MONGODB_URI telah diset di Vercel Environment Variables.',
            details: err.message
        });
    }
});

// Model Schema Pengguna / Pelanggan (Customer)
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    role: { type: String, default: 'customer' }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Model Schema Produk dengan 3 Foto, Bahan, Ukuran, dan Berat
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },       // Foto utama (thumbnail)
    images: { type: [String], default: [] },    // Array menampung 3 foto
    material: { type: String, default: '' },   // Bahan
    sizes: { type: String, default: '' },      // Ukuran
    weight: { type: String, default: '' }      // Berat
}, { timestamps: true });

// Hindari OverwriteModelError pada Vercel hot reloads / serverless invocations
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Model Schema Pesanan (dengan data Pelanggan)
const orderSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, default: 'Diproses' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, default: '' },
    customerEmail: { type: String, default: '' }
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// Router API
const router = express.Router();

// Health Check Endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Helper untuk menyembunyikan Base64 panjang menjadi URL gambar penyimpanan bersih (/st/images/) mirip CDN
function sanitizeProduct(product) {
    if (!product) return null;
    const p = product.toObject ? product.toObject() : { ...product };

    if (p.image && p.image.startsWith('data:image')) {
        p.image = `/st/images/${p._id}-0.jpg`;
    }
    if (Array.isArray(p.images)) {
        p.images = p.images.map((img, idx) => {
            if (img && img.startsWith('data:image')) {
                return `/st/images/${p._id}-${idx}.jpg`;
            }
            return img;
        });
    }
    return p;
}

// Endpoint Khusus Stream Gambar Biner (Menyamarkan data base64 menjadi URL file .jpg seperti YouTube)
router.get('/images/:file', async (req, res) => {
    try {
        const fileParam = req.params.file.replace(/\.jpg$|\.jpeg$|\.png$|\.webp$/i, '');
        const parts = fileParam.split('-');
        const productId = parts[0];
        const imgIndex = parts[1] !== undefined ? parseInt(parts[1], 10) : 0;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Gambar tidak ditemukan' });
        }

        let rawBase64 = '';
        if (Array.isArray(product.images) && product.images[imgIndex]) {
            rawBase64 = product.images[imgIndex];
        } else if (imgIndex === 0 && product.image) {
            rawBase64 = product.image;
        }

        if (!rawBase64 || !rawBase64.startsWith('data:image')) {
            return res.status(404).json({ message: 'Data gambar kosong' });
        }

        const mimeMatch = rawBase64.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const cleanBase64 = rawBase64.replace(/^data:image\/\w+;base64,/, '');
        const imgBuffer = Buffer.from(cleanBase64, 'base64');

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
        return res.send(imgBuffer);
    } catch (err) {
        return res.status(400).json({ message: 'Gagal memuat gambar', error: err.message });
    }
});

// Middleware: Cegah pengunjung membuka langsung JSON mentah di address bar browser
function protectDataRoute(req, res, next) {
    const isDirectBrowserVisit = req.headers['sec-fetch-dest'] === 'document' ||
        (typeof req.headers['accept'] === 'string' && req.headers['accept'].startsWith('text/html'));
    if (isDirectBrowserVisit) {
        return res.redirect('/');
    }
    next();
}

// Endpoint API Produk (Data Base64 disembunyikan dan diubah menjadi URL gambar rapi)
router.get('/products', protectDataRoute, async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        const sanitized = products.map(sanitizeProduct);
        res.json(sanitized);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/products/:id', protectDataRoute, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.json(sanitizeProduct(product));
    } catch (err) {
        res.status(400).json({ message: 'ID tidak valid' });
    }
});

router.post('/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(sanitizeProduct(newProduct));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/products/:id', async (req, res) => {
    try {
        const existing = await Product.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: 'Produk tidak ditemukan' });

        const updateData = { ...req.body };

        // Jika foto dikirim kembali sebagai URL /st/images, pertahankan base64 lama
        if (updateData.image && (updateData.image.startsWith('/st/images') || updateData.image.startsWith('/api/images'))) {
            updateData.image = existing.image;
        }
        if (Array.isArray(updateData.images)) {
            updateData.images = updateData.images.map((img, idx) => {
                if (img && (img.startsWith('/st/images') || img.startsWith('/api/images'))) {
                    return (existing.images && existing.images[idx]) ? existing.images[idx] : existing.image;
                }
                return img;
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(sanitizeProduct(updatedProduct));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Produk berhasil dihapus' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Endpoint Registrasi Pelanggan
async function handleCustomerRegister(req, res) {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Nama, email, dan password wajib diisi!' });
        }
        if (typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ message: 'Password minimal 6 karakter!' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(400).json({ message: 'Email sudah terdaftar. Silakan gunakan email lain atau login!' });
        }

        const hashedPassword = hashPassword(password);
        const newUser = new User({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone ? phone.trim() : ''
        });
        await newUser.save();

        res.status(201).json({
            message: 'Registrasi berhasil!',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role
            }
        });
    } catch (err) {
        console.error('Error register:', err);
        res.status(500).json({ message: 'Gagal melakukan registrasi', error: err.message });
    }
}

// Endpoint Login Pelanggan
async function handleCustomerLogin(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email dan password wajib diisi!' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: 'Email atau password salah!' });
        }

        const hashedPassword = hashPassword(password);
        if (user.password !== hashedPassword) {
            return res.status(401).json({ message: 'Email atau password salah!' });
        }

        res.json({
            message: 'Login berhasil!',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Error login:', err);
        res.status(500).json({ message: 'Gagal melakukan login', error: err.message });
    }
}

router.post('/auth/register', handleCustomerRegister);
router.post('/register', handleCustomerRegister);

router.post('/auth/login', handleCustomerLogin);
router.post('/login', handleCustomerLogin);

// Endpoint Manajemen Pengguna (Admin)
router.get('/users', protectDataRoute, async (req, res) => {
    try {
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/users', async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Nama, email, dan password wajib diisi!' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password minimal 6 karakter!' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(400).json({ message: 'Email sudah terdaftar!' });
        }

        const newUser = new User({
            name: name.trim(),
            email: normalizedEmail,
            password: hashPassword(password),
            phone: phone ? phone.trim() : '',
            role: role || 'customer'
        });
        await newUser.save();

        res.status(201).json({
            message: 'User berhasil ditambahkan',
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
                createdAt: newUser.createdAt
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/users/:id', async (req, res) => {
    try {
        const { name, email, phone, role, password } = req.body;
        const updateData = {};
        if (name) updateData.name = name.trim();
        if (phone !== undefined) updateData.phone = phone.trim();
        if (role) updateData.role = role;
        if (password && password.trim().length >= 6) {
            updateData.password = hashPassword(password.trim());
        }

        if (email) {
            const normalizedEmail = email.toLowerCase().trim();
            const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: req.params.id } });
            if (existing) {
                return res.status(400).json({ message: 'Email sudah digunakan oleh user lain!' });
            }
            updateData.email = normalizedEmail;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, select: '-password' }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }

        res.json({
            message: 'User berhasil diperbarui',
            user: updatedUser
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }
        res.json({ message: 'Pengguna berhasil dihapus' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Endpoint API Pesanan
router.get('/orders', protectDataRoute, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Pesanan berhasil dihapus' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Blokir total semua akses /api (Anti API)
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// Routing data & gambar (/st dan internal serverless)
app.use('/st', router);
app.use('/', router);

// Jalankan listener jika file dijalankan langsung (lokal)
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server jalan di http://localhost:${PORT}`);
    });
}

// Export app untuk Vercel Serverless Function
module.exports = app;
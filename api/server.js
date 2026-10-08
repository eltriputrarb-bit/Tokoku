const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// Model Schema Pesanan
const orderSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, default: 'Diproses' }
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

// Endpoint API Produk
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: 'ID tidak valid' });
    }
});

router.post('/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.json(updatedProduct);
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

// Endpoint API Pesanan
router.get('/orders', async (req, res) => {
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

// Dukung route dengan prefix /api maupun root router
app.use('/api', router);
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
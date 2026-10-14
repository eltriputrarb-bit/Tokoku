import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Tokoku from './pages/Tokoku';
import TokokuDetail from './pages/TokokuDetail';
import CustomerLogin from './pages/CustomerLogin';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminProducts from './pages/AdminProducts';
import AdminAddProduct from './pages/AdminAddProduct';
import AdminOrders from './pages/AdminOrders';
import AdminEditProduct from './pages/AdminEditProduct.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import { AuthProvider } from './context/AuthContext';
import './index.css';

function MainLayout() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin') && location.pathname !== '/admin';

  return (
    <div className="site-layout">
      {!isAdminPath && <Header />}
      <div className={isAdminPath ? 'admin-root' : 'app'}>
        <Routes>
          <Route path="/" element={<Tokoku />} />
          <Route path="/produk/:id" element={<TokokuDetail />} />
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/add" element={<AdminAddProduct />} />
          <Route path="/admin/dashboard" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/products/edit/:id" element={<AdminEditProduct />} />
        </Routes>
      </div>
      {!isAdminPath && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
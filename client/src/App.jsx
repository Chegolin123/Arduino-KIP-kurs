// Расположение: C:\OSPanel\domains\Arduino\client\src\App.jsx
// Главный компонент приложения

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, setInitialized } from './store/authSlice';
import Header from './components/Layout/Header';
import AdminHeader from './components/Layout/AdminHeader';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Library from './pages/Library';
import Learn from './pages/Learn';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminCourses from './pages/Admin/Courses';
import AdminChapters from './pages/Admin/Chapters';
import AdminTests from './pages/Admin/Tests';
import AdminProducts from './pages/Admin/Products';
import AdminUsers from './pages/Admin/Users';

const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow"><Outlet /></main>
    <Footer />
  </div>
);

const AdminLayout = () => (
  <div className="flex flex-col min-h-screen">
    <AdminHeader />
    <main className="flex-grow"><Outlet /></main>
    <Footer />
  </div>
);

function AppContent() {
  const dispatch = useDispatch();
  const { token, initialized } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) { dispatch(fetchProfile()); }
    else { dispatch(setInitialized()); }
  }, []);

  if (!initialized) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center px-6 py-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-900 via-blue-700 to-slate-900 mx-auto mb-3 shadow-lg" />
            <div className="text-lg font-semibold text-slate-900 mb-1">Обучающая платформа</div>
            <div className="text-slate-500 text-sm">Загрузка...</div>
          </div>
        </div>
      );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/chapters" element={<AdminChapters />} />
        <Route path="/admin/tests" element={<AdminTests />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Route>

      <Route element={<PublicLayout />}>
        <Route path="/library" element={<Library />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/:chapterId" element={<Learn />} />
        <Route path="/learn/:chapterId/:sectionId" element={<Learn />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

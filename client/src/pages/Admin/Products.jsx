// Расположение: C:\OSPanel\domains\Arduino\client\src\pages\Admin\Products.jsx
// Управление товарами каталога

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const AdminProducts = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: 0, category: '', stock: 0, specifications: '' });
  const [image, setImage] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const categories = ['Микроконтроллеры', 'Датчики', 'Дисплеи', 'Моторы', 'Коммуникация', 'Питание', 'Резисторы', 'Светодиоды'];

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') { navigate('/login'); }
    else { loadProducts(); }
  }, [isAuthenticated, user, navigate]);

  const loadProducts = async () => {
    setLoading(true);
    const response = await API.get('/products');
    setProducts(response.data.products || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('category', form.category);
    formData.append('stock', form.stock);
    if (form.specifications) {
      try { JSON.parse(form.specifications); } catch (e) { alert('Неверный JSON'); return; }
      formData.append('specifications', form.specifications);
    }
    if (image) formData.append('image', image);

    if (editingProduct) {
      await API.put(`/products/${editingProduct.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    } else {
      await API.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    resetForm();
    loadProducts();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price || 0,
      category: product.category || '',
      stock: product.stock || 0,
      specifications: product.specifications ? JSON.stringify(product.specifications, null, 2) : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить товар?')) {
      await API.delete(`/products/${id}`);
      loadProducts();
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setForm({ name: '', description: '', price: 0, category: '', stock: 0, specifications: '' });
    setImage(null);
    setShowForm(false);
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="bg-gray-50 flex-1">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-500">{products.length} товаров</p>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="px-4 py-2 bg-blue-800 text-white text-sm rounded-lg hover:bg-blue-900 transition-colors">
            {showForm ? 'Скрыть' : '+ Добавить товар'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">{editingProduct ? 'Редактировать' : 'Новый товар'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Название *</label><input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Категория</label><select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="">Выберите</option>{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Цена (₽)</label><input type="number" value={form.price} onChange={(e) => setForm({...form, price: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Количество</label><input type="number" value={form.stock} onChange={(e) => setForm({...form, stock: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Описание</label><textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" rows="3" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Изображение</label><input type="file" onChange={(e) => setImage(e.target.files[0])} className="w-full text-sm" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Характеристики (JSON)</label><textarea value={form.specifications} onChange={(e) => setForm({...form, specifications: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" rows="5" placeholder='{"напряжение": "5В"}' /></div>
              <div className="md:col-span-2 flex space-x-3">
                <button type="submit" className="px-6 py-2 bg-blue-800 text-white text-sm rounded-lg hover:bg-blue-900">{editingProduct ? 'Сохранить' : 'Добавить'}</button>
                <button type="button" onClick={resetForm} className="px-6 py-2 border text-gray-700 text-sm rounded-lg hover:bg-gray-50">Отмена</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <p className="p-6 text-gray-400">Загрузка...</p> : products.length === 0 ? <p className="p-6 text-gray-400">Нет товаров</p> : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b"><tr><th className="text-left px-6 py-3 text-xs text-gray-500 uppercase">Товар</th><th className="text-left px-6 py-3 text-xs text-gray-500 uppercase">Категория</th><th className="text-left px-6 py-3 text-xs text-gray-500 uppercase">Цена</th><th className="text-left px-6 py-3 text-xs text-gray-500 uppercase">Наличие</th><th className="text-right px-6 py-3 text-xs text-gray-500 uppercase">Действия</th></tr></thead>
              <tbody className="divide-y">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4"><div className="flex items-center space-x-3"><div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">📦</div><div><p className="text-sm font-medium">{p.name}</p></div></div></td>
                    <td className="px-6 py-4">{p.category && <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">{p.category}</span>}</td>
                    <td className="px-6 py-4 text-sm">{p.price} ₽</td>
                    <td className="px-6 py-4"><span className={`text-xs ${p.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>{p.stock > 0 ? `${p.stock} шт.` : 'Нет'}</span></td>
                    <td className="px-6 py-4 text-right"><button onClick={() => handleEdit(p)} className="text-sm text-blue-600 mr-3">Изменить</button><button onClick={() => handleDelete(p.id)} className="text-sm text-red-600">Удалить</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
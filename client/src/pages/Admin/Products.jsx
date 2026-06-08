// Расположение: C:\OSPanel\domains\Arduino\client\src\pages\Admin\Products.jsx
// Управление товарами каталога

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { showAlert, showConfirm } from '../../components/Modal';

const AdminProducts = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: 0, category: '', stock: 0, specifications: '' });
  const [specsList, setSpecsList] = useState([]);
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
    if (specsList.length > 0) {
      const specsObj = {};
      let valid = true;
      specsList.forEach(({ key, value }) => {
        if (key.trim()) specsObj[key.trim()] = value;
        else valid = false;
      });
      if (!valid) { showAlert('Заполните название характеристики'); return; }
      formData.append('specifications', JSON.stringify(specsObj));
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
    const specs = product.specifications || {};
    setSpecsList(
      typeof specs === 'object' && !Array.isArray(specs)
        ? Object.entries(specs).map(([key, value]) => ({ key, value: String(value) }))
        : []
    );
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (await showConfirm('Удалить товар?')) {
      await API.delete(`/products/${id}`);
      loadProducts();
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setForm({ name: '', description: '', price: 0, category: '', stock: 0, specifications: '' });
    setSpecsList([]);
    setImage(null);
    setShowForm(false);
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="flex-1 min-h-screen" style={{
      backgroundColor: '#f8fafc',
      backgroundImage: `
        linear-gradient(rgba(191, 219, 254, 0.4) 1px, transparent 1px),
        linear-gradient(90deg, rgba(191, 219, 254, 0.4) 1px, transparent 1px),
        radial-gradient(circle at 0px 0px, rgba(147, 197, 253, 0.8) 2px, transparent 0),
        url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDE2MCAxNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYmZkYmZlIiBzdHJva2Utd2lkdGg9IjEiPjxwYXRoIGQ9Ik00MCAwIHY0MCBoNDAgdjQwIGg0MCB2NDAgSDQwIi8+PHBhdGggZD0iTTEyMCAwIHY4MCBoLTQwIi8+PHBhdGggZD0iTTAgMTIwaDQwIHY0MCIvPjwvZz48Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSIzIiBmaWxsPSIjOTNjNWZkIiBmaWxsLW9wYWNpdHk9IjAuNSIvPjxjaXJjbGUgY3g9IjEyMCIgY3k9IjEyMCIgcj0iMyIgZmlsbD0iIzkzYzVmZCIgZmlsbC1vcGFjaXR5PSIwLjUiLz48L3N2Zz4")
      `,
      backgroundSize: '80px 80px, 80px 80px, 80px 80px, 160px 160px',
      backgroundRepeat: 'repeat',
      backgroundAttachment: 'fixed',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-100/80">Админка</p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2">Каталог товаров</h1>
          <p className="text-sm sm:text-base text-blue-100/90 mt-3 max-w-2xl">Создание, редактирование и управление товарами каталога.</p>
        </div>
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-slate-500 bg-white/85 backdrop-blur-sm border border-slate-200 px-4 py-2 rounded-full shadow-sm">{products.length} товаров</p>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="px-4 py-2 bg-blue-900 text-white text-sm rounded-full hover:bg-blue-950 transition-colors shadow-sm">
            {showForm ? 'Скрыть' : '+ Добавить товар'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white/88 backdrop-blur-sm rounded-3xl border border-slate-200 p-6 mb-6 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4">{editingProduct ? 'Редактировать' : 'Новый товар'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Название *</label><input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white" required /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Категория</label><select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white"><option value="">Выберите</option>{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Цена (₽)</label><input type="number" value={form.price} onChange={(e) => setForm({...form, price: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Количество</label><input type="number" value={form.stock} onChange={(e) => setForm({...form, stock: parseInt(e.target.value) || 0})} className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">Описание</label><textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white" rows="3" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">Изображение</label><input type="file" onChange={(e) => setImage(e.target.files[0])} className="w-full text-sm" /></div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Характеристики</label>
                <div className="space-y-2">
                  {specsList.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input type="text" value={item.key} onChange={(e) => {
                        const next = [...specsList];
                        next[idx] = { ...next[idx], key: e.target.value };
                        setSpecsList(next);
                      }} className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white" placeholder="Название" />
                      <input type="text" value={item.value} onChange={(e) => {
                        const next = [...specsList];
                        next[idx] = { ...next[idx], value: e.target.value };
                        setSpecsList(next);
                      }} className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white" placeholder="Значение" />
                      <button type="button" onClick={() => setSpecsList(specsList.filter((_, i) => i !== idx))} className="px-2 text-red-500 hover:text-red-700">✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setSpecsList([...specsList, { key: '', value: '' }])} className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ Добавить характеристику</button>
                </div>
              </div>
              <div className="md:col-span-2 flex space-x-3">
                <button type="submit" className="px-6 py-2 bg-blue-900 text-white text-sm rounded-full hover:bg-blue-950 shadow-sm">{editingProduct ? 'Сохранить' : 'Добавить'}</button>
                <button type="button" onClick={resetForm} className="px-6 py-2 border border-slate-300 text-slate-700 text-sm rounded-full hover:bg-slate-50">Отмена</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white/88 backdrop-blur-sm rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? <p className="p-6 text-slate-400">Загрузка...</p> : products.length === 0 ? <p className="p-6 text-slate-400">Нет товаров</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-slate-50 border-b"><tr><th className="text-left px-6 py-3 text-xs text-slate-500 uppercase">Товар</th><th className="text-left px-6 py-3 text-xs text-slate-500 uppercase">Категория</th><th className="text-left px-6 py-3 text-xs text-slate-500 uppercase">Цена</th><th className="text-left px-6 py-3 text-xs text-slate-500 uppercase">Наличие</th><th className="text-right px-6 py-3 text-xs text-slate-500 uppercase">Действия</th></tr></thead>
                <tbody className="divide-y">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4"><div className="flex items-center space-x-3"><div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">📦</div><div><p className="text-sm font-medium text-slate-900">{p.name}</p></div></div></td>
                      <td className="px-6 py-4">{p.category && <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">{p.category}</span>}</td>
                      <td className="px-6 py-4 text-sm">{p.price} ₽</td>
                      <td className="px-6 py-4"><span className={`text-xs ${p.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>{p.stock > 0 ? `${p.stock} шт.` : 'Нет'}</span></td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button onClick={() => handleEdit(p)} className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-3 text-sm text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">Изменить</button>
                        <button onClick={() => handleDelete(p.id)} className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors">Удалить</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;

import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';

interface Category {
  id: string;
  name: string;
  color: string;
  wallpaperCount: number;
}

const COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Yellow', value: '#eab308' },
];

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), {
          name: newCategoryName,
          color: selectedColor,
        });
      } else {
        await addDoc(collection(db, 'categories'), {
          name: newCategoryName,
          color: selectedColor,
          wallpaperCount: 0,
        });
      }
      setNewCategoryName('');
      setSelectedColor(COLORS[0].value);
      setEditingCategory(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setSelectedColor(category.color);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1e293b' }}>Categories / Tags</h1>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>Organize wallpapers by categories and tags</p>
          </div>
          <button 
            onClick={() => {
              setEditingCategory(null);
              setNewCategoryName('');
              setSelectedColor(COLORS[0].value);
              setIsModalOpen(true);
            }}
            className="bg-primary hover:bg-blue-700 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer"
            style={{ color: '#ffffff !important' } as React.CSSProperties}
          >
            <span className="material-symbols-outlined text-xl">add</span>
            <span>New Category</span>
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
            <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-slate-400">category</span>
            </div>
            <p className="text-slate-500 text-lg">No categories yet</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-4 text-primary font-semibold hover:underline cursor-pointer"
            >
              Create your first category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="size-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: category.color }}
                    >
                      <span className="material-symbols-outlined text-white">folder</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{category.name}</h3>
                      <p className="text-xs text-slate-500">{category.wallpaperCount || 0} wallpapers</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditModal(category)}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(category.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. Nature, Abstract, Minimal"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setSelectedColor(color.value)}
                      className={`size-10 rounded-lg transition-all cursor-pointer ${selectedColor === color.value ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-blue-700 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-4 cursor-pointer"
                style={{ color: '#ffffff !important' } as React.CSSProperties}
              >
                <span className="material-symbols-outlined">{editingCategory ? 'save' : 'add'}</span>
                <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;

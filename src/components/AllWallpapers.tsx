import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

interface Wallpaper {
  id: string;
  title: string;
  url: string;
  userName: string;
  collectionName?: string;
  fileName?: string;
  createdAt: any;
}

interface AllWallpapersProps {
  onUploadClick: () => void;
}

const AllWallpapers: React.FC<AllWallpapersProps> = ({ onUploadClick }) => {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchWallpapers = async () => {
    setLoading(true);
    try {
      // We still use Firestore to get metadata like titles and user names
      // but we could also fetch from the backend if we wanted to sync.
      // For now, let's stick to Firestore for the list as it has more metadata.
      const q = query(collection(db, 'wallpapers'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Wallpaper[];
        setWallpapers(data);
        setLoading(false);
      });
      return unsubscribe;
    } catch (error) {
      console.error("Error fetching wallpapers:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    
    const unsubscribePromise = fetchWallpapers();
    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, []);

  const handleDelete = async (wallpaper: Wallpaper) => {
    if (!confirm('Are you sure you want to delete this wallpaper?')) return;
    
    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, 'wallpapers', wallpaper.id));
      
      // 2. Delete from GCS via Backend
      const fileName = wallpaper.fileName || wallpaper.url.split('/').pop();
      if (fileName) {
        const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000/api/delete' : '/api/delete';
        await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName }),
        });
      }
    } catch (error) {
      console.error('Error deleting wallpaper:', error);
      alert("Failed to delete wallpaper. Make sure the backend server is running.");
    }
  };

  const filteredWallpapers = wallpapers.filter(wp => 
    wp.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1e293b' }}>All Wallpapers</h1>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>Manage and organize your wallpaper collection</p>
          </div>
          <button 
            onClick={onUploadClick}
            className="bg-primary hover:bg-blue-700 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer"
            style={{ color: '#ffffff !important' } as React.CSSProperties}
          >
            <span className="material-symbols-outlined text-xl">add</span>
            <span>Upload New</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Search wallpapers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button className="bg-white border border-slate-200 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined">filter_list</span>
            Filter
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          <span className="text-slate-500">Total: <strong className="text-slate-900">{wallpapers.length}</strong> wallpapers</span>
          {searchTerm && (
            <span className="text-slate-500">Showing: <strong className="text-slate-900">{filteredWallpapers.length}</strong> results</span>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredWallpapers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
            <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-slate-400">image</span>
            </div>
            <p className="text-slate-500 text-lg">No wallpapers found</p>
            <button 
              onClick={onUploadClick}
              className="mt-4 text-primary font-semibold hover:underline cursor-pointer"
            >
              Upload your first wallpaper
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filteredWallpapers.map((wp) => (
              <div key={wp.id} className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all">
                <div className="aspect-[2/3] w-full overflow-hidden bg-slate-100 relative">
                  <div 
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                    style={{ backgroundImage: `url('${wp.url}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                      <a 
                        href={wp.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 bg-white/90 hover:bg-white text-slate-900 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        View
                      </a>
                      <button 
                        onClick={() => handleDelete(wp)}
                        className="bg-red-500/90 hover:bg-red-500 p-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm text-white">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-slate-900 text-sm truncate">{wp.title}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-slate-500">by {wp.userName}</p>
                    {wp.collectionName && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                        {wp.collectionName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllWallpapers;

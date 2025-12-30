import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import type { PageType } from '../App';

interface Wallpaper {
  id: string;
  title: string;
  url: string;
  userName: string;
  createdAt: any;
}

interface DashboardProps {
  onUploadClick: () => void;
  onNavigate: (page: PageType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onUploadClick, onNavigate }) => {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      console.error("Firestore DB not initialized");
      setLoading(false);
      return;
    }
    
    try {
      const q = query(collection(db, 'wallpapers'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Wallpaper[];
        setWallpapers(data);
        setLoading(false);
      }, (error) => {
        console.error("Firestore snapshot error:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up Firestore listener:", error);
      setLoading(false);
    }
  }, []);


  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-8">
        {/* Stats Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4 transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Wallpapers</p>
                <h3 className="text-3xl font-bold text-black">{wallpapers.length}</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <span className="material-symbols-outlined">image</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+12 this week</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4 transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Downloads</p>
                <h3 className="text-3xl font-bold text-black">45.2k</h3>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <span className="material-symbols-outlined">download</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+8.5% vs last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4 transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Active Collections</p>
                <h3 className="text-3xl font-bold text-black">12</h3>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <span className="material-symbols-outlined">folder_open</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <span>2 created recently</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4 transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Storage Used</p>
                <h3 className="text-3xl font-bold text-black">4.2<span className="text-lg text-gray-600 font-normal ml-1">GB</span></h3>
              </div>
              <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                <span className="material-symbols-outlined">database</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <span>Of 10GB Total Capacity</span>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h3 className="text-lg font-bold mb-4" style={{ color: '#1e293b' }}>Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={onUploadClick}
              className="bg-white hover:bg-primary border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-4 group cursor-pointer hover:border-primary"
            >
              <div className="bg-slate-100 group-hover:bg-white/20 rounded-full p-2 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl group-hover:text-white-force" style={{ color: '#1e293b' }}>cloud_upload</span>
              </div>
              <div className="text-left">
                <span className="block font-bold text-lg group-hover:text-white-force" style={{ color: '#1e293b' }}>Upload New</span>
                <span className="block text-sm font-normal group-hover:text-white-force" style={{ color: '#64748b' }}>Add a single wallpaper</span>
              </div>
            </button>
            <button 
              onClick={() => onNavigate('collections')}
              className="bg-white hover:bg-primary border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-4 group cursor-pointer hover:border-primary"
            >
              <div className="bg-slate-100 group-hover:bg-white/20 rounded-full p-2 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl group-hover:text-white-force" style={{ color: '#1e293b' }}>create_new_folder</span>
              </div>
              <div className="text-left">
                <span className="block font-bold text-lg group-hover:text-white-force" style={{ color: '#1e293b' }}>Create Collection</span>
                <span className="block text-sm font-normal group-hover:text-white-force" style={{ color: '#64748b' }}>Group by theme</span>
              </div>
            </button>
            <button 
              onClick={() => window.open('/', '_blank')}
              className="bg-white hover:bg-primary border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-4 group cursor-pointer hover:border-primary"
            >
              <div className="bg-slate-100 group-hover:bg-white/20 rounded-full p-2 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl group-hover:text-white-force" style={{ color: '#1e293b' }}>preview</span>
              </div>
              <div className="text-left">
                <span className="block font-bold text-lg group-hover:text-white-force" style={{ color: '#1e293b' }}>App Preview</span>
                <span className="block text-sm font-normal group-hover:text-white-force" style={{ color: '#64748b' }}>View as user</span>
              </div>
            </button>
          </div>
        </section>

        {/* Recent Uploads */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-black">Recent Uploads</h3>
            <a className="text-primary text-sm font-semibold hover:underline flex items-center gap-1" href="#">
              View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : wallpapers.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
              <p className="text-slate-500 text-lg">No wallpapers found. Start by uploading one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {wallpapers.map((wp) => (
                <div key={wp.id} className="group cursor-pointer">
                  <div className="aspect-[2/3] w-full rounded-lg overflow-hidden bg-slate-200 relative mb-3 shadow-sm group-hover:shadow-md transition-all">
                    <div 
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                      style={{ backgroundImage: `url('${wp.url}')` }}
                    ></div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm truncate">{wp.title}</h4>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-slate-500">by {wp.userName}</p>
                    <p className="text-[10px] text-slate-400">Recent</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-8 pt-8 border-t border-slate-200 text-center text-slate-400 text-xs pb-4">
          <p>© 2024 WallBrain Inc. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );

};

export default Dashboard;

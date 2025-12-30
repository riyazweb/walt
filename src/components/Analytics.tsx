import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface Stats {
  totalWallpapers: number;
  totalDownloads: number;
  totalCollections: number;
  totalCategories: number;
}

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalWallpapers: 0,
    totalDownloads: 0,
    totalCollections: 0,
    totalCategories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    
    // Listen to wallpapers
    const unsubWallpapers = onSnapshot(collection(db, 'wallpapers'), (snapshot) => {
      setStats(prev => ({ ...prev, totalWallpapers: snapshot.size }));
    });

    // Listen to collections
    const unsubCollections = onSnapshot(collection(db, 'collections'), (snapshot) => {
      setStats(prev => ({ ...prev, totalCollections: snapshot.size }));
    });

    // Listen to categories
    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setStats(prev => ({ ...prev, totalCategories: snapshot.size }));
    });

    setLoading(false);

    return () => {
      unsubWallpapers();
      unsubCollections();
      unsubCategories();
    };
  }, []);

  const analyticsCards = [
    { label: 'Total Wallpapers', value: stats.totalWallpapers, icon: 'image', color: 'blue', change: '+12 this week' },
    { label: 'Total Downloads', value: '45.2k', icon: 'download', color: 'green', change: '+8.5% vs last month' },
    { label: 'Active Collections', value: stats.totalCollections, icon: 'folder_open', color: 'purple', change: `${stats.totalCollections} total` },
    { label: 'Categories', value: stats.totalCategories, icon: 'category', color: 'orange', change: `${stats.totalCategories} total` },
  ];

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Track your wallpaper dashboard performance</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {analyticsCards.map((card, index) => (
                <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-medium mb-1">{card.label}</p>
                      <h3 className="text-3xl font-bold text-slate-900">{card.value}</h3>
                    </div>
                    <div className={`p-3 rounded-lg ${colorClasses[card.color]}`}>
                      <span className="material-symbols-outlined">{card.icon}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium mt-4">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    <span>{card.change}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4">Downloads Over Time</h3>
                <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center border border-dashed border-slate-200">
                  <div className="text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2">bar_chart</span>
                    <p className="text-sm">Chart data will appear here</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4">Popular Categories</h3>
                <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center border border-dashed border-slate-200">
                  <div className="text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2">pie_chart</span>
                    <p className="text-sm">Chart data will appear here</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { action: 'New wallpaper uploaded', time: '2 minutes ago', icon: 'cloud_upload', color: 'blue' },
                  { action: 'Collection "Minimal" created', time: '1 hour ago', icon: 'create_new_folder', color: 'purple' },
                  { action: 'Category "Nature" added', time: '3 hours ago', icon: 'category', color: 'green' },
                  { action: 'Wallpaper downloaded 50 times', time: '5 hours ago', icon: 'download', color: 'orange' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                    <div className={`p-2 rounded-lg ${colorClasses[activity.color]}`}>
                      <span className="material-symbols-outlined text-lg">{activity.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;

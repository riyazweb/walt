import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

interface Stats {
  totalWallpapers: number;
  totalDownloads: number;
  totalCollections: number;
  totalCategories: number;
}

interface Activity {
  id: string;
  action: string;
  time: string;
  icon: string;
  color: string;
  timestamp: any;
}

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalWallpapers: 0,
    totalDownloads: 0,
    totalCollections: 0,
    totalCategories: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
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

    // Listen to recent activity (wallpapers)
    const qRecent = query(collection(db, 'wallpapers'), orderBy('createdAt', 'desc'), limit(5));
    const unsubActivity = onSnapshot(qRecent, (snapshot) => {
      const recentActivities = snapshot.docs.map(doc => {
        const data = doc.data();
        const date = data.createdAt?.toDate() || new Date();
        return {
          id: doc.id,
          action: `New wallpaper "${data.title}" uploaded`,
          time: date.toLocaleString(),
          icon: 'cloud_upload',
          color: 'blue',
          timestamp: data.createdAt
        };
      });
      setActivities(recentActivities);
    });

    setLoading(false);

    return () => {
      unsubWallpapers();
      unsubCollections();
      unsubCategories();
      unsubActivity();
    };
  }, []);

  const analyticsCards = [
    { label: 'Total Wallpapers', value: stats.totalWallpapers, icon: 'image', color: 'blue', change: 'Updated just now' },
    { label: 'Total Downloads', value: 0, icon: 'download', color: 'green', change: '0% vs last month' },
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
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-4 md:gap-6 lg:gap-8">
        {/* Header */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Track your wallpaper dashboard performance</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
              {analyticsCards.map((card, index) => (
                <div key={index} className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-slate-500 text-xs md:text-sm font-medium mb-1">{card.label}</p>
                      <h3 className="text-2xl md:text-3xl font-bold text-slate-900">{card.value}</h3>
                    </div>
                    <div className={`p-2 md:p-3 rounded-lg ${colorClasses[card.color]}`}>
                      <span className="material-symbols-outlined text-xl md:text-2xl">{card.icon}</span>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-base md:text-lg text-slate-900 mb-3 md:mb-4">Downloads Over Time</h3>
                <div className="h-48 md:h-64 bg-slate-50 rounded-lg flex items-center justify-center border border-dashed border-slate-200">
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
                {activities.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <p className="text-sm">No recent activity to show</p>
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                      <div className={`p-2 rounded-lg ${colorClasses[activity.color]}`}>
                        <span className="material-symbols-outlined text-lg">{activity.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                        <p className="text-xs text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;

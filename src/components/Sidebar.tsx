import React, { useEffect, useState } from 'react';
import type { PageType } from '../App';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface SidebarProps {
  onUploadClick: () => void;
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

interface NavItem {
  id: PageType;
  label: string;
  icon: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onUploadClick, currentPage, onNavigate }) => {
  const [totalStorage, setTotalStorage] = useState(0);
  const STORAGE_LIMIT_GB = 5;
  const STORAGE_LIMIT_BYTES = STORAGE_LIMIT_GB * 1024 * 1024 * 1024;

  useEffect(() => {
    if (!db) return;

    const unsubscribe = onSnapshot(collection(db, 'wallpapers'), (snapshot) => {
      const storage = snapshot.docs.reduce((acc, doc) => acc + (doc.data().fileSize || 0), 0);
      setTotalStorage(storage);
    });

    return () => unsubscribe();
  }, []);

  const formatStorage = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  const storagePercentage = Math.min((totalStorage / STORAGE_LIMIT_BYTES) * 100, 100);

  const mainNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'upload', label: 'Upload Wallpapers', icon: 'cloud_upload' },
    { id: 'wallpapers', label: 'All Wallpapers', icon: 'perm_media' },
    { id: 'categories', label: 'Categories / Tags', icon: 'category' },
    { id: 'collections', label: 'Collections', icon: 'collections_bookmark' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics' },
  ];

  const secondaryNavItems: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'support', label: 'Support / Help', icon: 'help' },
  ];

  const handleNavClick = (item: NavItem) => {
    if (item.id === 'upload') {
      onUploadClick();
    } else {
      onNavigate(item.id);
    }
  };

  const getNavItemClass = (id: PageType) => {
    const isActive = currentPage === id;
    return `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group text-left cursor-pointer ${
      isActive 
        ? 'bg-primary shadow-sm' 
        : 'hover:bg-slate-50'
    }`;
  };

  const getTextStyle = (id: PageType): React.CSSProperties => {
    const isActive = currentPage === id;
    return { color: isActive ? '#ffffff !important' : '#1e293b !important' } as React.CSSProperties;
  };

  return (
    <aside className="w-64 flex flex-col h-full bg-white border-r border-slate-200 shrink-0 transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl" style={{ color: '#2b6cee !important' } as React.CSSProperties}>wallpaper</span>
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight" style={{ color: '#1e293b !important' } as React.CSSProperties}>WALTPAPER</h1>
          <p className="text-xs font-medium" style={{ color: '#2b6cee !important' } as React.CSSProperties}>Admin Panel</p>
        </div>
      </div>
      <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={getNavItemClass(item.id)}
            style={getTextStyle(item.id)}
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
        <div className="my-2 border-t border-slate-100"></div>
        {secondaryNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={getNavItemClass(item.id)}
            style={getTextStyle(item.id)}
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <div className="bg-blue-50 rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-sm">storage</span>
            <span className="text-xs font-bold uppercase tracking-wider">Storage</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${storagePercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {formatStorage(totalStorage)} used of {STORAGE_LIMIT_GB} GB
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

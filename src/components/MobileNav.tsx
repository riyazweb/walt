import React from 'react';
import type { PageType } from '../App';

interface MobileNavProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  onUploadClick: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentPage, onNavigate, onUploadClick }) => {
  const navItems = [
    { id: 'dashboard' as PageType, icon: 'dashboard', label: 'Dashboard' },
    { id: 'wallpapers' as PageType, icon: 'image', label: 'Wallpapers' },
    { id: 'upload' as PageType, icon: 'add_circle', label: 'Upload' },
    { id: 'collections' as PageType, icon: 'folder', label: 'Collections' },
    { id: 'settings' as PageType, icon: 'settings', label: 'Settings' },
  ];

  const handleClick = (page: PageType) => {
    if (page === 'upload') {
      onUploadClick();
    } else {
      onNavigate(page);
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-all min-w-14 ${
              currentPage === item.id && item.id !== 'upload'
                ? 'text-primary bg-primary/10'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            } ${item.id === 'upload' ? 'text-primary' : ''}`}
          >
            <span className={`material-symbols-outlined text-2xl ${item.id === 'upload' ? 'text-3xl' : ''}`}>
              {item.icon}
            </span>
            <span className="text-xs font-medium truncate max-w-full">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;

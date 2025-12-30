import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './firebase';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AllWallpapers from './components/AllWallpapers';
import Categories from './components/Categories';
import Collections from './components/Collections';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Support from './components/Support';
import Login from './components/Login';
import UploadModal from './components/UploadModal';
import './App.css';

export type PageType = 'dashboard' | 'upload' | 'wallpapers' | 'categories' | 'collections' | 'analytics' | 'settings' | 'support';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleNavigate = (page: PageType) => {
    if (page === 'upload') {
      setIsUploadModalOpen(true);
    } else {
      setCurrentPage(page);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onUploadClick={() => setIsUploadModalOpen(true)} onNavigate={handleNavigate} />;
      case 'wallpapers':
        return <AllWallpapers onUploadClick={() => setIsUploadModalOpen(true)} />;
      case 'categories':
        return <Categories />;
      case 'collections':
        return <Collections />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      case 'support':
        return <Support />;
      default:
        return <Dashboard onUploadClick={() => setIsUploadModalOpen(true)} onNavigate={handleNavigate} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen w-full font-display bg-background-light text-slate-900 overflow-hidden">
      <Sidebar 
        onUploadClick={() => setIsUploadModalOpen(true)} 
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light relative">
        <Header user={user} currentPage={currentPage} />
        {renderPage()}
      </main>
      <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </div>
  );
}

export default App;






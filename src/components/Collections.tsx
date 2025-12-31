import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';

interface Collection {
  id: string;
  name: string;
  appId?: string;
  description: string;
  wallpaperCount: number;
  coverImage?: string;
  createdAt: any;
}

interface Wallpaper {
  id: string;
  title: string;
  url: string;
  userName: string;
  createdAt: any;
}

const API_KEY = 'wall_brain_secret_key_777'; // Match the one in server/.env

const Collections: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAppId, setNewAppId] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  
  // Detail View State
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [collectionWallpapers, setCollectionWallpapers] = useState<Wallpaper[]>([]);
  const [loadingWallpapers, setLoadingWallpapers] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onSnapshot(collection(db, 'collections'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Collection[];
      setCollections(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch wallpapers when a collection is selected
  useEffect(() => {
    if (selectedCollection) {
      setLoadingWallpapers(true);
      const q = query(
        collection(db, 'wallpapers'), 
        where('collectionName', '==', selectedCollection.name),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Wallpaper[];
        setCollectionWallpapers(data);
        setLoadingWallpapers(false);
      });

      return () => unsubscribe();
    }
  }, [selectedCollection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      if (editingCollection) {
        await updateDoc(doc(db, 'collections', editingCollection.id), {
          name: newName,
          appId: newAppId,
          description: newDescription,
        });
      } else {
        await addDoc(collection(db, 'collections'), {
          name: newName,
          appId: newAppId,
          description: newDescription,
          wallpaperCount: 0,
          createdAt: new Date(),
        });
      }
      setNewName('');
      setNewAppId('');
      setNewDescription('');
      setEditingCollection(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving collection:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    try {
      await deleteDoc(doc(db, 'collections', id));
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  const openEditModal = (coll: Collection) => {
    setEditingCollection(coll);
    setNewName(coll.name);
    setNewAppId(coll.appId || '');
    setNewDescription(coll.description || '');
    setIsModalOpen(true);
  };

  const handleSync = async () => {
    if (!selectedCollection || collectionWallpapers.length === 0) return;
    
    setSyncing(true);
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          collectionName: selectedCollection.name,
          wallpapers: collectionWallpapers.map(w => ({
            id: w.id,
            title: w.title,
            url: w.url,
            createdAt: w.createdAt
          }))
        })
      });
      
      if (response.ok) {
        alert('Successfully synced to App API!');
      } else {
        alert('Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Error syncing to API');
    } finally {
      setSyncing(false);
    }
  };

  const handlePreview = async (url: string) => {
    try {
      const response = await fetch(url, {
        headers: { 'x-api-key': API_KEY }
      });
      const data = await response.json();
      setPreviewData(data);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error('Preview error:', error);
      alert('Error fetching preview');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
        {selectedCollection ? (
          /* Detail View */
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedCollection(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{selectedCollection.name}</h1>
                <p className="text-sm text-slate-500">{collectionWallpapers.length} wallpapers in this collection</p>
              </div>
              <button 
                onClick={handleSync}
                disabled={syncing || collectionWallpapers.length === 0}
                className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">{syncing ? 'sync' : 'cloud_sync'}</span>
                {syncing ? 'Syncing...' : 'Sync to App API'}
              </button>
            </div>

            {loadingWallpapers ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : collectionWallpapers.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
                <p className="text-slate-500">No wallpapers in this collection yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {collectionWallpapers.map((wp) => (
                  <div key={wp.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="aspect-[2/3] relative group">
                      <img src={wp.url} alt={wp.title} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(wp.url);
                            alert("URL Copied!");
                          }}
                          className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">content_copy</span>
                          Copy URL
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{wp.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 break-all line-clamp-1">{wp.url}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Grid View */
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#1e293b' }}>Collections</h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Group wallpapers into themed collections</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] font-mono bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 w-fit">
                  <span className="material-symbols-outlined text-sm">api</span>
                  <span>Global API: /api/collections</span>
                  <div className="flex items-center gap-2 ml-2">
                    <button 
                      onClick={() => {
                        const url = `${window.location.origin}/api/collections`;
                        navigator.clipboard.writeText(url);
                        alert("Global API URL Copied!");
                      }}
                      className="hover:text-blue-800 flex items-center"
                      title="Copy URL"
                    >
                      <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    </button>
                    <button 
                      onClick={() => handlePreview('/api/collections')}
                      className="hover:text-blue-800 flex items-center"
                      title="Preview JSON"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                    </button>
                  </div>
                </div>
                <div className="mt-1 text-[10px] text-slate-400 font-mono">
                  API Key: {API_KEY} (Use in 'x-api-key' header for Android)
                </div>
              </div>
              <button 
                onClick={() => {
                  setEditingCollection(null);
                  setNewName('');
                  setNewAppId('');
                  setNewDescription('');
                  setIsModalOpen(true);
                }}
                className="bg-primary hover:bg-blue-700 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer"
                style={{ color: '#ffffff !important' } as React.CSSProperties}
              >
                <span className="material-symbols-outlined text-xl">add</span>
                <span>New Collection</span>
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
                <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-slate-400">collections_bookmark</span>
                </div>
                <p className="text-slate-500 text-lg">No collections yet</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 text-primary font-semibold hover:underline cursor-pointer"
                >
                  Create your first collection
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {collections.map((coll) => (
                  <div 
                    key={coll.id} 
                    onClick={() => setSelectedCollection(coll)}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
                  >
                    <div className="h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 relative">
                      {coll.coverImage && (
                        <div 
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url('${coll.coverImage}')` }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                        <span className="text-white text-xs font-medium bg-black/30 px-2 py-1 rounded-lg">
                          {coll.wallpaperCount || 0} wallpapers
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900">{coll.name}</h3>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{coll.description || 'No description'}</p>
                          
                          <div className="mt-3 flex flex-col gap-2">
                            {coll.appId && (
                              <div className="flex items-center gap-2 text-[10px] font-mono bg-slate-50 p-1.5 rounded border border-slate-100 text-slate-500">
                                <span className="truncate">App API: ?appId={coll.appId}</span>
                                <div className="ml-auto flex items-center gap-1.5">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const url = `${window.location.origin}/api/collections?appId=${coll.appId}`;
                                      navigator.clipboard.writeText(url);
                                      alert("App API URL Copied!");
                                    }}
                                    className="hover:text-primary"
                                    title="Copy URL"
                                  >
                                    <span className="material-symbols-outlined text-sm">content_copy</span>
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePreview(`/api/collections?appId=${coll.appId}`);
                                    }}
                                    className="hover:text-primary"
                                    title="Preview JSON"
                                  >
                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                  </button>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-[10px] font-mono bg-slate-50 p-1.5 rounded border border-slate-100 text-slate-500">
                              <span className="truncate">Wallpapers API</span>
                              <div className="ml-auto flex items-center gap-1.5">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const url = `${window.location.origin}/api/collections/${encodeURIComponent(coll.name)}/wallpapers`;
                                    navigator.clipboard.writeText(url);
                                    alert("Wallpapers API URL Copied!");
                                  }}
                                  className="hover:text-primary"
                                  title="Copy URL"
                                >
                                  <span className="material-symbols-outlined text-sm">content_copy</span>
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePreview(`/api/collections/${encodeURIComponent(coll.name)}/wallpapers`);
                                  }}
                                  className="hover:text-primary"
                                  title="Preview JSON"
                                >
                                  <span className="material-symbols-outlined text-sm">visibility</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(coll);
                            }}
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(coll.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                {editingCollection ? 'Edit Collection' : 'New Collection'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Collection Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. Dark Themes, Landscapes"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">App ID (for API filtering)</label>
                <input
                  type="text"
                  value={newAppId}
                  onChange={(e) => setNewAppId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. nature_app_01"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  placeholder="Describe this collection..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-blue-700 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-4 cursor-pointer"
                style={{ color: '#ffffff !important' } as React.CSSProperties}
              >
                <span className="material-symbols-outlined">{editingCollection ? 'save' : 'add'}</span>
                <span>{editingCollection ? 'Save Changes' : 'Create Collection'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Preview JSON Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPreviewOpen(false)} />
          <div className="relative bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">visibility</span>
                <h3 className="text-xl font-bold text-slate-900">JSON Preview</h3>
              </div>
              <button onClick={() => setIsPreviewOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-slate-900">
              <pre className="text-green-400 font-mono text-xs leading-relaxed">
                {JSON.stringify(previewData, null, 2)}
              </pre>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(previewData, null, 2));
                  alert("JSON Copied!");
                }}
                className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
                Copy JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;

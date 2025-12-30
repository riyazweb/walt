import React, { useState } from 'react';
import { storage, db, auth } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, increment } from 'firebase/firestore';

interface UploadModalProps {

  isOpen: boolean;
  onClose: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [existingCollections, setExistingCollections] = useState<string[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      const fetchCollections = async () => {
        const querySnapshot = await getDocs(collection(db, 'collections'));
        const names = querySnapshot.docs.map(doc => doc.data().name);
        setExistingCollections(names);
        if (names.length > 0) {
          setCollectionName(names[0]);
        } else {
          setIsCreatingNew(true);
        }
      };
      fetchCollections();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !auth.currentUser) return;

    setUploading(true);
    setProgress(10); // Start progress

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('collectionName', collectionName || 'Uncategorized');

      // Use relative path for production, localhost for development
      const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000/api/upload' : '/api/upload';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      setUploadedUrl(data.url);
      setProgress(100);

      // 1. Save wallpaper metadata
      await addDoc(collection(db, 'wallpapers'), {
        title,
        collectionName: collectionName || 'Uncategorized',
        url: data.url,
        fileName: data.name,
        userId: auth.currentUser?.uid,
        userName: auth.currentUser?.displayName,
        createdAt: serverTimestamp(),
      });

      // 2. Update or Create Collection
      const collName = collectionName || 'Uncategorized';
      const collectionsRef = collection(db, 'collections');
      const q = query(collectionsRef, where('name', '==', collName));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Create new collection
        await addDoc(collectionsRef, {
          name: collName,
          description: `Wallpapers in ${collName}`,
          wallpaperCount: 1,
          coverImage: data.url,
          createdAt: serverTimestamp(),
        });
      } else {
        // Update existing collection
        const collectionDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'collections', collectionDoc.id), {
          wallpaperCount: increment(1),
          coverImage: data.url, // Update cover to latest upload
        });
      }

      setUploading(false);
      setSuccess(true);
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploading(false);
      alert(`Upload Error: ${error.message}\n\nCheck if your Google Cloud Service Account has "Storage Object Admin" permissions for the bucket "waltbuck1".`);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setTitle('');
    setCollectionName('');
    setFile(null);
    setUploadedUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">Upload Wallpaper</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleUpload} className="p-6 space-y-4">
          {success ? (
            <div className="py-4 text-center space-y-4">
              <div className="size-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
              <p className="text-xl font-bold text-slate-900">Upload Successful!</p>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Google Cloud URL</p>
                <div className="flex items-center gap-2">
                  <input 
                    readOnly 
                    value={uploadedUrl} 
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 focus:outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(uploadedUrl);
                      alert("URL Copied!");
                    }}
                    className="bg-primary text-white p-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Wallpaper Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="e.g. Neon Tokyo"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Collection</label>
                    <button 
                      type="button"
                      onClick={() => setIsCreatingNew(!isCreatingNew)}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      {isCreatingNew ? "Select Existing" : "+ Create New"}
                    </button>
                  </div>
                  
                  {isCreatingNew ? (
                    <input
                      type="text"
                      required
                      value={collectionName}
                      onChange={(e) => setCollectionName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="New collection name..."
                    />
                  ) : (
                    <select
                      value={collectionName}
                      onChange={(e) => setCollectionName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      {existingCollections.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Image</label>
                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="size-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-500 group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                  </div>
                  <p className="text-sm font-medium text-slate-600">
                    {file ? file.name : "Click or drag to upload image"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WebP (Max 10MB)</p>
                </div>
              </div>

              {uploading && (
                <div className="space-y-2 pt-2">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-center font-bold text-primary">Uploading... {Math.round(progress)}%</p>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || !file}
                className="w-full bg-primary hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                style={{ color: '#ffffff !important' } as React.CSSProperties}
              >
                {uploading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined">upload</span>
                )}
                <span>{uploading ? "Uploading..." : "Upload Now"}</span>
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );

};

export default UploadModal;

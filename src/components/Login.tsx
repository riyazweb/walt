import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const Login: React.FC = () => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light px-4 font-display">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-slate-200 text-center transition-all">
        <div className="flex justify-center mb-8">
          <div className="size-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
            <span className="material-symbols-outlined text-5xl">wallpaper</span>
          </div>
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">WALTPAPER</h2>
        <p className="text-slate-500 mb-10 font-medium leading-relaxed">
          The ultimate wallpaper management dashboard. <br/>
          Sign in to start uploading and organizing.
        </p>
        
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-4 bg-white text-slate-900 font-bold py-4 px-6 rounded-2xl border-2 border-slate-100 hover:border-primary hover:bg-slate-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-sm cursor-pointer"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="size-6" />
          Continue with Google
        </button>
        
        <div className="mt-10 pt-8 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
            Secure Admin Access Only
          </p>
        </div>
      </div>
    </div>
  );
};


export default Login;

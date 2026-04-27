'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if an account exists
    const authData = localStorage.getItem('rapidshield_auth');
    if (authData) {
      setIsFirstTime(false);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Testing Mode: Accept ANY random values
    if (!username || !password) {
      setError('Operator ID and Passcode are required to authorize access.');
      return;
    }

    if (isFirstTime) {
      // Create Account with whatever is entered
      const newAuth = { username, password };
      localStorage.setItem('rapidshield_auth', JSON.stringify(newAuth));
      router.push('/setup');
    } else {
      // Testing Mode Bypass: Just accept the login and navigate
      const setupComplete = localStorage.getItem('rapidshield_setup_complete');
      if (setupComplete) {
        router.push('/');
      } else {
        router.push('/setup');
      }
    }
  };

  if (isLoading) {
    return <div className="animate-pulse flex justify-center text-on-background">Establishing Secure Connection...</div>;
  }

  return (
    <div className="glass-panel rounded-2xl p-8 md:p-12 w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
      
      {/* Decorative scanline overlay */}
      <div className="absolute inset-0 scanline pointer-events-none opacity-50 z-0"></div>

      {/* Brand Logo */}
      <div className="flex flex-col items-center gap-4 mb-8 relative z-10">
        <div className="w-16 h-16 bg-primary/10 dark:bg-primary-container/20 border border-primary/20 flex items-center justify-center rounded-2xl shadow-sm">
          <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-widest text-primary uppercase leading-none">RAPIDSHIELD</h1>
          <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mt-2">Authentication Gateway</p>
        </div>
      </div>

      <div className="w-full mb-6 relative z-10">
        <h2 className="text-2xl font-bold text-on-surface text-center">
          {isFirstTime ? 'Initialize Command Center' : 'Operator Authorization'}
        </h2>
        <p className="text-on-surface-variant text-center mt-3 text-sm leading-relaxed max-w-sm mx-auto">
          {isFirstTime 
            ? 'Establish your master credentials. This will secure the central hub for dispatching and coordinating crisis response units.' 
            : 'Welcome back. Enter your secure operator credentials to access real-time critical infrastructure data.'}
        </p>
      </div>

      {error && (
        <div className="relative z-10 w-full bg-error-container text-on-error-container p-3 rounded-lg mb-6 text-sm font-medium text-center border border-error/20 flex items-center justify-center gap-2 shadow-sm">
          <span className="material-symbols-outlined text-lg">error</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full space-y-5 relative z-10">
        <div className="space-y-2">
          <label className="text-sm font-bold text-on-surface ml-1 flex justify-between">
            <span>Operator ID</span>
            <span className="text-xs text-on-surface-variant font-normal">Test Mode: Enter any ID</span>
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">badge</span>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-12 pr-4 py-3.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono shadow-inner"
              placeholder="e.g. ALPHA_COMMAND_01"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-on-surface ml-1 flex justify-between">
            <span>Security Passcode</span>
            <span className="text-xs text-on-surface-variant font-normal">Test Mode: Enter any pass</span>
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-12 pr-12 py-3.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono shadow-inner tracking-widest"
              placeholder="••••••••••••"
            />
            {/* Hold to reveal */}
            <button
              type="button"
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
              onMouseLeave={() => setShowPassword(false)}
              onTouchStart={() => setShowPassword(true)}
              onTouchEnd={() => setShowPassword(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors select-none bg-surface-container hover:bg-surface-container-high border border-outline-variant/50"
              tabIndex={-1}
              title="Hold to reveal"
            >
              <span className="material-symbols-outlined text-lg leading-none">
                {showPassword ? 'visibility' : 'visibility_off'}
              </span>
            </button>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full btn-premium text-white font-bold py-4 rounded-xl mt-8 flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          {isFirstTime ? 'Establish Secure Connection' : 'Authorize & Enter'}
          <span className="material-symbols-outlined animate-pulse">
            {isFirstTime ? 'satellite_alt' : 'verified_user'}
          </span>
        </button>
        
        <p className="text-center text-xs text-on-surface-variant font-mono mt-4 opacity-70">
          SECURE ENCLAVE ACTIVE • {new Date().getFullYear()}
        </p>
      </form>
      
    </div>
  );
}

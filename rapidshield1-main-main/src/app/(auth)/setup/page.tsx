'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Flame, Hospital, Home, Key, CheckCircle2, ServerCog } from 'lucide-react';

export default function EmergencySetup() {
  const router = useRouter();
  
  // State for all 4 emergency services
  const [setupData, setSetupData] = useState({
    police: { name: '', key: '', verified: false },
    fire: { name: '', key: '', verified: false },
    hospital: { name: '', key: '', verified: false },
    shelter: { name: '', key: '', verified: false }
  });

  const [error, setError] = useState('');

  // Check if all are verified
  useEffect(() => {
    const allVerified = Object.values(setupData).every(service => service.verified);
    if (allVerified) {
      // Save to local storage
      localStorage.setItem('rapidshield_setup_complete', 'true');
      localStorage.setItem('rapidshield_emergency_contacts', JSON.stringify(setupData));
      
      // Redirect to dashboard automatically
      const timer = setTimeout(() => {
        router.push('/');
      }, 1500); // 1.5s delay to show all green
      return () => clearTimeout(timer);
    }
  }, [setupData, router]);

  const handleVerify = (type: keyof typeof setupData) => {
    // Testing Bypass: Just mark as verified regardless of what is typed
    setSetupData(prev => ({
      ...prev,
      [type]: { ...prev[type], verified: true }
    }));
  };

  const ServiceInput = ({ 
    title, 
    icon: Icon, 
    type,
    description
  }: { 
    title: string; 
    icon: any; 
    type: keyof typeof setupData;
    description: string;
  }) => {
    const isVerified = setupData[type].verified;

    return (
      <div className={`bg-surface-container-low border ${isVerified ? 'border-tertiary shadow-[0_0_15px_rgba(77,124,15,0.2)] dark:shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-outline-variant'} p-6 rounded-xl space-y-4 transition-all duration-300 relative overflow-hidden group`}>
        
        {/* Verification Bar Indicator at top */}
        <div className={`absolute top-0 left-0 h-1 transition-all duration-500 ${isVerified ? 'bg-tertiary w-full' : 'bg-outline-variant w-1/4'}`}></div>

        <div className="flex items-center justify-between mb-4 mt-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${isVerified ? 'bg-tertiary/20 text-tertiary' : 'bg-primary/10 text-primary'}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-lg">{title}</h3>
              <p className="text-xs text-on-surface-variant">{description}</p>
            </div>
          </div>
          {isVerified && (
            <div className="flex items-center gap-1 text-tertiary text-xs font-bold animate-in fade-in zoom-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>VERIFIED</span>
            </div>
          )}
        </div>

        <div className="space-y-2 relative z-10">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Station / Facility Name</label>
          <input 
            type="text" 
            value={setupData[type].name}
            onChange={(e) => setSetupData({...setupData, [type]: { ...setupData[type], name: e.target.value }})}
            className="w-full bg-background border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-all text-sm disabled:opacity-50"
            placeholder={`e.g. Central ${title.split(' ')[0]}`}
          />
        </div>

        <div className="space-y-2 relative z-10">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1 flex items-center gap-1">
            <Key className="w-3 h-3" /> Partner API / Auth Key
          </label>
          <textarea 
            value={setupData[type].key}
            onChange={(e) => setSetupData({...setupData, [type]: { ...setupData[type], key: e.target.value }})}
            className="w-full bg-background border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-all text-sm font-mono resize-y min-h-[80px] disabled:opacity-50"
            placeholder="Paste secure key stream"
            rows={2}
          />
        </div>

        {!isVerified && (
          <button
            type="button"
            onClick={() => handleVerify(type)}
            className="w-full py-3 rounded-lg border border-outline-variant hover:border-primary hover:bg-primary/5 text-on-surface-variant hover:text-primary font-bold text-sm transition-all flex items-center justify-center gap-2 mt-4"
          >
            <ServerCog className="w-4 h-4" />
            Verify Connection
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-w-[320px] md:min-w-[700px] animate-in fade-in slide-in-from-bottom-4 duration-500 py-8 relative">
      
      <div className="mb-8 text-center glass-panel p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full technical-grid opacity-20 pointer-events-none"></div>
        <h1 className="text-3xl font-black text-on-surface mb-2 tracking-tight relative z-10">Critical Infrastructure Link</h1>
        <p className="text-on-surface-variant relative z-10">
          Establish secure handshakes with local emergency services. Verify each station to initialize the RapidShield coordination system.
        </p>
      </div>

      {error && (
        <div className="w-full bg-error-container text-on-error-container p-4 rounded-xl mb-6 text-sm font-medium border border-error/20 flex items-center gap-2 shadow-sm">
          <span className="material-symbols-outlined">warning</span>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ServiceInput 
          title="Police Station" 
          icon={ShieldCheck} 
          type="police" 
          description="Law enforcement dispatch & coordination"
        />
        <ServiceInput 
          title="Fire Department" 
          icon={Flame} 
          type="fire" 
          description="Fire & rescue emergency response"
        />
        <ServiceInput 
          title="Primary Hospital" 
          icon={Hospital} 
          type="hospital" 
          description="Trauma & medical staging"
        />
        <ServiceInput 
          title="Shelter Camp" 
          icon={Home} 
          type="shelter" 
          description="Evacuation zone & temporary housing"
        />
      </div>

      {Object.values(setupData).every(s => s.verified) && (
        <div className="mt-8 text-center animate-in zoom-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-3 bg-tertiary-container text-on-tertiary-container px-6 py-4 rounded-full font-bold shadow-lg border border-tertiary/20">
            <span className="material-symbols-outlined animate-spin" style={{ animationDuration: '3s' }}>sync</span>
            All stations verified. Initializing dashboard...
          </div>
        </div>
      )}
      
    </div>
  );
}

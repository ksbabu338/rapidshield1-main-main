'use client';

import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { Server, Save, MapPin, Building, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VenueSetup() {
  const { state, updateState, isRPi5Online } = useApp();
  const [config, setConfig] = useState(state.config);
  const router = useRouter();

  const handleSave = async () => {
    await updateState('UPDATE_CONFIG', { config });
    router.push('/employees');
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
          <ShieldCheck className="mr-3 h-8 w-8 text-emerald-500" /> Venue Configuration
        </h1>
        <p className="text-gray-400">Step 1: Define the physical parameters of the venue and connect the Edge AI unit.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 space-y-8 shadow-xl">
        
        {/* RPi5 Connection Status */}
        <div className={`p-4 rounded-lg border flex items-center justify-between ${
          isRPi5Online ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'
        }`}>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${isRPi5Online ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              <Server className="h-6 w-6" />
            </div>
            <div>
              <h3 className={`font-bold ${isRPi5Online ? 'text-emerald-400' : 'text-red-400'}`}>
                {isRPi5Online ? 'RPi5 Edge Unit Connected' : 'RPi5 Edge Unit Offline'}
              </h3>
              <p className="text-sm text-gray-400">
                {isRPi5Online 
                  ? 'Receiving heartbeat on local network. AI models active.' 
                  : 'No heartbeat detected. Ensure RPi5 is powered on and connected to network.'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono text-gray-500 bg-gray-950 px-3 py-1 rounded">
              Device ID: {config.rpi5DeviceId}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400">Venue Name</label>
            <input 
              type="text" 
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              value={config.name}
              onChange={e => setConfig({...config, name: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400">Venue Type</label>
            <div className="relative">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <select 
                className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                value={config.type}
                onChange={e => setConfig({...config, type: e.target.value as any})}
              >
                <option value="Hospital">Hospital / Medical Center</option>
                <option value="Hotel">Hotel / Resort</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400">Number of Floors</label>
            <input 
              type="number" 
              min="1"
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              value={config.floors}
              onChange={e => setConfig({...config, floors: parseInt(e.target.value) || 1})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400">GPS Coordinates</label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input 
                  type="number" 
                  step="0.0001"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-3 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  value={config.gps.lat}
                  onChange={e => setConfig({...config, gps: { ...config.gps, lat: parseFloat(e.target.value) }})}
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input 
                  type="number" 
                  step="0.0001"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-3 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  value={config.gps.lng}
                  onChange={e => setConfig({...config, gps: { ...config.gps, lng: parseFloat(e.target.value) }})}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800 flex justify-end">
          <button 
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors shadow-lg shadow-emerald-500/20"
          >
            <span>Next: Add Employees</span>
            <Save className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

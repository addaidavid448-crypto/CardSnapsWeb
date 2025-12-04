import React, { useState } from 'react';
import { Shield, Lock, EyeOff, AlertTriangle, Activity, Smartphone, Calculator, AlertOctagon, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import { SecuritySettings, SecurityLog } from '../types';

interface SecurityCenterProps {
  settings: SecuritySettings;
  logs: SecurityLog[];
  onUpdateSettings: (newSettings: SecuritySettings) => void;
  onWipeData: () => void;
}

const SecurityCenter: React.FC<SecurityCenterProps> = ({ settings, logs, onUpdateSettings, onWipeData }) => {
  const [showLogs, setShowLogs] = useState(false);
  const [pinMode, setPinMode] = useState<'real' | 'fake'>('real');
  const [newPin, setNewPin] = useState('');

  const toggleSetting = (key: keyof SecuritySettings) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key]
    });
  };

  const handleChangePin = () => {
    if (newPin.length !== 4) return alert("PIN must be 4 digits");
    if (pinMode === 'real') {
      onUpdateSettings({ ...settings, pin: newPin });
    } else {
      onUpdateSettings({ ...settings, fakePin: newPin });
    }
    setNewPin('');
    alert(`${pinMode === 'real' ? 'Main' : 'Fake'} PIN updated successfully.`);
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleString();

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Shield className="text-brand-600" size={32} />
          Security Center
        </h1>
        <p className="text-gray-500 mt-2">Manage encryption, biometric access, and vault protection.</p>
      </header>

      {/* Security Health Status */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 text-white mb-8 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">System Secure</h2>
            <p className="text-emerald-100 text-sm">AES-256 Encryption Active</p>
          </div>
          <div className="p-3 bg-white/20 rounded-full">
            <Check size={24} />
          </div>
        </div>
        <div className="flex gap-4 text-xs font-medium">
          <span className="px-3 py-1 bg-black/20 rounded-full">Monitoring Active</span>
          <span className="px-3 py-1 bg-black/20 rounded-full">Vault Locked</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Access Control */}
        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Lock size={20} className="text-gray-400" /> Access Control
          </h3>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">Biometric Unlock</p>
                <p className="text-xs text-gray-500">FaceID / Fingerprint</p>
              </div>
              <button onClick={() => toggleSetting('biometricEnabled')} className="text-brand-600">
                {settings.biometricEnabled ? <ToggleRight size={40} /> : <ToggleLeft size={40} className="text-gray-300" />}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">Auto-Lock Timer</p>
                <p className="text-xs text-gray-500">Lock when idle</p>
              </div>
              <select 
                value={settings.autoLockTimeout}
                onChange={(e) => onUpdateSettings({...settings, autoLockTimeout: Number(e.target.value)})}
                className="bg-gray-50 border border-gray-200 rounded-lg text-sm p-2 outline-none"
              >
                <option value={60000}>1 min</option>
                <option value={300000}>5 mins</option>
                <option value={600000}>10 mins</option>
              </select>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-900 mb-3">Change PIN</p>
              <div className="flex gap-2 mb-2">
                <button 
                  onClick={() => setPinMode('real')}
                  className={`px-3 py-1 text-xs rounded-full ${pinMode === 'real' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  Real Vault
                </button>
                <button 
                  onClick={() => setPinMode('fake')}
                  className={`px-3 py-1 text-xs rounded-full ${pinMode === 'fake' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  Fake Vault
                </button>
              </div>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  maxLength={4} 
                  placeholder="New 4-digit PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm"
                />
                <button onClick={handleChangePin} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Update
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Protection */}
        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield size={20} className="text-gray-400" /> Advanced Defense
          </h3>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                   Stealth Mode <Calculator size={14} />
                </p>
                <p className="text-xs text-gray-500">Disguise app as Calculator</p>
              </div>
              <button onClick={() => toggleSetting('stealthMode')} className="text-brand-600">
                {settings.stealthMode ? <ToggleRight size={40} /> : <ToggleLeft size={40} className="text-gray-300" />}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                   Screen Guard <EyeOff size={14} />
                </p>
                <p className="text-xs text-gray-500">Blur on app switch</p>
              </div>
              <button onClick={() => toggleSetting('screenProtection')} className="text-brand-600">
                {settings.screenProtection ? <ToggleRight size={40} /> : <ToggleLeft size={40} className="text-gray-300" />}
              </button>
            </div>

            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <div className="flex justify-between items-center mb-2">
                 <p className="font-bold text-red-800 flex items-center gap-2">
                   <AlertOctagon size={16} /> Self-Destruct
                 </p>
                 <button onClick={() => toggleSetting('selfDestructEnabled')} className="text-red-600">
                   {settings.selfDestructEnabled ? <ToggleRight size={40} /> : <ToggleLeft size={40} className="text-red-300" />}
                 </button>
              </div>
              <p className="text-xs text-red-600 leading-relaxed">
                If enabled, all data will be permanently wiped after 5 failed PIN attempts.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Emergency Zone */}
      <section className="mt-8">
         <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-4 rounded-xl transition" onClick={() => setShowLogs(!showLogs)}>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Activity size={20} /> Security Activity Logs
            </h3>
            <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-600">{logs.length} Events</span>
         </div>
         
         {showLogs && (
           <div className="mt-4 bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="p-3">Time</th>
                      <th className="p-3">Event</th>
                      <th className="p-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.slice().reverse().map(log => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="p-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(log.timestamp)}</td>
                        <td className="p-3 font-medium text-gray-900">
                          <span className={`px-2 py-1 rounded-md text-[10px] ${log.event === 'LOGIN_FAILED' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                            {log.event.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">{log.details}</td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr><td colSpan={3} className="p-4 text-center text-gray-400">No logs recorded</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
           </div>
         )}

         <button 
           onClick={() => { if(confirm("EMERGENCY: Are you sure you want to WIPE ALL DATA immediately? This cannot be undone.")) onWipeData(); }}
           className="mt-8 w-full py-4 border-2 border-dashed border-red-300 rounded-xl flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 hover:border-red-500 transition font-bold"
         >
            <AlertTriangle size={20} /> EMERGENCY WIPE DATA
         </button>
      </section>

    </div>
  );
};

export default SecurityCenter;
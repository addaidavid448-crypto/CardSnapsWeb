
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet as WalletIcon, Settings, Plus, User, Shield, Lock, Calculator, AlertTriangle, FileText } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Wallet from './components/Wallet';
import Scanner from './components/Scanner';
import Premium from './components/Premium';
import SecurityCenter from './components/SecurityCenter';
import { AppRoute, CardData, UserSettings, SecurityLog, SecuritySettings } from './types';
import { MOCK_CARDS, MOCK_FAKE_CARDS, MAX_FREE_SCANS, DEFAULT_SECURITY_SETTINGS } from './constants';
import { encryptData, decryptData } from './utils/encryption';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showScanner, setShowScanner] = useState(false);
  const [cards, setCards] = useState<CardData[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    isPremium: false,
    scanCount: 0,
    security: DEFAULT_SECURITY_SETTINGS,
    logs: []
  });
  
  // Auth State
  const [isAuth, setIsAuth] = useState(false);
  const [isFakeSession, setIsFakeSession] = useState(false); // Fake Vault Mode
  const [pinInput, setPinInput] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedByTimer, setIsLockedByTimer] = useState(false);

  // Refs for timers
  const lastActiveRef = useRef<number>(Date.now());

  // --- INITIALIZATION ---
  useEffect(() => {
    // Load Encryption Key or Data
    const savedCardsEncrypted = localStorage.getItem('cardsnap_cards_enc');
    const savedSettingsEncrypted = localStorage.getItem('cardsnap_settings_enc');
    
    if (savedCardsEncrypted) {
      const decrypted = decryptData(savedCardsEncrypted);
      if (decrypted) setCards(decrypted);
      else console.error("Data corruption or decryption error");
    } else {
      setCards(MOCK_CARDS);
    }

    if (savedSettingsEncrypted) {
      const decrypted = decryptData(savedSettingsEncrypted);
      if (decrypted) setUserSettings(decrypted);
      else setUserSettings(prev => ({...prev, security: DEFAULT_SECURITY_SETTINGS}));
    }
  }, []);

  // --- PERSISTENCE (ENCRYPTED) ---
  useEffect(() => {
    // Only save if we are NOT in fake session to prevent overwriting real data with fake data state
    if (!isFakeSession && isAuth) {
      const encryptedCards = encryptData(cards);
      localStorage.setItem('cardsnap_cards_enc', encryptedCards);
    }
  }, [cards, isFakeSession, isAuth]);

  useEffect(() => {
    if (!isFakeSession && isAuth) {
       const encryptedSettings = encryptData(userSettings);
       localStorage.setItem('cardsnap_settings_enc', encryptedSettings);
    }
  }, [userSettings, isFakeSession, isAuth]);

  // --- SECURITY: LOGGING ---
  const addLog = (event: SecurityLog['event'], details: string) => {
    const newLog: SecurityLog = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      event,
      details
    };
    setUserSettings(prev => ({
      ...prev,
      logs: [...prev.logs, newLog]
    }));
  };

  // --- SECURITY: STEALTH MODE & SCREEN PROTECTION ---
  useEffect(() => {
    // Stealth Mode: Change Title
    if (userSettings.security.stealthMode) {
      document.title = "Calculator";
    } else {
      document.title = "CardSnap Web";
    }

    // Screen Protection: Blur on visibility change
    const handleVisibilityChange = () => {
      if (document.hidden && userSettings.security.screenProtection) {
        // App went to background
        document.body.style.filter = 'blur(10px)';
      } else {
        // App came to foreground
        document.body.style.filter = 'none';
        
        // Check auto-lock timer
        const now = Date.now();
        const inactiveTime = now - lastActiveRef.current;
        if (userSettings.security.autoLockEnabled && inactiveTime > userSettings.security.autoLockTimeout && isAuth) {
          setIsAuth(false);
          setIsLockedByTimer(true);
        }
        lastActiveRef.current = now;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [userSettings.security, isAuth]);

  // --- SECURITY: IDLE TIMER ---
  const resetIdleTimer = useCallback(() => {
    lastActiveRef.current = Date.now();
    if (isLockedByTimer) setIsLockedByTimer(false);
  }, [isLockedByTimer]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(e => document.addEventListener(e, resetIdleTimer));
    
    // Check interval
    const interval = setInterval(() => {
      if (isAuth && userSettings.security.autoLockEnabled) {
        const now = Date.now();
        if (now - lastActiveRef.current > userSettings.security.autoLockTimeout) {
           setIsAuth(false);
           setIsLockedByTimer(true);
        }
      }
    }, 5000);

    return () => {
      events.forEach(e => document.removeEventListener(e, resetIdleTimer));
      clearInterval(interval);
    };
  }, [isAuth, userSettings.security.autoLockEnabled, userSettings.security.autoLockTimeout, resetIdleTimer]);


  // --- ACTIONS ---

  const handleUnlock = () => {
    if (pinInput === userSettings.security.pin) {
      // REAL UNLOCK
      setIsAuth(true);
      setIsFakeSession(false);
      setFailedAttempts(0);
      setPinInput('');
      addLog('LOGIN_SUCCESS', 'Auth via Main PIN');
    } else if (pinInput === userSettings.security.fakePin) {
      // FAKE VAULT UNLOCK
      setIsAuth(true);
      setIsFakeSession(true); // Enable Fake Mode
      setFailedAttempts(0);
      setPinInput('');
      addLog('FAKE_VAULT_ACCESS', 'Auth via Duress PIN');
    } else {
      // FAILURE
      const newFailCount = failedAttempts + 1;
      setFailedAttempts(newFailCount);
      setPinInput('');
      addLog('LOGIN_FAILED', `Attempt ${newFailCount}/5`);

      // SELF DESTRUCT
      if (userSettings.security.selfDestructEnabled && newFailCount >= 5) {
        handleWipeData();
      } else {
        alert(`Incorrect PIN. Attempt ${newFailCount}/5`);
      }
    }
  };

  const handleWipeData = () => {
    localStorage.clear();
    setCards([]);
    setUserSettings({
       isPremium: false,
       scanCount: 0,
       security: DEFAULT_SECURITY_SETTINGS,
       logs: []
    });
    setIsAuth(false);
    setFailedAttempts(0);
    alert("SECURITY PROTOCOL ACTIVATED: All data has been wiped.");
    addLog('DATA_WIPE', 'Self-destruct triggered');
    window.location.reload();
  };

  const handleScanComplete = (newCard: CardData) => {
    if (isFakeSession) {
      alert("Cannot add cards in Fake Vault mode.");
      return;
    }
    setCards(prev => [newCard, ...prev]);
    setShowScanner(false);
    setUserSettings(prev => ({ ...prev, scanCount: prev.scanCount + 1 }));
    navigate('/wallet');
  };

  const handleDeleteCard = (id: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      setCards(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleCardUse = (id: string) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, usageCount: (card.usageCount || 0) + 1 } : card
    ));
  };

  const handleUpgrade = async () => {
    // This is now only called AFTER the UI payment flow succeeds.
    setUserSettings(prev => ({ ...prev, isPremium: true }));
    addLog('SETTINGS_CHANGE', 'Premium subscription activated');
  };

  const handleScanClick = () => {
    if (isFakeSession) return;
    if (!userSettings.isPremium && userSettings.scanCount >= MAX_FREE_SCANS) {
      navigate('/premium');
      return;
    }
    setShowScanner(true);
  };

  // --- RENDER HELPERS ---
  const activeCards = isFakeSession ? MOCK_FAKE_CARDS : cards;

  // --- LOCK SCREEN ---
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
        {userSettings.security.stealthMode ? (
          // CALCULATOR DISGUISE
          <div className="w-full max-w-xs bg-white rounded-xl overflow-hidden shadow-2xl">
             <div className="bg-gray-800 p-4 text-right text-white text-3xl font-mono h-24 flex items-end justify-end">
               {pinInput || '0'}
             </div>
             <div className="grid grid-cols-4 gap-1 p-2 bg-gray-200">
               {['C', '÷', '×', '⌫', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.'].map((key, i) => (
                 <button 
                   key={i} 
                   onClick={() => {
                     if (key === '=') handleUnlock();
                     else if (key === 'C') setPinInput('');
                     else if (key === '⌫') setPinInput(prev => prev.slice(0, -1));
                     else if (!isNaN(Number(key))) setPinInput(prev => prev + key);
                   }}
                   className={`h-16 text-xl font-bold flex items-center justify-center rounded active:bg-gray-400 transition ${key === '=' ? 'col-span-2 bg-orange-500 text-white' : 'bg-white text-gray-800'}`}
                 >
                   {key}
                 </button>
               ))}
             </div>
             <p className="text-[10px] text-gray-500 p-2 text-center bg-gray-100">Standard Calculator Mode</p>
          </div>
        ) : (
          // STANDARD LOCK SCREEN
          <>
            <div className="w-20 h-20 bg-brand-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-brand-600/20">
              <Shield className="text-white" size={40} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">CardSnap Secure</h1>
            <p className="text-gray-400 mb-8">{isLockedByTimer ? "Session Timed Out" : "Enter PIN to access your wallet"}</p>
            
            <input 
              type="password" 
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              maxLength={4}
              className="bg-gray-800 text-white text-center text-3xl tracking-[1em] w-48 py-3 rounded-xl border border-gray-700 focus:border-brand-500 focus:outline-none mb-6 placeholder-gray-600"
            />
            
            <button 
              onClick={handleUnlock}
              className="bg-white text-gray-900 font-bold py-3 px-12 rounded-xl hover:bg-gray-100 transition mb-4"
            >
              Unlock
            </button>

            {userSettings.security.biometricEnabled && (
               <button onClick={handleUnlock} className="text-brand-400 flex items-center gap-2 text-sm opacity-80 hover:opacity-100">
                 <ScanFaceIcon /> Use FaceID
               </button>
            )}

            {failedAttempts > 0 && (
              <p className="mt-8 text-sm text-red-500 animate-pulse">
                {failedAttempts} Failed Attempts. {userSettings.security.selfDestructEnabled ? `${5 - failedAttempts} until Data Wipe.` : ''}
              </p>
            )}
            
            <p className="mt-8 text-xs text-gray-600 flex items-center gap-1">
              <Lock size={12} /> AES-256 Encrypted Storage
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${isFakeSession ? 'border-4 border-red-500' : ''}`}>
      {/* Fake Vault Warning Banner */}
      {isFakeSession && (
        <div className="bg-red-500 text-white text-xs font-bold text-center py-1">
          FAKE VAULT MODE ACTIVE
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <Routes>
          <Route path="/" element={<Dashboard cards={activeCards} isPremium={userSettings.isPremium} onNavigate={(r) => navigate('/' + r)} />} />
          <Route path="/wallet" element={<Wallet cards={activeCards} onDelete={handleDeleteCard} onUse={handleCardUse} />} />
          <Route path="/premium" element={<Premium isPremium={userSettings.isPremium} onUpgrade={handleUpgrade} />} />
          <Route path="/security" element={
            <SecurityCenter 
              settings={userSettings.security} 
              logs={userSettings.logs}
              onUpdateSettings={(newSec) => {
                 setUserSettings(prev => ({...prev, security: newSec}));
                 addLog('SETTINGS_CHANGE', 'Security settings updated');
              }}
              onWipeData={handleWipeData}
            />
          } />
          <Route path="/settings" element={
            <div className="p-8">
               <h1 className="text-2xl font-bold mb-4">Settings</h1>
               
               <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                  <div 
                    onClick={() => navigate('/security')}
                    className="flex justify-between items-center py-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 -mx-4 px-4"
                  >
                     <span className="flex items-center gap-2 font-medium text-gray-900">
                       <Shield size={20} className="text-brand-600" /> Security Center
                     </span>
                     <span className="text-xs text-gray-400">Configure Lock & Encryption</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-4">
                     <span>Dark Mode</span>
                     <div className="w-10 h-6 bg-gray-200 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div></div>
                  </div>
               </div>

               <div className="mt-8 text-center">
                  <button onClick={() => { setIsAuth(false); setIsFakeSession(false); }} className="text-red-500 font-medium">Log Out</button>
               </div>
            </div>
          } />
        </Routes>
      </main>

      {/* Floating Action Button (Scanner) */}
      {!isFakeSession && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-20">
          <button 
            onClick={handleScanClick}
            className="w-16 h-16 bg-brand-600 rounded-full shadow-lg shadow-brand-600/40 flex items-center justify-center text-white hover:scale-105 transition-transform border-4 border-gray-50"
          >
            <Plus size={32} />
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="h-20 bg-white border-t border-gray-200 flex items-center justify-around px-2 pb-2 z-10">
        <NavLink to="/" className={({isActive}) => `flex flex-col items-center gap-1 p-2 rounded-xl transition ${isActive ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>
        
        <NavLink to="/wallet" className={({isActive}) => `flex flex-col items-center gap-1 p-2 rounded-xl transition ${isActive ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'} mr-8`}>
          <WalletIcon size={24} />
          <span className="text-[10px] font-medium">Wallet</span>
        </NavLink>
        
        <NavLink to="/premium" className={({isActive}) => `flex flex-col items-center gap-1 p-2 rounded-xl transition ${isActive ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'} ml-8`}>
          <User size={24} />
          <span className="text-[10px] font-medium">Premium</span>
        </NavLink>

        <NavLink to="/settings" className={({isActive}) => `flex flex-col items-center gap-1 p-2 rounded-xl transition ${isActive ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <Settings size={24} />
          <span className="text-[10px] font-medium">Settings</span>
        </NavLink>
      </nav>

      {/* Full Screen Scanner Overlay */}
      {showScanner && (
        <Scanner 
          onClose={() => setShowScanner(false)} 
          onScanComplete={handleScanComplete} 
          isPremium={userSettings.isPremium} 
        />
      )}
    </div>
  );
};

// Simple Icon Component for visual consistency
const ScanFaceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h6" /><path d="M4 8v10" /><path d="M20 8v10" /><path d="M9 21h6" /><path d="M8 12h.01" /><path d="M16 12h.01" /><path d="M12 16c-1 0-2-.5-2-1.5" />
  </svg>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;

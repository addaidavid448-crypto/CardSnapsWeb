
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, Zap, Loader2, Image as ImageIcon } from 'lucide-react';
import { analyzeCardImage } from '../services/geminiService';
import { CardData, CardCategory } from '../types';
import { GRADIENTS } from '../constants';

interface ScannerProps {
  onClose: () => void;
  onScanComplete: (card: CardData) => void;
  isPremium: boolean;
}

const Scanner: React.FC<ScannerProps> = ({ onClose, onScanComplete, isPremium }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Capture frame
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get base64 string
      const base64Full = canvas.toDataURL('image/jpeg', 0.8);
      const base64Data = base64Full.split(',')[1];

      // Call Gemini
      const result = await analyzeCardImage(base64Data);

      // Create new card object
      const newCard: CardData = {
        id: crypto.randomUUID(),
        type: result.type || CardCategory.OTHER,
        issuer: result.issuer || 'Unknown Issuer',
        number: result.number || '****',
        holderName: result.holderName || 'Unknown Holder',
        expiryDate: result.expiryDate,
        cvv: result.cvv,
        
        // Business fields
        jobTitle: result.jobTitle,
        email: result.email,
        phone: result.phone,
        
        // ID fields
        dob: result.dob,
        nationality: result.nationality,
        
        usageCount: 0, 
        colorTheme: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
        createdAt: Date.now()
      };

      onScanComplete(newCard);
      
    } catch (err: any) {
      console.error(err);
      setError("Failed to analyze card. Please try again or ensure API Key is set.");
    } finally {
      setIsProcessing(false);
    }
  }, [onScanComplete]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Full = reader.result as string;
        const base64Data = base64Full.split(',')[1];
        const result = await analyzeCardImage(base64Data);
        
        const newCard: CardData = {
          id: crypto.randomUUID(),
          type: result.type || CardCategory.OTHER,
          issuer: result.issuer || 'Unknown Issuer',
          number: result.number || '****',
          holderName: result.holderName || 'Unknown Holder',
          expiryDate: result.expiryDate,
          cvv: result.cvv,
          jobTitle: result.jobTitle,
          email: result.email,
          phone: result.phone,
          dob: result.dob,
          nationality: result.nationality,
          usageCount: 0,
          colorTheme: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
          createdAt: Date.now()
        };
        onScanComplete(newCard);
      } catch (err) {
         setError("Failed to process uploaded image.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/70 to-transparent">
        <h2 className="text-white font-bold text-lg">Scan Document</h2>
        <button onClick={onClose} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-gray-900 overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none z-0">
          <div className="w-full h-full border-2 border-brand-500 relative rounded-lg">
             <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-brand-500 -mt-1 -ml-1"></div>
             <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-brand-500 -mt-1 -mr-1"></div>
             <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-brand-500 -mb-1 -ml-1"></div>
             <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-brand-500 -mb-1 -mr-1"></div>
          </div>
        </div>

        {error && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600/90 text-white px-6 py-4 rounded-xl text-center max-w-xs backdrop-blur">
            <p className="font-medium mb-2">Error</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        )}
      </div>

      <div className="bg-black/80 p-8 pb-12 flex flex-col items-center gap-6 rounded-t-3xl backdrop-blur-lg border-t border-white/10">
        <p className="text-gray-400 text-sm">Align ID, Passport or Card within frame</p>
        
        <div className="flex items-center gap-8 w-full justify-center">
            <label className="p-3 rounded-full bg-gray-800 text-white cursor-pointer hover:bg-gray-700 transition">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isProcessing} />
              <ImageIcon size={24} />
            </label>

            <button 
              onClick={captureAndAnalyze}
              disabled={isProcessing}
              className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all ${isProcessing ? 'bg-gray-600 scale-95' : 'bg-brand-600 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(37,99,235,0.5)]'}`}
            >
              {isProcessing ? (
                <Loader2 className="animate-spin text-white" size={32} />
              ) : (
                <div className="w-16 h-16 rounded-full bg-transparent border-2 border-white/30" />
              )}
            </button>
            
            <button className={`p-3 rounded-full ${isPremium ? 'bg-gray-800 text-yellow-400' : 'bg-gray-800/50 text-gray-600'} hover:bg-gray-700 transition`}>
              <Zap size={24} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Scanner;

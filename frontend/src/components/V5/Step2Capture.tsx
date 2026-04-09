import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Wifi, 
  Navigation, 
  Battery, 
  ShieldAlert,
  Play,
  RotateCcw,
  Video,
  Database
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

export default function Step2Capture({ onAnalyze }: { onAnalyze: (file: File) => void }) {
  const { t } = useTranslation();
  const { vesselInfo, isAnalyzing } = useStore();
  const [captureMode, setCaptureMode] = useState<'drone' | 'manual'>('manual');
  const [isSimulatingStream, setIsSimulatingStream] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAnalyze(e.target.files[0]);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 animate-fade-in relative overflow-hidden bg-black">
      
      {/* HUD OVERLAY PERIMETER */}
      <div className="absolute inset-0 pointer-events-none z-20 border-[40px] border-transparent">
        <div className="w-full h-full border border-white/10 relative">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#e9c349]"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#e9c349]"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#e9c349]"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#e9c349]"></div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* LEFT HUD: TELEMETRY & MODE SELECT */}
        <div className="lg:col-span-3 space-y-4 flex flex-col justify-center">
            <div className="space-y-1 mb-8">
                <h3 className="text-[#e9c349] font-black text-xs uppercase tracking-[0.2em]">Mission Profile</h3>
                <p className="text-white text-xl font-black uppercase tracking-tight truncate">{vesselInfo.name}</p>
                <p className="text-slate-600 text-[10px] font-mono tracking-widest">IMO: {vesselInfo.imo}</p>
            </div>

            <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => setCaptureMode('drone')}
                  className={cn(
                    "p-4 rounded-xl border flex items-center justify-between transition-all",
                    captureMode === 'drone' ? "bg-[#e9c349] border-[#e9c349] text-black" : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10"
                  )}
                >
                    <div className="flex items-center gap-3">
                        <Navigation size={18} />
                        <span className="font-black text-[10px] uppercase tracking-widest">Drone Link</span>
                    </div>
                    <Wifi size={14} className={cn(captureMode === 'drone' && "animate-pulse")} />
                </button>
                <button 
                   onClick={() => setCaptureMode('manual')}
                   className={cn(
                    "p-4 rounded-xl border flex items-center justify-between transition-all",
                    captureMode === 'manual' ? "bg-[#e9c349] border-[#e9c349] text-black" : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10"
                  )}
                >
                    <div className="flex items-center gap-3">
                        <Upload size={18} />
                        <span className="font-black text-[10px] uppercase tracking-widest">Manual Upload</span>
                    </div>
                    <Video size={14} />
                </button>
            </div>

            {captureMode === 'drone' && (
                <div className="bg-black/40 border border-[#e9c349]/20 p-6 rounded-2xl space-y-6 mt-4">
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-slate-500 uppercase">Battery</span>
                     <div className="flex items-center gap-2">
                        <span className="text-white font-mono font-bold text-xs">84%</span>
                        <Battery size={14} className="text-[#00e639]" />
                     </div>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-slate-500 uppercase">Altitude</span>
                     <span className="text-white font-mono font-bold text-xs">12.5m</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-slate-500 uppercase">Link Quality</span>
                     <span className="text-[#00e639] font-mono font-bold text-xs">98ms</span>
                   </div>
                </div>
            )}
        </div>

        {/* MIDDLE: MAIN VIEWPORT / VIEWER */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative bg-[#020617] rounded-[2.5rem] border border-white/5 group shadow-2xl overflow-hidden">
            
            {captureMode === 'drone' ? (
                <div className="flex flex-col items-center space-y-6">
                    <div className="w-24 h-24 border-2 border-dashed border-[#e9c349]/30 rounded-full flex items-center justify-center animate-pulse">
                        <Camera size={40} className="text-[#e9c349]" />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-black uppercase tracking-[0.2em]">{isSimulatingStream ? 'FEED_LIVE' : 'LINKING_TO_UAV...'}</p>
                        <p className="text-slate-500 text-[10px] font-mono mt-2">ENCRYPTED_SIGNAL_0X449</p>
                    </div>
                    <button 
                      onClick={() => setIsSimulatingStream(!isSimulatingStream)}
                      className="px-8 py-3 bg-[#e9c349] text-black font-black uppercase tracking-widest rounded-full text-[10px] hover:scale-105 transition-all"
                    >
                        {isSimulatingStream ? 'DISCONNECT' : 'INITIATE FEED'}
                    </button>
                </div>
            ) : (
                <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="flex flex-col items-center space-y-6 cursor-pointer"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#e9c349] blur-[60px] opacity-10 group-hover:opacity-25 transition-opacity"></div>
                        <div className="relative w-32 h-32 border-2 border-dashed border-[#e9c349]/40 rounded-full flex items-center justify-center group-hover:border-[#e9c349] group-hover:scale-110 transition-all duration-500">
                           <Video size={48} className="text-[#e9c349]" />
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-white font-black uppercase tracking-[0.3em] font-headline">{t('dashboard.awaiting_data')}</p>
                        <p className="text-slate-500 text-[10px] font-mono mt-2 tracking-widest italic flex items-center gap-2 justify-center">
                            <Database size={10} /> SUPPORTS DJI RAW METADATA (.MP4)
                        </p>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="video/*" 
                      onChange={handleFileUpload} 
                    />
                </div>
            )}

            {isAnalyzing && (
                <div className="absolute inset-0 bg-[#0a0e1a]/90 backdrop-blur-xl z-50 flex items-center justify-center animate-fade-in">
                    <div className="flex flex-col items-center space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-[#e9c349] blur-3xl opacity-30 animate-pulse"></div>
                            <RotateCcw size={64} className="text-[#e9c349] animate-spin-slow" />
                        </div>
                        <div className="text-center space-y-2">
                             <h4 className="text-white font-black uppercase tracking-[0.4em] italic leading-none">Analyzing Data</h4>
                             <p className="text-[#e9c349] animate-pulse font-mono text-[8px] uppercase tracking-[0.2rem]">Initializing Neural Pipeline</p>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* RIGHT HUD: MISSION LOGS & ACTION */}
        <div className="lg:col-span-3 space-y-4 flex flex-col justify-center">
            <div className="bg-[#171b28] border border-white/5 p-6 rounded-2xl h-64 flex flex-col">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-3 mb-4">Operations Log</h4>
                <div className="flex-1 font-mono text-[9px] space-y-3 text-slate-500 overflow-y-auto custom-scrollbar">
                    <div className="flex gap-2">
                        <span className="text-[#e9c349]">[OK]</span>
                        <span>MISSION_STANDBY</span>
                    </div>
                    <div className="flex gap-2">
                         <span className="text-[#e9c349]">[OK]</span>
                         <span>TARGET_ACQUIRED_{vesselInfo.imo}</span>
                    </div>
                    <div className="flex gap-2 text-[#00e639]">
                         <span>[SYSTEM]</span>
                         <span>DNV_HARDENED_MODULE_LOADED</span>
                    </div>
                    <div className="flex gap-2 border-t border-white/5 pt-2 mt-2 animate-pulse">
                         <span className="text-[#e9c349]">&gt;</span>
                         <span>WAITING_FOR_OPTICAL_FEED...</span>
                    </div>
                </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-start gap-4">
                <ShieldAlert size={20} className="text-red-500 shrink-0" />
                <div>
                   <h4 className="text-red-500 font-black text-[10px] uppercase">Safety Protocol</h4>
                   <p className="text-slate-500 text-[9px] font-medium leading-relaxed mt-1">Ensure drone is focused on Plimsoll marks and camera level is at 0 degrees for maximum precision.</p>
                </div>
            </div>
        </div>
      </div>

      {/* FOOTER ACTION BUTTONS (OPTIONAL OVERRIDE) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
          <button className="bg-white/5 border border-white/10 px-8 py-3 rounded-full text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-all flex items-center gap-3">
             <Play size={14} className="text-[#e9c349]" /> Begin Tactical Scan
          </button>
      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { Ship, Settings, ChevronLeft, ChevronRight, Save, Anchor, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import HydrostaticEditor from './HydrostaticEditor';

interface VesselCommanderProps {
    vesselInfo: any;
    onUpdateVessel: (info: any) => void;
}

const VesselCommander: React.FC<VesselCommanderProps> = ({ vesselInfo, onUpdateVessel }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showHydroEditor, setShowHydroEditor] = useState(false);
    const { t } = useTranslation();

    const handleSaveHydro = (updatedInfo: any) => {
        onUpdateVessel(updatedInfo);
        setShowHydroEditor(false);
    };

    return (
        <>
            <div className={cn(
                "fixed left-0 top-0 h-full z-50 transition-all duration-500 ease-in-out font-mono border-r border-white/5 backdrop-blur-2xl bg-[#020617]/80",
                isOpen ? "w-80" : "w-12"
            )}>
                {/* Toggle Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black shadow-2xl hover:scale-110 transition-transform cursor-pointer"
                >
                    {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>

                {/* Content */}
                <div className={cn("p-6 flex flex-col h-full space-y-8", !isOpen && "hidden")}>
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                        <Ship className="text-yellow-400" size={24} />
                        <div>
                            <h2 className="text-yellow-400 font-black text-xs tracking-widest">{t('dashboard.vessel_commander')}</h2>
                            <span className="text-[8px] text-slate-500 font-bold uppercase">{t('dashboard.kernel_stable')}</span>
                        </div>
                    </div>

                    {/* Vessel Identity */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-white/40 text-[9px] font-bold uppercase tracking-tighter">
                            <Anchor size={12} />
                            <span>{t('dashboard.tactical_identity')}</span>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-[8px] text-slate-500 font-black mb-1 block uppercase">{t('dashboard.imo_number')}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={vesselInfo.imo || ''}
                                        onChange={(e) => onUpdateVessel({ ...vesselInfo, imo: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white placeholder:text-white/10 focus:border-yellow-400/50 transition-colors"
                                        placeholder="e.g. 9823471"
                                    />
                                    <Search className="absolute right-3 top-3 text-white/20" size={14} />
                                </div>
                            </div>

                            <div>
                                <label className="text-[8px] text-slate-500 font-black mb-1 block uppercase">{t('dashboard.vessel_name')}</label>
                                <input
                                    type="text"
                                    value={vesselInfo.name || ''}
                                    onChange={(e) => onUpdateVessel({ ...vesselInfo, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white placeholder:text-white/10 focus:border-yellow-400/50 transition-colors"
                                    placeholder="MV PACIFIC LEGACY"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tables & Calibration */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-white/40 text-[9px] font-bold uppercase tracking-tighter">
                            <Settings size={12} />
                            <span>{t('dashboard.naval_physics')}</span>
                        </div>
                        <button 
                            onClick={() => setShowHydroEditor(true)}
                            className="w-full bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3 flex items-center justify-between group hover:bg-yellow-400/20 transition-all cursor-pointer"
                        >
                            <span className="text-[10px] text-yellow-400 font-bold">{t('dashboard.hydro_tables')}</span>
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        </button>
                        <div className="text-[7px] text-slate-500 leading-relaxed italic">
                            CubicSpline ISO-12217 ACTIVE. Precision is currently linked to engineering model: {vesselInfo.name || 'DEFAULT_HULL'}.
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/10">
                        <button className="w-full bg-yellow-400 p-4 rounded-xl flex items-center justify-center gap-2 text-black font-black text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-yellow-400/10 cursor-pointer">
                            <Save size={14} />
                            {t('dashboard.commit_changes')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Editor */}
            {showHydroEditor && (
                <HydrostaticEditor 
                    vesselData={vesselInfo}
                    onSave={handleSaveHydro}
                    onClose={() => setShowHydroEditor(false)}
                />
            )}
        </>
    );
};

export default VesselCommander;

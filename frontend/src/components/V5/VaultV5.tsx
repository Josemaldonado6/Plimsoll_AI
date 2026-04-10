import { 
  Archive, 
  Search, 
  X, 
  ShieldAlert, 
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Download
} from 'lucide-react';
import { useStore, Operation, getApiUrl } from '../../store/useStore';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import axios from 'axios';

export default function VaultV5({ onClose }: { onClose: () => void }) {
    const { t, i18n } = useTranslation();
    const { operations, voidOperation, token } = useStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOps = operations.filter(op => 
        op.vessel_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.imo.includes(searchQuery) ||
        op.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDownload = async (op: Operation) => {
        if (!token) return;
        const latestScan = op.scans[op.scans.length - 1];
        if (!latestScan) return;

        try {
            const lang = i18n.language || 'en';
            const url = getApiUrl(`/api/surveys/${latestScan.id}/pdf?lang=${lang}`);
            
            const response = await axios.get(url, {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/pdf',
                    Authorization: `Bearer ${token}`
                }
            });

            const blobUrl = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', `PLIMSOLL_CERT_${op.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Export failed", error);
            alert(t('v5.export_failed', 'Export Failed'));
        }
    };

    const handleInvalidate = (opId: string) => {
        const reason = window.prompt(t('v5.void_reason_prompt', 'Enter reason for invalidation (Legal Requirement):'));
        if (reason) {
            voidOperation(opId, reason);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#0a0e1a]/90 backdrop-blur-2xl flex flex-col p-8 md:p-12 animate-fade-in overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-[#e9c349]/10 rounded-2xl text-[#e9c349]">
                        <Archive size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                            Sovereign Vault
                        </h1>
                        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">
                            Authenticated Mission Ledger // {operations.length} Entries
                        </p>
                    </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all hover:rotate-90"
                >
                    <X size={32} />
                </button>
            </div>

            {/* SEARCH */}
            <div className="relative mb-12">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                    type="text" 
                    placeholder={t('v5.search_vault', 'Search by Vessel, IMO or Mission ID...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#171b28] border border-white/5 rounded-[2rem] py-6 pl-16 pr-8 text-white font-mono text-lg focus:border-[#e9c349]/50 focus:outline-none transition-all shadow-inner"
                />
            </div>

            {/* LIST */}
            <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-4 pb-12">
                {filteredOps.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                        <Archive size={64} className="opacity-20" />
                        <p className="font-black uppercase tracking-widest text-sm">No Ledger Entries Found</p>
                    </div>
                ) : (
                    filteredOps.map((op) => (
                        <div 
                          key={op.id}
                          className={`
                            bg-[#1b1f2c]/50 border rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 transition-all hover:bg-[#1b1f2c]/80
                            ${op.isVoided ? 'border-red-500/30' : 'border-white/5'}
                          `}
                        >
                            <div className="flex items-center gap-8 w-full md:w-auto">
                                <div className={`
                                    w-16 h-16 rounded-2xl flex items-center justify-center shrink-0
                                    ${op.isVoided ? 'bg-red-500/10 text-red-500' : 'bg-[#00e639]/10 text-[#00e639]'}
                                `}>
                                    {op.isVoided ? <ShieldAlert size={28} /> : <CheckCircle2 size={28} />}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight">{op.vessel_name}</h3>
                                        {op.isVoided && (
                                            <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                                                VOIDED
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-xs font-mono">
                                        <span className="text-slate-500">IMO: <span className="text-[#e9c349]">{op.imo}</span></span>
                                        <span className="text-slate-500">ID: <span className="text-slate-300">{op.id}</span></span>
                                        <span className="text-slate-500">{new Date(op.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                                <button
                                    onClick={() => handleDownload(op)}
                                    disabled={op.scans.length === 0}
                                    className="p-4 bg-white/5 hover:bg-[#e9c349] hover:text-black rounded-2xl text-white transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest disabled:opacity-20"
                                >
                                    <Download size={18} /> {t('v5.export_pdf', 'PDF')}
                                </button>
                                
                                {!op.isVoided && (
                                    <button 
                                      onClick={() => handleInvalidate(op.id)}
                                      className="p-4 hover:bg-red-500/10 text-slate-700 hover:text-red-500 rounded-2xl transition-all"
                                      title={t('v5.invalidate', 'Invalidate Entry')}
                                    >
                                        <AlertTriangle size={18} />
                                    </button>
                                )}
                                
                                <div className="bg-white/5 h-12 w-px hidden md:block" />
                                
                                <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[#e9c349] transition-all">
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* FOOTER */}
            <div className="mt-auto pt-8 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-slate-700 px-4">
                <div className="flex items-center gap-4 uppercase">
                    <span className="w-2 h-2 rounded-full bg-[#00e639] animate-pulse"></span>
                    Immutable Ledger Connected
                </div>
                <div className="uppercase">
                    Plimsoll Cyber-Security Framework v5.1 // ISO 27001 COMPLIANT
                </div>
            </div>
        </div>
    );
}

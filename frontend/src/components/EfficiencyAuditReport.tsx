import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

interface AuditData {
    vesselName: string;
    dwt: number;
    currentEfficiency: number;
    projectedEfficiency: number;
    annualSaving: number;
}

export const EfficiencyAuditReport: React.FC<{ data: AuditData }> = ({ data }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-[#020617] text-white p-8 md:p-12 border border-slate-800 rounded-2xl max-w-4xl mx-auto shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-start mb-12 border-b border-slate-800 pb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-[#fde047] mb-2 uppercase">
                        {t('audit_report.title')}
                    </h1>
                    <p className="text-slate-400 font-mono text-sm">{t('audit_report.case_ref')}: {data.vesselName}-{new Date().getFullYear()}</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <ShieldCheck className="text-emerald-400 w-8 h-8" />
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/50">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">{t('audit_report.operational_alpha')}</p>
                    <div className="flex items-center gap-4">
                        <span className="text-4xl font-black">+{data.projectedEfficiency - data.currentEfficiency}%</span>
                        <TrendingUp className="text-emerald-400 w-6 h-6" />
                    </div>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/50">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">{t('audit_report.opex_reduction')}</p>
                    <div className="flex items-center gap-4">
                        <span className="text-4xl font-black text-[#fde047]">${data.annualSaving.toLocaleString()}</span>
                        <Zap className="text-yellow-400 w-6 h-6 fill-current" />
                    </div>
                </div>
            </div>

            {/* Technical Brief */}
            <div className="space-y-6 mb-12">
                <h2 className="text-xl font-bold border-l-4 border-[#fde047] pl-4 uppercase tracking-tighter text-slate-200">
                    {t('audit_report.exec_summary')}
                </h2>
                <p className="text-slate-400 leading-relaxed text-sm">
                    {t('audit_report.summary_desc', {
                        reduction: data.projectedEfficiency - data.currentEfficiency,
                        vessel: data.vesselName,
                        dwt: data.dwt.toLocaleString(),
                        saving: data.annualSaving.toLocaleString()
                    })}
                </p>
            </div>

            {/* CTA Section */}
            <div className="bg-[#fde047] p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-[#020617]">
                    <h3 className="text-2xl font-black tracking-tighter mb-2">{t('audit_report.download_title')}</h3>
                    <p className="font-bold text-sm opacity-80">{t('audit_report.download_desc')}</p>
                </div>
                <button className="bg-[#020617] text-white px-8 py-4 rounded-full font-black flex items-center gap-3 hover:scale-105 transition-transform">
                    <Download className="w-5 h-5" />
                    {t('audit_report.export_btn')}
                </button>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
                    {t('audit_report.confidential')}
                </p>
            </div>
        </div>
    );
};

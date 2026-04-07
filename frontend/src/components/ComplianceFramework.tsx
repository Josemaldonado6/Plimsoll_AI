import React from 'react';
import { Shield, FileCheck, Anchor, Scale, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const ComplianceFramework: React.FC = () => {
    const { t } = useTranslation();

    const requirements = [
        {
            title: t('landing.compliance_neutrality_title', "Neutrality & Independence"),
            standard: "ISO 17020 Clause 4.1",
            desc: t('landing.compliance_neutrality_desc', "Plimsoll AI eliminates human bias and bribery risk through immutable cryptographic verification of the waterline."),
            icon: <Scale className="text-yellow-400" />
        },
        {
            title: t('landing.compliance_transparency_title', "Methodological Transparency"),
            standard: "ISO 17020 Clause 7.1",
            desc: t('landing.compliance_transparency_desc', "Full audit trail of every pixel analyzed, including density corrections and wave cancellation parameters."),
            icon: <FileCheck className="text-blue-400" />
        },
        {
            title: t('landing.compliance_competence_title', "Technical Competence"),
            standard: "ISO 17020 Clause 6.1",
            desc: t('landing.compliance_competence_desc', "Neural network models trained on 10,000+ validated maritime scenarios with 99.9% precision benchmarks."),
            icon: <Shield className="text-emerald-400" />
        },
        {
            title: t('landing.compliance_integrity_title', "Equipment Integrity"),
            standard: "ISO 17020 Clause 6.2",
            desc: t('landing.compliance_integrity_desc', "Automated pre-flight drone calibration and sensor health checks to ensure data origin authenticity."),
            icon: <Anchor className="text-purple-400" />
        }
    ];

    return (
        <div className="py-24 bg-slate-950">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-400/20 bg-yellow-400/5 text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-6">
                        <Shield size={12} />
                        {t('landing.compliance_protocol')}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase mb-6">
                        {t('landing.compliance_framework_title')} <span className="text-yellow-400">{t('landing.compliance_framework_subtitle')}</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl font-medium">
                        {t('landing.compliance_audit_path')}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {requirements.map((req, i) => (
                        <div key={i} className="group relative p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-yellow-400/50 transition-all duration-500">
                            <div className="mb-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 w-fit group-hover:scale-110 group-hover:bg-yellow-400/5 transition-all">
                                {req.icon}
                            </div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-2">{req.title}</h3>
                            <p className="text-[10px] font-mono font-bold text-yellow-500/60 uppercase tracking-widest mb-4">{req.standard}</p>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">
                                {req.desc}
                            </p>

                            <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CheckCircle2 size={16} className="text-yellow-400" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Audit Evidence Box */}
                <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4">
                        <h4 className="text-xl font-black text-white uppercase tracking-tight">{t('landing.audit_evidence_title')}</h4>
                        <p className="text-slate-500 text-sm max-w-xl">{t('landing.audit_evidence_desc')}</p>
                    </div>
                    <button className="whitespace-nowrap px-8 py-4 rounded-xl bg-slate-800 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-colors border border-slate-700">
                        {t('landing.cta_sample_cert')}
                    </button>
                </div>
            </div>
        </div>
    );
};

import React, { useState } from 'react';
import { Table, Plus, Trash2, Save, X, Anchor, Ruler } from 'lucide-react';

interface HydroRow {
    draft: number;
    displacement: number;
}

interface HydrostaticEditorProps {
    vesselData: any;
    onSave: (data: any) => void;
    onClose: () => void;
}

const HydrostaticEditor: React.FC<HydrostaticEditorProps> = ({ vesselData, onSave, onClose }) => {
    const [lbp, setLbp] = useState(vesselData.lbp || 0);
    const [beam, setBeam] = useState(vesselData.beam || 0);
    const [rows, setRows] = useState<HydroRow[]>(
        JSON.parse(vesselData.hydrostatics_data || '[]')
    );

    const addRow = () => {
        setRows([...rows, { draft: 0, displacement: 0 }].sort((a, b) => a.draft - b.draft));
    };

    const updateRow = (index: number, field: keyof HydroRow, value: number) => {
        const newRows = [...rows];
        newRows[index][field] = value;
        setRows(newRows);
    };

    const removeRow = (index: number) => {
        setRows(rows.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        onSave({
            ...vesselData,
            lbp,
            beam,
            hydrostatics_data: JSON.stringify(rows.sort((a, b) => a.draft - b.draft))
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono">
            <div className="w-full max-w-4xl bg-[#020617] border border-yellow-400/20 rounded-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl shadow-yellow-400/5">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center text-black shadow-lg shadow-yellow-400/20">
                            <Anchor size={24} />
                        </div>
                        <div>
                            <h2 className="text-white font-black text-lg tracking-tight uppercase">Editor de Ingeniería Naval</h2>
                            <p className="text-yellow-400/60 text-[10px] font-bold tracking-widest uppercase">Kernel Hydrostatic Module v4.2</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors cursor-pointer">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Master Specs */}
                    <div className="grid grid-cols-2 gap-8 p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                <Ruler size={14} className="text-yellow-400" />
                                LBP (Eslora entre Perpendiculares)
                            </label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={lbp}
                                    onChange={(e) => setLbp(parseFloat(e.target.value))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-black focus:border-yellow-400 transition-all outline-none"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-xs">METROS</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                <div className="w-4 h-4 border-2 border-yellow-400/40 rounded-sm" />
                                Manga (Breadth)
                            </label>
                            <div className="relative">
                                <input 
                                    type="number"
                                    value={beam}
                                    onChange={(e) => setBeam(parseFloat(e.target.value))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-black focus:border-yellow-400 transition-all outline-none"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-xs">METROS</span>
                            </div>
                        </div>
                    </div>

                    {/* Hydrostatic Table */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                <Table size={16} className="text-yellow-400" />
                                Tabla Draft vs Desplazamiento
                            </h3>
                            <button 
                                onClick={addRow}
                                className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-yellow-400/10"
                            >
                                <Plus size={14} /> Añadir Punto
                            </button>
                        </div>

                        <div className="bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="p-4 text-[9px] text-slate-500 font-black uppercase tracking-tighter">Calado (M)</th>
                                        <th className="p-4 text-[9px] text-slate-500 font-black uppercase tracking-tighter">Desplazamiento (MT)</th>
                                        <th className="p-4 text-[9px] text-slate-500 font-black uppercase tracking-tighter w-16">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {rows.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                                            <td className="p-2">
                                                <input 
                                                    type="number" 
                                                    step="0.01"
                                                    value={row.draft}
                                                    onChange={(e) => updateRow(idx, 'draft', parseFloat(e.target.value))}
                                                    className="w-full bg-transparent p-3 text-white font-bold focus:bg-white/5 outline-none"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input 
                                                    type="number" 
                                                    value={row.displacement}
                                                    onChange={(e) => updateRow(idx, 'displacement', parseFloat(e.target.value))}
                                                    className="w-full bg-transparent p-3 text-yellow-400 font-black focus:bg-white/5 outline-none"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <button 
                                                    onClick={() => removeRow(idx)}
                                                    className="w-10 h-10 flex items-center justify-center text-red-500/40 hover:text-red-500 transition-colors cursor-pointer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {rows.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="p-12 text-center text-slate-600 text-[10px] font-bold uppercase italic">
                                                No hay datos ingresados. Use el botón superior para añadir puntos.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-end gap-4">
                    <button 
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-xs hover:bg-white/5 transition-all cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-8 py-3 rounded-xl bg-yellow-400 text-black font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-400/10 cursor-pointer flex items-center gap-2"
                    >
                        <Save size={16} /> Guardar Configuración Naval
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HydrostaticEditor;

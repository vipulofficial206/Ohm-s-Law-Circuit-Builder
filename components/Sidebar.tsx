
import React from 'react';
import { ComponentType } from '../types';
import { COMPONENT_LABELS, COMPONENT_COLORS } from '../constants';

interface SidebarProps {
  onDragStart: (type: ComponentType) => void;
  theme: 'dark' | 'light';
}

const Sidebar: React.FC<SidebarProps> = ({ onDragStart, theme }) => {
  const componentOptions = [
    { type: ComponentType.BATTERY, icon: '🔋', desc: 'Voltage source' },
    { type: ComponentType.RESISTOR, icon: '〰️', desc: 'Fixed resistance' },
    { type: ComponentType.POTENTIOMETER, icon: '🕹️', desc: 'Variable resistance' },
    { type: ComponentType.LED, icon: '💡', desc: 'Visual output' },
    { type: ComponentType.WIRE, icon: '🔗', desc: 'Connectivity' },
    { type: ComponentType.SWITCH, icon: '🔌', desc: 'Manual Gate' },
  ];

  return (
    <div className={`w-64 border-r flex flex-col h-full shadow-2xl z-20 transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="p-6">
        <h1 className={`text-xl font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          <span className="text-blue-500 font-mono">Ω</span> Ohm's Lab
        </h1>
        <p className={`text-[10px] uppercase font-bold tracking-[0.2em] mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Virtual Prototyping</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-6">
        <div>
          <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Inventory</h3>
          <p className={`text-[9px] font-bold mb-4 italic ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>Press and drag items to the board</p>
          <div className="grid grid-cols-1 gap-2">
            {componentOptions.map((opt) => (
              <button
                key={opt.type}
                onPointerDown={(e) => {
                  e.preventDefault();
                  onDragStart(opt.type);
                }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group active:scale-95 cursor-grab active:cursor-grabbing ${
                  theme === 'dark' 
                  ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-blue-400 shadow-sm'
                }`}
              >
                <div 
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-inner transition-transform group-hover:scale-110 ${theme === 'dark' ? 'bg-black/20' : 'bg-white'}`}
                  style={{ color: COMPONENT_COLORS[opt.type] }}
                >
                  {opt.icon}
                </div>
                <div>
                  <div className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{COMPONENT_LABELS[opt.type]}</div>
                  <div className={`text-[9px] font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-blue-500/5 border-blue-500/10' : 'bg-blue-50 border-blue-100'}`}>
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Cheat Sheet</h4>
            <ul className={`text-[10px] space-y-2 font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              <li className="flex items-center gap-2"><span className="text-blue-500">V</span> = I × R (Voltage)</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500">I</span> = V / R (Current)</li>
              <li className="flex items-center gap-2"><span className="text-purple-500">R</span> = V / I (Resistance)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-800/20">
        <div className={`text-[9px] font-bold uppercase tracking-widest text-center ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>
          Interactive Simulation
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

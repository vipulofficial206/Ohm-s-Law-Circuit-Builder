
import React from 'react';
import { CircuitComponent, ComponentType } from '../types';

interface StatsPanelProps {
  selectedComponent: CircuitComponent | null;
  onUpdateComponent: (id: string, updates: Partial<CircuitComponent>) => void;
  onDeleteComponent: (id: string) => void;
  totalStats: { v: number; i: number; r: number; };
  theme: 'dark' | 'light';
}

const StatsPanel: React.FC<StatsPanelProps> = ({ selectedComponent, onUpdateComponent, onDeleteComponent, totalStats, theme }) => {
  return (
    <div className={`w-80 border-l flex flex-col h-full shadow-2xl relative z-10 transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className={`p-8 border-b backdrop-blur-md ${theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50/50'}`}>
        <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Lab Multimeter</h3>
        <div className="space-y-4">
          <StatDisplay label="Source Potential" value={totalStats.v.toFixed(2)} unit="V" color="text-yellow-500" />
          <StatDisplay label="Loop Current" value={(totalStats.i * 1000).toFixed(1)} unit="mA" color="text-emerald-500" />
          <StatDisplay label="Circuit Impedance" value={totalStats.r.toFixed(0)} unit="Ω" color="text-blue-500" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Device Configuration</h3>
        
        {selectedComponent ? (
          <div className="space-y-6">
            {selectedComponent.isBurnedOut && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl animate-pulse">
                <p className="text-red-500 text-[10px] font-black uppercase mb-1 flex items-center gap-2">
                  <span className="text-lg">⚠️</span> Component Failure
                </p>
                <p className="text-[10px] text-red-400/80 leading-tight font-medium italic">Safety threshold exceeded. Re-wire to fix.</p>
              </div>
            )}

            <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/30 border-slate-700/50' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{selectedComponent.label}</h4>
                   <p className="text-[9px] text-slate-500 font-mono mt-1">{selectedComponent.type}</p>
                 </div>
                 <button 
                  onClick={() => onDeleteComponent(selectedComponent.id)} 
                  className={`group transition-all p-2 rounded-lg border ${theme === 'dark' ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500' : 'bg-red-50 border-red-200 hover:bg-red-500 shadow-sm'}`}
                  title="Remove from Lab"
                 >
                   <svg className={`w-4 h-4 transition-colors ${theme === 'dark' ? 'text-red-500 group-hover:text-white' : 'text-red-500 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                   </svg>
                 </button>
               </div>

               <div className="space-y-8">
                 {selectedComponent.type === ComponentType.SWITCH && (
                   <div className="space-y-4">
                     <label className={`block text-[10px] font-black tracking-widest uppercase ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Switch Status</label>
                     <button
                        onClick={() => onUpdateComponent(selectedComponent.id, { isOpen: !selectedComponent.isOpen })}
                        className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                          !selectedComponent.isOpen ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-slate-200 text-slate-700 border border-slate-300"
                        }`}
                     >
                       <span className="text-lg">{!selectedComponent.isOpen ? "✅" : "⭕"}</span>
                       {!selectedComponent.isOpen ? "Closed (ON)" : "Open (OFF)"}
                     </button>
                   </div>
                 )}

                 {(selectedComponent.type === ComponentType.BATTERY || 
                   selectedComponent.type === ComponentType.RESISTOR || 
                   selectedComponent.type === ComponentType.POTENTIOMETER) && (
                   <div className="space-y-4">
                     <div className={`flex justify-between text-[10px] font-black tracking-widest uppercase ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                       <span>Value Tuning</span>
                       <span className="text-blue-500 font-mono">
                         {selectedComponent.value}
                         {selectedComponent.type === ComponentType.BATTERY ? 'V' : 'Ω'}
                       </span>
                     </div>
                     <input 
                       type="range"
                       min={selectedComponent.type === ComponentType.BATTERY ? 0 : 0}
                       max={selectedComponent.type === ComponentType.BATTERY ? 24 : 1000}
                       step={selectedComponent.type === ComponentType.BATTERY ? 0.1 : 1}
                       value={selectedComponent.value}
                       onChange={(e) => onUpdateComponent(selectedComponent.id, { value: parseFloat(e.target.value) })}
                       className="w-full h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
                     />
                     <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                       <span>MIN</span>
                       <span>MAX</span>
                     </div>
                   </div>
                 )}

                 <div>
                   <label className={`block text-[10px] font-black tracking-widest uppercase mb-3 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Orientation</label>
                   <div className="grid grid-cols-4 gap-2">
                     {[0, 90, 180, 270].map(deg => (
                       <button
                         key={deg}
                         onClick={() => onUpdateComponent(selectedComponent.id, { rotation: deg })}
                         className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${selectedComponent.rotation === deg ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}
                       >
                         {deg}°
                       </button>
                     ))}
                   </div>
                 </div>
               </div>
            </div>

            <div className={`p-6 rounded-2xl border space-y-4 shadow-inner ${theme === 'dark' ? 'bg-slate-950/50 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
              <h5 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Waveform Data
              </h5>
              <div className="h-24 w-full flex items-end gap-[2px] overflow-hidden">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/40 transition-all rounded-t-sm" 
                    style={{ height: `${Math.max(4, (selectedComponent.current * 1000) * (0.6 + Math.random() * 0.8))}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>0ms</span>
                <span>T-AVG: {(selectedComponent.power * 1000).toFixed(0)}mW</span>
                <span>100ms</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-80 flex flex-col items-center justify-center text-center px-6">
             <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner ${theme === 'dark' ? 'bg-slate-800/50 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>🛰️</div>
             <p className={`text-xs font-black uppercase tracking-widest mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Waiting for Probe</p>
             <p className={`text-[10px] font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-600' : 'text-slate-500'}`}>Select a physical component on the grid to begin real-time analysis and configuration.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatDisplay = ({ label, value, unit, color }: any) => (
  <div className="flex items-center justify-between">
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className={`text-2xl font-mono font-black ${color}`}>{value}</span>
      <span className="text-[10px] font-black text-slate-600 uppercase">{unit}</span>
    </div>
  </div>
);

export default StatsPanel;

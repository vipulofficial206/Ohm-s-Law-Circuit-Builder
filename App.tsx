
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { CircuitComponent, ComponentType, ViewMode, Lab, CircuitResult, Vec2 } from './types';
import { DEFAULT_VALUES, COMPONENT_LABELS, LAB_EXERCISES } from './constants';
import { solveCircuit } from './services/circuitSolver';
import Sidebar from './components/Sidebar';
import CircuitCanvas from './components/CircuitCanvas';
import StatsPanel from './components/StatsPanel';
import KnowledgeHub from './components/KnowledgeHub';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentLab, setCurrentLab] = useState<Lab | null>(null);
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.VIEW_3D);
  const [tutorialIndex, setTutorialIndex] = useState<number>(0);
  const [circuitInsights, setCircuitInsights] = useState<string>("");
  const [isKnowledgeHubOpen, setKnowledgeHubOpen] = useState(false);
  const [pendingComponentType, setPendingComponentType] = useState<ComponentType | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isSimulationLoading, setIsSimulationLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const homeScrollRef = useRef<HTMLDivElement>(null);
  const labsSectionRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const scrollToLabs = () => {
    labsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startLab = (lab: Lab) => {
    setIsSimulationLoading(true);
    setLoadingProgress(0);
    
    const initial = lab.initialComponents.map((c, i) => ({
      id: `init-${i}`,
      type: c.type,
      pos: c.pos,
      rotation: 0,
      value: c.value,
      label: c.label || COMPONENT_LABELS[c.type],
      current: 0,
      voltageDrop: 0,
      power: 0,
      isActive: false,
      isOpen: c.type === ComponentType.SWITCH ? true : false
    }));
    const result = solveCircuit(initial as CircuitComponent[]);
    setComponents(result.updatedComponents);
    setCircuitInsights(result.insights);
    setCurrentLab(lab);
    setTutorialIndex(0);
    setSelectedId(null);
    setKnowledgeHubOpen(false);
    setShowInstructions(true);

    const duration = 1200;
    const interval = 30;
    const step = 100 / (duration / interval);
    
    const timer = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsSimulationLoading(false);
          return 100;
        }
        return prev + step;
      });
    }, interval);
  };

  const handleReset = () => {
    if (currentLab) startLab(currentLab);
  };

  const handleUpdatePos = useCallback((id: string, x: number, y: number) => {
    const snapX = Math.round(x * 2) / 2;
    const snapY = Math.round(y * 2) / 2;

    setComponents(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, pos: { x: snapX, y: snapY } } : c);
      const result = solveCircuit(updated);
      setCircuitInsights(result.insights);
      return result.updatedComponents;
    });
  }, []);

  const handlePlaceComponent = useCallback((type: ComponentType, pos: Vec2) => {
    const snapX = Math.round(pos.x * 2) / 2;
    const snapY = Math.round(pos.y * 2) / 2;

    const newComp: CircuitComponent = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      pos: { x: snapX, y: snapY },
      rotation: 0,
      value: DEFAULT_VALUES[type],
      label: COMPONENT_LABELS[type],
      current: 0,
      voltageDrop: 0,
      power: 0,
      isActive: false,
      isOpen: type === ComponentType.SWITCH ? true : false,
    };
    setComponents(prev => {
      const result = solveCircuit([...prev, newComp]);
      setCircuitInsights(result.insights);
      return result.updatedComponents;
    });
    setSelectedId(newComp.id);
    setPendingComponentType(null);
  }, []);

  const handleUpdateComponent = useCallback((id: string, updates: Partial<CircuitComponent>) => {
    setComponents(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      const result = solveCircuit(updated);
      setCircuitInsights(result.insights);
      return result.updatedComponents;
    });
  }, []);

  const totalStats = useMemo(() => {
    const activeComps = components.filter(c => c.isActive);
    const v = components.filter(c => c.type === ComponentType.BATTERY && c.isActive).reduce((sum, b) => sum + b.value, 0);
    const i = activeComps.length > 0 ? Math.max(...activeComps.map(c => c.current)) : 0;
    const r = i > 0 ? v / i : 0;
    return { v, i, r };
  }, [components]);

  const currentStep = currentLab?.tutorialSteps[tutorialIndex];
  const isGoalMet = useMemo(() => {
    return currentStep?.trigger ? currentStep.trigger(components) : false;
  }, [components, currentStep]);

  if (isKnowledgeHubOpen) {
    return <KnowledgeHub onClose={() => setKnowledgeHubOpen(false)} theme={theme} />;
  }

  if (!currentLab) {
    return (
      <div 
        ref={homeScrollRef}
        className={`h-screen w-full transition-colors duration-500 ${theme === 'dark' ? 'bg-[#020617] text-white' : 'bg-blue-50/40 text-slate-900'} p-6 md:p-12 overflow-y-auto custom-scrollbar scroll-smooth`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-end mb-8">
            <button 
              onClick={toggleTheme}
              className={`p-3 rounded-2xl transition-all shadow-xl flex items-center gap-3 font-bold ${theme === 'dark' ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700 shadow-black' : 'bg-white text-indigo-600 hover:bg-indigo-50 border-2 border-blue-50 shadow-blue-500/5'}`}
            >
              {theme === 'dark' ? '☀️ Day View' : '🌙 Night View'}
            </button>
          </div>
          
          <header className="mb-20 text-center">
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full border-2 border-blue-500/20 bg-blue-500/5 text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
              Engineering Simulation v3.6
            </div>
            <h1 className={`text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r ${theme === 'dark' ? 'from-blue-400 via-indigo-400 to-emerald-400' : 'from-blue-600 via-indigo-500 to-cyan-500'} bg-clip-text text-transparent tracking-tighter leading-none`}>
              Virtual Ohm Lab
            </h1>
            <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} text-xl max-w-2xl mx-auto font-medium leading-relaxed`}>
              The ultimate high-fidelity sandbox for electrical engineering. 
              Experiment with confidence, visualize the invisible, and master Ohm's Law.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => setKnowledgeHubOpen(true)}
                className={`px-8 py-4 transition-all flex items-center gap-3 rounded-2xl text-sm font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 border border-white/10 shadow-black' : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-100 shadow-lg shadow-blue-500/5'}`}
              >
                📚 Ohmie AI Tutor
              </button>
              <button 
                onClick={scrollToLabs}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20"
              >
                Begin Simulation ↓
              </button>
            </div>
          </header>

          {/* LAB MODULES AT TOP */}
          <div ref={labsSectionRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
            <div className="col-span-full flex items-center gap-4 mb-4">
               <h2 className={`text-[10px] font-black uppercase tracking-[0.5em] ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>Available Simulations</h2>
               <div className="h-[2px] flex-1 bg-gradient-to-r from-blue-500/20 to-transparent"></div>
            </div>
            {LAB_EXERCISES.map((lab) => (
              <div 
                key={lab.id}
                onClick={() => startLab(lab)}
                className={`group relative transition-all cursor-pointer overflow-hidden shadow-2xl p-12 rounded-[3.5rem] border-2 ${theme === 'dark' ? 'bg-slate-900/40 border-white/5 hover:bg-slate-900/80 hover:border-blue-500/30 shadow-black' : 'bg-white border-white hover:border-blue-300 hover:shadow-blue-500/10'}`}
              >
                <div className={`absolute -top-6 -right-6 p-12 text-9xl transition-all duration-700 ${theme === 'dark' ? 'opacity-10 group-hover:opacity-20' : 'opacity-[0.03] group-hover:opacity-[0.08]'}`}>
                  {lab.icon}
                </div>
                <div className="relative z-10">
                  <span className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border-2 ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400 border-blue-500/10' : 'bg-blue-50 text-blue-600 border-blue-100/50'}`}>
                    {lab.difficulty}
                  </span>
                  <h2 className={`text-4xl font-black mt-8 mb-4 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{lab.title}</h2>
                  <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} text-lg leading-relaxed mb-10`}>{lab.description}</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); startLab(lab); }}
                    className={`flex items-center gap-4 text-white font-black text-sm px-8 py-4 rounded-2xl transition-all ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] shadow-black' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30'}`}
                  >
                    Launch Lab <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PROJECT SPECIFICATIONS & TECH INFO AT BOTTOM */}
          <section className="mb-32">
             <div className="flex items-center gap-4 mb-12">
                <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
                <h2 className={`text-[10px] font-black uppercase tracking-[0.5em] ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>Engineering Specifications</h2>
                <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className={`p-10 rounded-[3rem] border-2 transition-all group hover:-translate-y-2 ${theme === 'dark' ? 'bg-slate-900/40 border-white/5 shadow-black' : 'bg-white border-blue-50 shadow-blue-500/5'}`}>
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-3xl mb-8 border border-red-500/20">🚨</div>
                  <h3 className={`text-xl font-black mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Problem Statement</h3>
                  <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-medium`}>
                    Traditional physics education relies on static diagrams or physical labs where safety hazards and part destruction discourage experimentation. There's a disconnect between textbook math and physical reality.
                  </p>
                </div>

                <div className={`p-10 rounded-[3rem] border-2 transition-all group hover:-translate-y-2 ${theme === 'dark' ? 'bg-slate-900/40 border-white/5 shadow-black' : 'bg-white border-blue-50 shadow-blue-500/5'}`}>
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-3xl mb-8 border border-emerald-500/20">🏆</div>
                  <h3 className={`text-xl font-black mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>The Solution</h3>
                  <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-medium`}>
                    Virtual Ohm Lab provides an interactive "Living Schematic." By visualizing electron flow as dynamic particles and allowing real-time component destruction, we make electricity tangible without the cost or danger.
                  </p>
                </div>

                <div className={`p-10 rounded-[3rem] border-2 transition-all group hover:-translate-y-2 ${theme === 'dark' ? 'bg-slate-900/40 border-white/5 shadow-black' : 'bg-white border-blue-50 shadow-blue-500/5'}`}>
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-3xl mb-8 border border-blue-500/20">🏗️</div>
                  <h3 className={`text-xl font-black mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Technology Stack</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded-md font-black">REACT 19</span>
                      <span className={`text-[11px] font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Reactive State Engine</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] bg-indigo-600 text-white px-2 py-1 rounded-md font-black">THREE.JS</span>
                      <span className={`text-[11px] font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Spatial 3D Canvas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] bg-cyan-600 text-white px-2 py-1 rounded-md font-black">TAILWIND</span>
                      <span className={`text-[11px] font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Dynamic Styling</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] bg-emerald-600 text-white px-2 py-1 rounded-md font-black">GEMINI AI</span>
                      <span className={`text-[11px] font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Expert Lab Assistant</span>
                    </div>
                  </div>
                </div>
             </div>
          </section>

          <footer className={`text-center pb-24 border-t-2 pt-16 ${theme === 'dark' ? 'border-white/5 text-slate-600' : 'border-blue-50 text-slate-400'}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-4">Developed with React, Three.js, Tailwind & Gemini AI</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Build v3.6.2-Stable • © 2025 Electronics Learning Academy</p>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-full transition-colors duration-500 overflow-hidden font-sans select-none relative ${theme === 'dark' ? 'bg-[#020617] text-slate-200' : 'bg-white text-slate-900'}`}>
      {isSimulationLoading && (
        <div className={`absolute inset-0 z-[100] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-blue-50'}`}>
          <div className="relative w-24 h-24 mb-12">
            <div className={`absolute inset-0 border-4 rounded-full ${theme === 'dark' ? 'border-blue-500/10' : 'border-blue-500/20'}`}></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-blue-600 font-black text-sm">{Math.round(loadingProgress)}%</span>
            </div>
          </div>
          <h2 className={`text-2xl font-black mb-4 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Physics Engine Ready</h2>
          <p className="text-slate-400 max-w-md mx-auto leading-relaxed mb-8 text-sm">
            Syncing circuit parameters...
          </p>
          <div className={`w-64 h-1.5 rounded-full overflow-hidden border-2 ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-blue-100'}`}>
             <div 
               className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300 shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
               style={{ width: `${loadingProgress}%` }}
             ></div>
          </div>
        </div>
      )}

      <Sidebar onDragStart={setPendingComponentType} theme={theme} />
      
      <main className="flex-1 relative flex flex-col">
        <div className="flex-1 relative">
          <CircuitCanvas 
            components={components} 
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdatePos={handleUpdatePos}
            viewMode={viewMode}
            pendingType={pendingComponentType}
            onDrop={handlePlaceComponent}
            theme={theme}
          />

          {currentStep && showInstructions && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[420px] z-[60] pointer-events-none">
              <div className={`backdrop-blur-3xl p-6 rounded-[2.5rem] border-2 shadow-[0_30px_90px_rgba(0,0,0,0.4)] transition-all duration-500 pointer-events-auto ${
                theme === 'dark' ? 'bg-slate-900/95 border-white/10 shadow-black' : 'bg-white/95 border-blue-50 shadow-blue-500/10'
              } ${
                isGoalMet ? "border-emerald-500/50 shadow-emerald-500/30 scale-105" : ""
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shadow-xl shadow-blue-600/30 text-white">
                      {tutorialIndex + 1}
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block mb-1">Active Objective</span>
                      <h3 className={`text-lg font-black tracking-tight leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{currentStep.title}</h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowInstructions(false)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border-2 ${theme === 'dark' ? 'bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-500 border-white/5 shadow-black' : 'bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-400 border-slate-100 shadow-sm'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                
                <div className={`p-4 rounded-2xl border-2 mb-6 ${theme === 'dark' ? 'bg-white/5 border-white/5 text-slate-200' : 'bg-blue-50/50 border-blue-50/50 text-slate-600'}`}>
                  <p className="text-[13px] leading-relaxed font-medium">
                    {currentStep.description}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setTutorialIndex(Math.max(0, tutorialIndex - 1))}
                    disabled={tutorialIndex === 0}
                    className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all disabled:opacity-0 ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-white/5 shadow-black' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-200 shadow-sm'}`}
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setTutorialIndex(Math.min(currentLab.tutorialSteps.length - 1, tutorialIndex + 1))}
                    disabled={tutorialIndex >= currentLab.tutorialSteps.length - 1}
                    className={`flex-[2] py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                      isGoalMet ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30" : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                    } disabled:opacity-10`}
                  >
                    {isGoalMet ? "Goal Met" : (currentStep.actionLabel || "Next Step")} <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="absolute top-6 left-6 z-20 flex flex-col gap-3">
            <button 
              onClick={() => setCurrentLab(null)}
              className={`backdrop-blur-xl px-5 py-3 rounded-xl border-2 text-[9px] font-black uppercase tracking-widest transition-all shadow-xl ${theme === 'dark' ? 'bg-slate-900/80 border-white/10 hover:bg-slate-800 text-white shadow-black' : 'bg-white border-blue-50 hover:bg-blue-50 text-blue-600 shadow-blue-500/5'}`}
            >
              ← Exit Lab
            </button>
            <button 
              onClick={handleReset}
              className={`backdrop-blur-xl px-5 py-3 rounded-xl border-2 text-[9px] font-black uppercase tracking-widest transition-all shadow-xl ${theme === 'dark' ? 'bg-slate-900/80 border-white/10 hover:bg-slate-800 text-white shadow-black' : 'bg-white border-blue-50 hover:bg-blue-50 text-blue-600 shadow-blue-500/5'}`}
            >
              🔄 Reset
            </button>
            <button 
              onClick={toggleTheme}
              className={`backdrop-blur-xl px-5 py-3 rounded-xl border-2 text-[9px] font-black uppercase tracking-widest transition-all shadow-xl ${theme === 'dark' ? 'bg-slate-900/80 border-white/10 hover:bg-slate-800 text-white shadow-black' : 'bg-white border-blue-50 hover:bg-blue-50 text-blue-600 shadow-blue-500/5'}`}
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button 
              onClick={() => setKnowledgeHubOpen(true)}
              className={`backdrop-blur-xl px-5 py-3 rounded-xl border-2 text-[9px] font-black uppercase tracking-widest transition-all shadow-xl text-white ${theme === 'dark' ? 'bg-indigo-600/80 border-indigo-500/20 hover:bg-indigo-500 shadow-black' : 'bg-indigo-600 border-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'}`}
            >
              📚 Help
            </button>
          </div>

          <div className={`absolute top-6 right-6 flex backdrop-blur-xl p-1.5 rounded-2xl border-2 shadow-2xl z-20 ${theme === 'dark' ? 'bg-slate-900/80 border-white/10 shadow-black' : 'bg-white border-blue-50 shadow-blue-500/5'}`}>
            <button onClick={() => setViewMode(ViewMode.VIEW_3D)} className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === ViewMode.VIEW_3D ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-blue-600'}`}>3D</button>
            <button onClick={() => setViewMode(ViewMode.VIEW_2D)} className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === ViewMode.VIEW_2D ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-blue-600'}`}>2D</button>
          </div>
        </div>

        <footer className={`border-t-2 px-8 py-5 z-40 transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950 border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]' : 'bg-white border-blue-50 shadow-[0_-10px_40px_rgba(59,130,246,0.05)]'}`}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                circuitInsights.includes("CRITICAL") || circuitInsights.includes("SHORT") 
                ? "bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                : "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              }`}></div>
              <div className="min-w-0">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] block mb-1 ${
                  circuitInsights.includes("CRITICAL") || circuitInsights.includes("SHORT") ? "text-red-500" : "text-blue-600"
                }`}>
                  {circuitInsights.includes("CRITICAL") || circuitInsights.includes("SHORT") ? "Safety Alert" : "System Normal"}
                </span>
                <p className={`text-[13px] font-bold leading-tight truncate ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  {circuitInsights || "Diagnostic feed initialized..."}
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-10 px-10 py-4 rounded-[2rem] border-2 shrink-0 shadow-inner ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-blue-50/50 border-blue-100/30 shadow-sm'}`}>
               <div className="flex flex-col items-center">
                 <span className="text-[8px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Current</span>
                 <span className={`text-2xl font-mono font-black tracking-tighter ${totalStats.i > 0.1 ? 'text-red-500' : 'text-emerald-500'}`}>
                   {(totalStats.i * 1000).toFixed(1)}<span className="text-[10px] ml-1 opacity-60 font-sans">mA</span>
                 </span>
               </div>
               <div className={`w-[2px] h-10 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-blue-200/50'}`}></div>
               <div className="flex flex-col items-center">
                 <span className="text-[8px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Load</span>
                 <span className={`text-2xl font-mono font-black tracking-tighter ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                   {totalStats.r.toFixed(0)}<span className="text-[10px] ml-1 opacity-40 font-sans">Ω</span>
                 </span>
               </div>
               <div className={`w-[2px] h-10 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-blue-200/50'}`}></div>
               <div className="flex flex-col items-center">
                 <span className="text-[8px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Potential</span>
                 <span className={`text-2xl font-mono font-black tracking-tighter ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`}>
                   {totalStats.v.toFixed(1)}<span className="text-[10px] ml-1 opacity-40 font-sans">V</span>
                 </span>
               </div>
            </div>
          </div>
        </footer>
      </main>

      <StatsPanel 
        selectedComponent={components.find(c => c.id === selectedId) || null}
        onUpdateComponent={handleUpdateComponent}
        onDeleteComponent={(id) => { 
          setComponents(prev => {
            const result = solveCircuit(prev.filter(c => c.id !== id));
            setCircuitInsights(result.insights);
            return result.updatedComponents;
          }); 
          setSelectedId(null); 
        }}
        totalStats={totalStats}
        theme={theme}
      />
    </div>
  );
};

export default App;

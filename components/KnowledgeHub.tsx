
import { GoogleGenAI } from "@google/genai";
import React, { useEffect, useRef, useState } from 'react';

interface KnowledgeHubProps {
  onClose: () => void;
  theme: 'dark' | 'light';
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

const QUIZ_DATA: Record<Difficulty, Question[]> = {
  Beginner: [
    {
      id: 1,
      text: "What does the 'V' stand for in Ohm's Law?",
      options: ["Velocity", "Voltage", "Vacuum", "Viscosity"],
      correct: 1,
      explanation: "Voltage (V) represents electric potential difference, often described as 'electric pressure'."
    },
    {
      id: 2,
      text: "If you increase Resistance in a circuit while keeping Voltage the same, what happens to the Current?",
      options: ["It increases", "It decreases", "It stays the same", "It fluctuates wildly"],
      correct: 1,
      explanation: "According to I = V/R, Current and Resistance are inversely proportional."
    },
    {
      id: 3,
      text: "Which component is used to limit current flow to protect sensitive parts like LEDs?",
      options: ["Battery", "Switch", "Resistor", "Wire"],
      correct: 2,
      explanation: "A resistor provides electrical resistance to restrict the flow of charge."
    },
    {
      id: 4,
      text: "What is the standard unit of measurement for Resistance?",
      options: ["Amperes (A)", "Volts (V)", "Ohms (Ω)", "Watts (W)"],
      correct: 2,
      explanation: "Resistance is measured in Ohms, named after Georg Simon Ohm."
    },
    {
      id: 5,
      text: "In the water pipe analogy, what is 'Voltage' most similar to?",
      options: ["The water flow", "The faucet handle", "The water pressure", "The drain pipe"],
      correct: 2,
      explanation: "Voltage is like pressure provided by a pump; it pushes the electrons through the circuit."
    },
    {
      id: 6,
      text: "What occurs during a 'Short Circuit'?",
      options: ["The path is broken", "Current stops flowing", "Resistance becomes extremely low", "Voltage drops to zero"],
      correct: 2,
      explanation: "A short circuit happens when current finds a path with almost no resistance, causing a dangerous current spike."
    },
    {
      id: 7,
      text: "Which of these allows electrons to travel in a complete, unbroken loop?",
      options: ["An open switch", "A broken wire", "A closed circuit", "A dead battery"],
      correct: 2,
      explanation: "A closed circuit is a continuous path that allows current to flow from positive to negative."
    },
    {
      id: 8,
      text: "If a circuit has a 10V battery and a 5Ω resistor, what is the current (I)?",
      options: ["50A", "2A", "0.5A", "15A"],
      correct: 1,
      explanation: "Using I = V / R, 10V / 5Ω = 2 Amperes."
    },
    {
      id: 9,
      text: "Which symbol represents the unit of measurement for Resistance?",
      options: ["Ω (Omega)", "λ (Lambda)", "Σ (Sigma)", "Δ (Delta)"],
      correct: 0,
      explanation: "The Greek letter Omega (Ω) is the standard symbol for Ohms."
    },
    {
      id: 10,
      text: "What is the primary function of a switch in a circuit?",
      options: ["Increase resistance", "Boost voltage", "Connect or break the current path", "Store energy"],
      correct: 2,
      explanation: "A switch acts as a gatekeeper, physically opening or closing the path for electrons."
    }
  ],
  Intermediate: [
    {
      id: 1,
      text: "What is the standard formula for calculating Electric Power (P)?",
      options: ["P = V / R", "P = I * R", "P = V * I", "P = V + I"],
      correct: 2,
      explanation: "Electric Power is the product of Voltage and Current (Watts = Volts * Amps)."
    },
    {
      id: 2,
      text: "In a series circuit with two 100Ω resistors, what is the total equivalent resistance?",
      options: ["50Ω", "100Ω", "200Ω", "0Ω"],
      correct: 2,
      explanation: "In a series circuit, resistances add together (R_total = R1 + R2 + ...)."
    },
    {
      id: 3,
      text: "If a 12V source powers an LED with a 2V drop, how much voltage must the resistor drop?",
      options: ["12V", "2V", "10V", "14V"],
      correct: 2,
      explanation: "According to Kirchhoff's Voltage Law, the sum of voltage drops must equal the source voltage (12 - 2 = 10)."
    },
    {
      id: 4,
      text: "How many Amperes is 500mA equivalent to?",
      options: ["5A", "0.5A", "0.05A", "50A"],
      correct: 1,
      explanation: "Milli (m) means one-thousandth. 500 / 1000 = 0.5 Amps."
    },
    {
      id: 5,
      text: "What is a 'Potentiometer' often used for in real-world electronics?",
      options: ["Storing large amounts of power", "Controlling volume (Variable resistance)", "Preventing all current flow", "Generating voltage"],
      correct: 1,
      explanation: "A potentiometer is a variable resistor that allows you to manually adjust the resistance level."
    },
    {
      id: 6,
      text: "If resistance is doubled while voltage stays constant, what happens to current?",
      options: ["It doubles", "It stays same", "It is halved", "It becomes zero"],
      correct: 2,
      explanation: "From I = V/R, if R increases (denominator), I decreases proportionally."
    },
    {
      id: 7,
      text: "What is the standard unit of measurement for Electric Power?",
      options: ["Joule", "Watt", "Ohm", "Coulomb"],
      correct: 1,
      explanation: "Power is measured in Watts (W), representing the rate of energy transfer."
    },
    {
      id: 8,
      text: "In a single-loop series circuit, which value remains identical at every point?",
      options: ["Voltage", "Resistance", "Current", "Power"],
      correct: 2,
      explanation: "In a single loop, there is only one path for electrons, so current is the same everywhere."
    },
    {
      id: 9,
      text: "What does '1kΩ' represent in numeric value?",
      options: ["100Ω", "1,000Ω", "10,000Ω", "1,000,000Ω"],
      correct: 1,
      explanation: "'k' stands for kilo, which means 1,000. So 1kΩ = 1,000 Ohms."
    },
    {
      id: 10,
      text: "A 9V battery powers a 450Ω resistor. What is the current in milliamps (mA)?",
      options: ["20mA", "2mA", "0.02mA", "200mA"],
      correct: 0,
      explanation: "I = 9 / 450 = 0.02 Amps. To convert to mA, multiply by 1000 = 20mA."
    }
  ],
  Advanced: [
    {
      id: 1,
      text: "Two 100Ω resistors are connected in parallel. What is the equivalent resistance?",
      options: ["200Ω", "100Ω", "50Ω", "25Ω"],
      correct: 2,
      explanation: "For parallel resistors of equal value, the resistance is halved (R/n). 100/2 = 50Ω."
    },
    {
      id: 2,
      text: "Which of Kirchhoff's laws states that the sum of currents entering a junction equals those leaving?",
      options: ["Voltage Law", "Current Law", "Ohm's Law", "Power Law"],
      correct: 1,
      explanation: "Kirchhoff's Current Law (KCL) is based on the conservation of electric charge."
    },
    {
      id: 3,
      text: "A circuit load is doubled (Resistance x2) while Voltage stays same. What is the new Power?",
      options: ["Double", "Half", "Quadruple", "Zero"],
      correct: 1,
      explanation: "Power P = V²/R. If R doubles, P becomes V²/(2R), which is half of the original power."
    },
    {
      id: 4,
      text: "Kirchhoff's Voltage Law (KVL) is fundamentally based on which physical principle?",
      options: ["Conservation of Charge", "Conservation of Energy", "Newton's Third Law", "Conservation of Momentum"],
      correct: 1,
      explanation: "KVL states that the total energy (voltage) gained in a loop equals the energy lost."
    },
    {
      id: 5,
      text: "What is the equivalent resistance of a 10Ω and 40Ω resistor in parallel?",
      options: ["50Ω", "25Ω", "8Ω", "4Ω"],
      correct: 2,
      explanation: "Req = (R1*R2) / (R1+R2) = (10*40) / (10+40) = 400 / 50 = 8Ω."
    },
    {
      id: 6,
      text: "If an ideal wire (0Ω) is connected across a battery, what is the theoretical voltage drop across the wire?",
      options: ["Infinite", "Source voltage", "Zero", "Unpredictable"],
      correct: 2,
      explanation: "V = I * R. If R is zero, V will be zero regardless of the current flow."
    },
    {
      id: 7,
      text: "Adding more parallel branches to a circuit has what effect on the total circuit resistance?",
      options: ["Increases it", "Decreases it", "No effect", "Depends on battery size"],
      correct: 1,
      explanation: "Parallel paths provide more ways for current to flow, which always reduces total resistance."
    },
    {
      id: 8,
      text: "A resistor has color bands: Brown, Black, Red. What is its value?",
      options: ["100Ω", "1,000Ω", "10,000Ω", "120Ω"],
      correct: 1,
      explanation: "Brown=1, Black=0, Red=100 multiplier. So 10 * 100 = 1,000Ω (1kΩ)."
    },
    {
      id: 9,
      text: "A resistor is rated at 0.25 Watts. What is this value in fractions?",
      options: ["1/8W", "1/4W", "1/2W", "1W"],
      correct: 1,
      explanation: "0.25 is equal to 1/4. 1/4W resistors are very common in basic electronics."
    },
    {
      id: 10,
      text: "A 24V source feeds three 12Ω resistors in series. What is the power dissipation of each resistor?",
      options: ["16W", "5.33W", "24W", "8W"],
      correct: 1,
      explanation: "Total R=36Ω. I = 24/36 = 0.66A. P_each = I²*R = (0.66)² * 12 ≈ 5.33W."
    }
  ]
};

const formatText = (text: string, theme: 'dark' | 'light') => {
  const lines = text.split('\n');
  return lines.map((line, lineIndex) => {
    let displayLine = line.trim();
    if (!displayLine) return <div key={lineIndex} className="h-3" />;
    const isBullet = displayLine.startsWith('* ') || displayLine.startsWith('- ');
    const cleanLine = isBullet ? displayLine.substring(2) : displayLine;
    const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
    const formattedParts = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className={`${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} font-black`}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    if (isBullet) {
      return (
        <div key={lineIndex} className="flex gap-2 mb-1.5 pl-2 group">
          <span className={`${theme === 'dark' ? 'text-indigo-500' : 'text-indigo-600'} font-black select-none`}>•</span>
          <span className={`flex-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{formattedParts}</span>
        </div>
      );
    }
    return <p key={lineIndex} className={`mb-3 leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{formattedParts}</p>;
  });
};

const KnowledgeHub: React.FC<KnowledgeHubProps> = ({ onClose, theme }) => {
  const [activeTab, setActiveTab] = useState<'theory' | 'videos' | 'components' | 'quiz'>('theory');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { 
      role: 'bot', 
      text: "Welcome back! I'm **Ohmie**, your personal lab assistant. ⚡\n\nI can help you debug your circuits, explain the physics of **Ohm's Law**, or guide you through component selection." 
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [quizDifficulty, setQuizDifficulty] = useState<Difficulty | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const videos = [
    { id: 'O8GgRIIB1Yc', title: "Ohm's Law & Circuits", channel: "Engineering Mindset", cat: "Fundamentals", desc: "A comprehensive visual guide to how V, I, and R interact in simple loops." },
    { id: 'HsLLq6Rm5tU', title: "Ohms Law Explained - The basics circuit theory", channel: "Engineering Mindset", cat: "Science", desc: "The history and discovery of the forces that power our world." },
    { id: 'mc979OhitAg', title: "Current vs Voltage", channel: "Engineering Mindset", cat: "Basics", desc: "Differentiate between the pressure and the flow rate of electricity." },
    { id: '6Maq5IyHSuc', title: "Electronic Basics", channel: "GreatScott!", cat: "Core", desc: "Perfect entry point for absolute beginners starting with electronic parts." },
    { id: 'O8M2z2hIbag', title: "How LEDs Work", channel: "Engineering Mindset", cat: "Components", desc: "The deep physics of semiconductors and why they emit light." }, 
    { id: 'Gc1wVdbVI0E', title: "Understanding Resistors", channel: "Engineering Mindset", cat: "Components", desc: "How resistance is calculated and used to protect sensitive equipment." },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: "You are Ohmie, a friendly and expert physics tutor. Use **bold** for key terms. Be concise.",
        },
      });
      setMessages(prev => [...prev, { role: 'bot', text: response.text || "I had a minor power surge. Try again?" }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Connection failed! Ohmie is offline." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`h-screen w-full transition-colors duration-500 flex flex-col overflow-hidden font-sans ${theme === 'dark' ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      <header className={`flex-none border-b px-8 py-6 z-50 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#020617]/80 backdrop-blur-2xl border-white/5' : 'bg-white/80 backdrop-blur-2xl border-slate-200'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button onClick={onClose} className={`p-3 border rounded-2xl transition-all group flex items-center gap-3 active:scale-95 ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-sm'}`}>
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400 group-hover:text-blue-400' : 'text-slate-500 group-hover:text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className={`hidden md:block text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Exit Hub</span>
            </button>
            <h1 className={`text-2xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Academic Center</h1>
          </div>
          
          <nav className={`flex p-1.5 rounded-2xl border shadow-inner ${theme === 'dark' ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200'}`}>
            {[
              { id: 'theory', label: 'Theory', icon: '⚛️' },
              { id: 'components', label: 'Encyclopedia', icon: '🔋' },
              { id: 'videos', label: 'Lessons', icon: '▶' },
              { id: 'quiz', label: 'Quiz', icon: '📝' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12">
          <div className="max-w-4xl mx-auto space-y-16 pb-24 animate-in fade-in duration-700">
            
            {activeTab === 'theory' && (
              <div className="space-y-16">
                <section>
                  <h2 className={`text-5xl font-black mb-6 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Ohm's Law Fundamentals</h2>
                  <p className={`text-xl leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Named after the German physicist **Georg Simon Ohm**, this fundamental law describes how electricity moves through a circuit. It connects three critical concepts: **Voltage**, **Current**, and **Resistance**.
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`p-8 border rounded-[2.5rem] group transition-all ${theme === 'dark' ? 'bg-yellow-400/5 border-yellow-400/20 hover:bg-yellow-400/10' : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'}`}>
                    <div className="text-4xl mb-4">🔋</div>
                    <h3 className="text-yellow-600 font-black text-xl mb-2">Voltage (V)</h3>
                    <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Measured in **Volts**. It is the 'electric pressure' or potential difference that pushes charges through the loop.</p>
                  </div>
                  <div className={`p-8 border rounded-[2.5rem] group transition-all ${theme === 'dark' ? 'bg-emerald-400/5 border-emerald-400/20 hover:bg-emerald-400/10' : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'}`}>
                    <div className="text-4xl mb-4">⚡</div>
                    <h3 className="text-emerald-600 font-black text-xl mb-2">Current (I)</h3>
                    <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Measured in **Amperes** (Amps). It is the actual flow rate of electrons passing a point in the circuit.</p>
                  </div>
                  <div className={`p-8 border rounded-[2.5rem] group transition-all ${theme === 'dark' ? 'bg-blue-400/5 border-blue-400/20 hover:bg-blue-400/10' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'}`}>
                    <div className="text-4xl mb-4">〰️</div>
                    <h3 className="text-blue-600 font-black text-xl mb-2">Resistance (R)</h3>
                    <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Measured in **Ohms (Ω)**. It represents how much a material opposes the flow of electric current.</p>
                  </div>
                </div>

                <section className={`rounded-[3rem] border p-10 lg:p-16 relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] -z-10 ${theme === 'dark' ? 'bg-blue-600/5' : 'bg-blue-500/5'}`}></div>
                  <div className="flex flex-col lg:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-6">
                      <h3 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>The Water Pipe Analogy</h3>
                      <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                        To visualize invisible electrons, imagine water flowing through a system of pipes:
                      </p>
                      <ul className="space-y-4">
                        <li className="flex gap-4">
                          <span className="text-blue-600 font-black">1.</span>
                          <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>**Voltage** is like the **Water Pressure** from a pump. The higher the pressure, the harder the water is pushed.</span>
                        </li>
                        <li className="flex gap-4">
                          <span className="text-blue-600 font-black">2.</span>
                          <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>**Current** is like the **Flow Rate**. It's the amount of water moving through the pipe per second.</span>
                        </li>
                        <li className="flex gap-4">
                          <span className="text-blue-600 font-black">3.</span>
                          <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>**Resistance** is like the **Pipe Diameter**. A narrow pipe resists flow more than a wide pipe.</span>
                        </li>
                      </ul>
                    </div>
                    <div className={`w-64 h-64 rounded-full flex items-center justify-center border shrink-0 ${theme === 'dark' ? 'bg-blue-600/10 border-blue-500/20 shadow-2xl shadow-blue-600/10' : 'bg-blue-50 border-blue-100 shadow-inner'}`}>
                      <span className="text-7xl animate-pulse">🌊</span>
                    </div>
                  </div>
                </section>

                <section className={`border rounded-[2.5rem] p-10 ${theme === 'dark' ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50 border-red-100'}`}>
                  <h4 className="text-red-600 font-black text-xl mb-4 flex items-center gap-2">
                    <span>⚠️</span> LED Safety Warning
                  </h4>
                  <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                    Always use a resistor in series with an LED. Without it, the **Current (I)** will spike to levels that physically melt the delicate internal structure of the diode. In our lab, current above 100mA will destroy the LED instantly!
                  </p>
                </section>
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className={`text-5xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Curated Lab Lessons</h2>
                    <p className={`text-sm font-medium mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Explore expert demonstrations of electrical principles.</p>
                  </div>
                  <div className={`px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-slate-900 border-white/5 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>
                    External Resources
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {videos.map(v => (
                    <div key={v.id} className={`group rounded-[2.5rem] border overflow-hidden flex flex-col shadow-2xl transition-all ${theme === 'dark' ? 'bg-slate-900/40 border-white/5 hover:border-blue-500/30 hover:bg-slate-900/60' : 'bg-white border-slate-200 hover:border-blue-500/50'}`}>
                      <div className="aspect-video relative bg-slate-950 overflow-hidden">
                        <img 
                          src={`https://img.youtube.com/vi/${v.id}/maxresdefault.jpg`} 
                          alt={v.title}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all group-hover:scale-105 duration-500"
                          onError={(e) => {
                             (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`;
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-600/20 group-hover:scale-110 transition-transform duration-300">
                             <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                           </div>
                        </div>
                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-widest">
                          {v.cat}
                        </div>
                      </div>
                      <div className="p-8 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className={`font-bold text-xl mb-2 group-hover:text-blue-500 transition-colors leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{v.title}</h3>
                          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                            {v.channel}
                          </p>
                          <p className={`text-sm leading-relaxed line-clamp-2 mb-6 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                            {v.desc}
                          </p>
                        </div>
                        <a 
                          href={`https://www.youtube.com/watch?v=${v.id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 border shadow-xl ${theme === 'dark' ? 'bg-slate-800 hover:bg-blue-600 text-white border-white/5' : 'bg-slate-50 hover:bg-blue-600 hover:text-white border-slate-200'}`}
                        >
                          Watch on YouTube
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'components' && (
              <div className="space-y-12">
                <h2 className={`text-4xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Component Encyclopedia</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { name: "Battery", icon: "🔋", desc: "Chemical energy storage that creates a potential difference (Voltage) to push charges.", properties: "Main Property: Voltage (V)" },
                    { name: "Resistor", icon: "〰️", desc: "A passive component that opposes current. Useful for dropping voltage and protecting LEDs.", properties: "Main Property: Resistance (Ω)" },
                    { name: "LED", icon: "💡", desc: "Light Emitting Diode. A one-way gate for electricity that glows bright. Very sensitive to current!", properties: "Safe Current: ~20mA" }
                  ].map(c => (
                    <div key={c.name} className={`p-10 border rounded-[3rem] transition-all group ${theme === 'dark' ? 'bg-slate-900/40 border-white/5 hover:bg-slate-900/80' : 'bg-white border-slate-200 hover:shadow-lg'}`}>
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-inner group-hover:scale-110 transition-transform ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>{c.icon}</div>
                      <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{c.name}</h3>
                      <p className={`text-base leading-relaxed mb-6 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{c.desc}</p>
                      <div className={`text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full w-fit ${theme === 'dark' ? 'text-blue-400 bg-blue-400/10' : 'text-blue-600 bg-blue-50'}`}>{c.properties}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="min-h-[500px]">
                {!quizDifficulty ? (
                  <div className="text-center space-y-12 py-12">
                    <div className="space-y-4">
                      <h2 className={`text-5xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Knowledge Assessment</h2>
                      <p className={`text-lg font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Select a module to begin your proficiency test.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {(['Beginner', 'Intermediate', 'Advanced'] as Difficulty[]).map(level => (
                        <button
                          key={level}
                          onClick={() => setQuizDifficulty(level)}
                          className={`group relative border p-10 rounded-[3rem] transition-all hover:-translate-y-2 overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-slate-900/50 border-white/10 hover:bg-blue-600' : 'bg-white border-slate-200 hover:bg-blue-600'}`}
                        >
                          <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 block group-hover:text-white transition-colors ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{level}</span>
                          <h3 className={`text-2xl font-black transition-colors group-hover:text-white ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Start Quiz</h3>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : !showResult ? (
                  <div className={`border p-10 rounded-[3rem] shadow-2xl space-y-10 animate-in zoom-in-95 duration-300 ${theme === 'dark' ? 'bg-slate-900/40 border-white/10' : 'bg-white border-slate-200'}`}>
                    <div className="flex justify-between items-center pb-6 border-b border-white/5">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>Task {currentQuestionIndex + 1} / {QUIZ_DATA[quizDifficulty].length}</span>
                      <span className={`px-4 py-1.5 border rounded-full text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>{quizDifficulty}</span>
                    </div>
                    <h2 className={`text-3xl font-black tracking-tight leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {QUIZ_DATA[quizDifficulty][currentQuestionIndex].text}
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                      {QUIZ_DATA[quizDifficulty][currentQuestionIndex].options.map((opt, i) => (
                        <button
                          key={i}
                          disabled={isAnswered}
                          onClick={() => {
                            setSelectedOption(i);
                            setIsAnswered(true);
                            if (i === QUIZ_DATA[quizDifficulty][currentQuestionIndex].correct) setScore(score + 1);
                          }}
                          className={`p-6 rounded-2xl border text-left font-bold transition-all text-sm ${
                            isAnswered
                              ? i === QUIZ_DATA[quizDifficulty][currentQuestionIndex].correct
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600'
                                : i === selectedOption
                                  ? 'bg-red-500/20 border-red-500 text-red-600'
                                  : 'bg-white/5 border-white/5 text-slate-400'
                              : theme === 'dark' 
                                ? 'bg-white/5 border-white/10 hover:border-blue-500/50 hover:bg-white/10 text-slate-300' 
                                : 'bg-slate-50 border-slate-200 hover:border-blue-500 hover:bg-white text-slate-600'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {isAnswered && (
                      <div className={`animate-in fade-in slide-in-from-top-4 p-8 border rounded-3xl ${theme === 'dark' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-2 text-center ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>Diagnostics Result</p>
                        <p className={`text-sm font-medium leading-relaxed mb-8 text-center ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{QUIZ_DATA[quizDifficulty][currentQuestionIndex].explanation}</p>
                        <button 
                          onClick={() => {
                            if (currentQuestionIndex < QUIZ_DATA[quizDifficulty].length - 1) {
                              setCurrentQuestionIndex(currentQuestionIndex + 1);
                              setIsAnswered(false);
                              setSelectedOption(null);
                            } else {
                              setShowResult(true);
                            }
                          }}
                          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20"
                        >
                          Continue →
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-12 py-24">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto border shadow-2xl ${theme === 'dark' ? 'bg-blue-600/20 border-blue-600/20' : 'bg-blue-50 border-blue-100'}`}>🎓</div>
                    <div className="space-y-4">
                      <h2 className={`text-6xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Evaluation Finished</h2>
                      <p className={`text-xl font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Results Processed: <span className="text-blue-600 font-black">{score} / {QUIZ_DATA[quizDifficulty].length}</span></p>
                    </div>
                    <button onClick={() => { setQuizDifficulty(null); setShowResult(false); setScore(0); setCurrentQuestionIndex(0); }} className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Select New Module</button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        <div className={`w-full lg:w-[420px] flex-none border-l flex flex-col shadow-2xl transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950/20 border-white/5' : 'bg-white border-slate-200'}`}>
          <div className={`p-8 border-b flex items-center gap-4 ${theme === 'dark' ? 'bg-indigo-600/5 border-white/5' : 'bg-indigo-50/50 border-slate-100'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border rotate-3 ${theme === 'dark' ? 'bg-indigo-600/20 border-indigo-500/20' : 'bg-white border-indigo-100'}`}>🤖</div>
            <div>
              <h3 className={`text-sm font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Ask Ohmie AI</h3>
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest animate-pulse">Consultant Online</p>
            </div>
          </div>
          <div className={`flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar ${theme === 'dark' ? 'bg-black/10' : 'bg-slate-50'}`}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[90%] px-6 py-4 rounded-[2rem] text-[13px] shadow-sm leading-relaxed ${
                  m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : theme === 'dark' ? 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                }`}>{m.role === 'bot' ? formatText(m.text, theme) : m.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className={`border px-6 py-4 rounded-2xl flex items-center gap-3 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="flex gap-1.5"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-.3s]"></div><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-.5s]"></div></div>
                  <span className={`text-[10px] font-black ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Analyzing...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className={`p-8 border-t transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950 border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about voltage spikes..."
                className={`flex-1 border rounded-2xl px-6 py-4 text-xs font-medium focus:outline-none transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-indigo-500 placeholder:text-slate-600 text-white' : 'bg-slate-50 border-slate-200 focus:border-indigo-600 placeholder:text-slate-400 text-slate-900'}`}
              />
              <button 
                onClick={handleSend}
                disabled={isTyping}
                className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-indigo-600/20 active:scale-90"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeHub;

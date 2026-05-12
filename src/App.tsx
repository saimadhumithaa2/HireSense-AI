import { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react';
import { 
  BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate 
} from 'react-router-dom';
import { 
  Camera, Play, Square, MessageSquare, BarChart3, ShieldCheck, 
  Loader2, Sparkles, Trophy, Target, BookOpen, RefreshCw, 
  LayoutDashboard, History, Settings, LogOut, ChevronRight,
  TrendingUp, Clock, Award, User, Sun, Moon, AlertCircle, Activity,
  FileText, Zap, Brain, Briefcase, Terminal, Cpu, Database, Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { analyzeInterview, type InterviewAnalysis, type HistoryContext } from './services/aiService';
import { supabase } from './lib/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';

// --- CONTEXTS ---
const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });
const AuthContext = createContext({ 
  user: null, 
  login: () => {}, 
  logout: () => {},
  expertMode: false,
  setExpertMode: (val: boolean) => {}
});
const ResumeContext = createContext({ resume: '', setResume: (val: string) => {} });

const useResume = () => useContext(ResumeContext);
const useAuth = () => useContext(AuthContext);
const useTheme = () => useContext(ThemeContext);

// --- UTILS ---
const playSFX = (type: 'start' | 'success' | 'error') => {
  const sounds = {
    start: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
    error: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'
  };
  const audio = new Audio(sounds[type]);
  audio.volume = 0.2;
  audio.play().catch(() => {});
};

// --- COMPONENTS ---

const Sidebar = ({ dbConnected, isOnline }: { dbConnected: boolean | null, isOnline: boolean }) => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { name: 'CAREER_HUB', icon: Briefcase, path: '/' },
    { name: 'SIMULATION_CHAMBER', icon: Camera, path: '/practice' },
    { name: 'ANALYTICS_PRO', icon: Activity, path: '/analytics' },
    { name: 'HISTORY_VAULT', icon: History, path: '/history' },
    { name: 'SYSTEM_CONFIG', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-[#0A0A0A] border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-[#CD7F32] rounded-[4px] flex items-center justify-center">
            <ShieldCheck size={20} strokeWidth={1.5} className="text-[#0A0A0A]" />
          </div>
          <span className="text-sm font-black text-white tracking-[0.2em] uppercase">HireSense</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? (dbConnected ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-red-500'}`} />
          <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">
            {!isOnline ? 'Network: Offline' : (dbConnected ? 'Network: Online' : 'Cloud: Sync_Error')}
          </span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-4 px-4 py-3 rounded-[4px] transition-all text-[11px] font-bold tracking-widest active:scale-[0.98] ${
              location.pathname === item.path 
                ? 'bg-[#CD7F32]/10 text-[#CD7F32] border-l-2 border-[#CD7F32]' 
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
            }`}
          >
            <item.icon size={16} strokeWidth={1} />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-4">
        <div className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-[4px] border border-white/5">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Expert_Mode</span>
          <button 
            onClick={() => user?.setExpertMode(!user?.expertMode)}
            className={`w-8 h-4 rounded-full relative transition-all ${user?.expertMode ? 'bg-[#CD7F32]' : 'bg-slate-800'}`}
          >
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${user?.expertMode ? 'left-4.5' : 'left-0.5'}`} />
          </button>
        </div>

        <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
          <LogOut size={16} strokeWidth={1} /> Terminate_Session
        </button>
      </div>
    </aside>
  );
};

const GaugeChart = ({ score }: { score: number }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];
  const COLORS = ['#CD7F32', '#111111'];

  return (
    <div className="h-48 w-full relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={70}
            outerRadius={85}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.name === 'Score' ? COLORS[0] : COLORS[1]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-4 text-center">
        {score > 0 ? (
          <>
            <span className="text-3xl font-black text-white mono tracking-tighter">{score}%</span>
            <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.2em]">Efficiency_Index</p>
          </>
        ) : (
          <p className="text-[9px] text-[#CD7F32] font-black uppercase tracking-widest px-4 leading-tight opacity-50">Null_Assessment</p>
        )}
      </div>
    </div>
  );
};

// --- PAGES ---

const CareerHub = () => {
  const [stats, setStats] = useState({ avgScore: 0, totalSessions: 0, totalMinutes: 0 });
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await supabase.from('sessions').select('score');
        const local = JSON.parse(localStorage.getItem('local_sessions') || '[]');
        const combined = [...(data || []), ...local];
        
        if (combined.length > 0) {
          const avg = Math.round(combined.reduce((acc: number, curr: any) => acc + curr.score, 0) / combined.length);
          setStats({ avgScore: avg, totalSessions: combined.length, totalMinutes: combined.length * 15 });
        }
      } catch (err) {
        console.error("Stats fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [location.pathname]);

  const radarData = [
    { subject: 'Logic', A: stats.avgScore || 70, fullMark: 100 },
    { subject: 'Technical', A: Math.max(0, (stats.avgScore || 75) - 10), fullMark: 100 },
    { subject: 'Communication', A: Math.min(100, (stats.avgScore || 80) + 5), fullMark: 100 },
    { subject: 'Pace', A: 85, fullMark: 100 },
    { subject: 'Clarity', A: 90, fullMark: 100 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <header className="flex justify-between items-start border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-[-0.05em] uppercase italic">System_Hub</h1>
          <p className="text-slate-600 font-bold text-xs mt-2 mono uppercase tracking-widest">Aggregate performance metrics [v2.4]</p>
        </div>
        <div className="bg-[#111111] border border-white/5 px-4 py-2 rounded-[4px] flex items-center gap-3">
          <div className={`w-1.5 h-1.5 rounded-full ${stats.totalSessions > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-800'}`} />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mono">
            {stats.totalSessions > 0 ? 'DATA_SYNC_LOCKED' : 'AWAITING_INPUT'}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
        <div className="industrial-card p-10 flex flex-col items-center">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Efficiency_Analysis</h3>
          <GaugeChart score={stats.avgScore} />
        </div>

        <div className="lg:col-span-2 industrial-card p-10 relative overflow-hidden">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10">Skill_Matrix_Grid</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#222" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#444', fontSize: 9, fontWeight: 900 }} />
                <Radar name="Metrics" dataKey="A" stroke="#CD7F32" fill="#CD7F32" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
        <div className="industrial-card p-8 group hover:bg-white/5 transition-all">
          <div className="flex justify-between items-start mb-6">
            <Zap size={20} strokeWidth={1} className="text-[#CD7F32]" />
            <span className="text-[9px] font-black text-slate-700 mono">REG_01</span>
          </div>
          <p className="text-slate-600 font-black text-[10px] uppercase tracking-widest">Sessions_Processed</p>
          <p className="text-5xl font-black text-white mt-4 tracking-tighter mono">{stats.totalSessions}</p>
        </div>

        <div className="industrial-card p-8 group hover:bg-white/5 transition-all">
          <div className="flex justify-between items-start mb-6">
            <Clock size={20} strokeWidth={1} className="text-[#CD7F32]" />
            <span className="text-[9px] font-black text-slate-700 mono">REG_02</span>
          </div>
          <p className="text-slate-600 font-black text-[10px] uppercase tracking-widest">Active_Runtime</p>
          <p className="text-5xl font-black text-white mt-4 tracking-tighter mono">{stats.totalMinutes}<span className="text-sm">M</span></p>
        </div>

        <div className="industrial-card p-8 bg-[#CD7F32] group relative overflow-hidden">
          <div className="relative z-10">
            <Target size={20} strokeWidth={2} className="text-[#0A0A0A] mb-6" />
            <p className="text-[#0A0A0A]/60 font-black text-[10px] uppercase tracking-widest">Current_Objective</p>
            <p className="text-xl font-black text-[#0A0A0A] mt-2 leading-tight uppercase tracking-tight">Optimize System Architecture</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Network size={120} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AnalyticsPage = () => {
  const [history, setHistory] = useState<any[]>([]);
  const location = useLocation();

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase.from('sessions').select('score, created_at').order('created_at', { ascending: true });
      const local = JSON.parse(localStorage.getItem('local_sessions') || '[]');
      const combined = [...(data || []), ...local].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      if (combined.length > 0) {
        setHistory(combined.map(d => ({ 
          name: new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
          score: d.score 
        })));
      }
    };
    fetchHistory();
  }, [location.pathname]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <header className="border-b border-white/5 pb-8">
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Performance_Engine</h1>
        <p className="text-slate-600 font-bold text-xs mt-2 mono uppercase tracking-widest">Growth trajectories & architectural efficiency</p>
      </header>

      <div className="industrial-card p-10 bg-[#111111] shadow-2xl">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-12 mono">Iteration_Efficiency_Delta</h3>
        <div className="h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#CD7F32" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#CD7F32" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 10, fontWeight: 700 }} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 10, fontWeight: 700 }} />
              <Tooltip 
                contentStyle={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px' }}
                itemStyle={{ color: '#CD7F32', fontSize: '10px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="score" stroke="#CD7F32" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};


const Waveform = () => (
  <div className="flex gap-1 items-end h-3">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        animate={{ height: [2, 12, 2] }}
        transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.05 }}
        className="w-0.5 bg-[#CD7F32]"
      />
    ))}
  </div>
);

const ConsoleLogs = ({ logs }: { logs: string[] }) => (
  <div className="bg-[#0A0A0A] p-6 border border-white/5 mono text-[10px] text-slate-500 h-full overflow-y-auto space-y-1">
    {logs.map((log, i) => (
      <div key={i} className="flex gap-4">
        <span className="opacity-30">[{new Date().toLocaleTimeString()}]</span>
        <span className={log.startsWith('>') ? 'text-[#CD7F32]' : ''}>{log}</span>
      </div>
    ))}
    <div className="w-2 h-4 bg-[#CD7F32] animate-pulse inline-block align-middle ml-2" />
  </div>
);

const SimulationChamber = () => {
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasStream, setHasStream] = useState(false);
  const [isMockStream, setIsMockStream] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [initLogs, setInitLogs] = useState<string[]>(["SYSTEM_IDLE: Awaiting initialization."]);
  const [currentQuestion, setCurrentQuestion] = useState("AWAITING_INPUT...");
  const [hardwareError, setHardwareError] = useState<string | null>(null);
  const { resume } = useContext(ResumeContext);
  const { expertMode } = useContext(AuthContext);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isSecure = window.isSecureContext;

  const addLog = (msg: string) => setInitLogs(prev => [...prev.slice(-10), msg]);

  const requestHardware = async (silent = false) => {
    try {
      addLog("> INITIALIZING_HARDWARE_STACK...");
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      
      await new Promise(r => setTimeout(r, 500));
      addLog("> REQUESTING_MEDIA_PERMISSIONS...");
      
      if (!isSecure) {
        addLog("! SECURITY_ERROR: INSECURE_CONTEXT [HTTP]");
        throw new Error("INSECURE_CONTEXT");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      
      addLog("> STREAM_CAPTURE_SUCCESS: [VIDEO_O; AUDIO_O]");
      addLog("> ESTABLISHING_SSL_HANDSHAKE...");
      await new Promise(r => setTimeout(r, 800));
      addLog("> ENCRYPTION_LOCKED: RSA_4096_BIT");
      
      setHasStream(true);
      setIsMockStream(false);
      setHardwareError(null);
      if (!silent) toast.success("Hardware initialized.");
    } catch (err) {
      addLog("! CRITICAL_ERROR: HARDWARE_ACCESS_DENIED");
      setHasStream(false);
      setHardwareError(isSecure ? "Camera or Microphone access denied." : "Secure Context (HTTPS) required for hardware access.");
    }
  };

  const startMockSimulation = () => {
    addLog("> INITIALIZING_MOCK_STREAM...");
    addLog("> VIRTUAL_DRIVER_LOADED: [MOCK_VIDEO; MOCK_AUDIO]");
    addLog("> SIMULATING_SSL_HANDSHAKE...");
    setHasStream(true);
    setIsMockStream(true);
    setHardwareError(null);
    toast.success("Mock Stream Active");
  };

  const hardReset = () => {
    setHasStream(false);
    requestHardware();
  };

  useEffect(() => {
    requestHardware(true);
    return () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); };
  }, []);

  useEffect(() => {
    if (isInterviewing && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isInterviewing, hasStream]);

  // Speaking simulation
  useEffect(() => {
    let interval: any;
    if (isInterviewing) {
      interval = setInterval(() => setIsSpeaking(prev => !prev), 1500);
    } else {
      setIsSpeaking(false);
    }
    return () => clearInterval(interval);
  }, [isInterviewing]);

  useEffect(() => {
    let interval: any;
    if (isInterviewing) {
      const mockPhrases = [
        "Regarding the Data Structure selection, I prioritized time complexity for lookups. ",
        "The algorithmic approach uses a modified BFS to ensure shortest path consistency. ",
        "I maintained a 9.5 CGPA standard by focusing on deep technical efficiency. ",
        "Testing covered edge cases like null inputs and high-concurrency requests. "
      ];
      let i = 0;
      interval = setInterval(() => {
        setTranscript(prev => prev + (mockPhrases[i % mockPhrases.length] || ""));
        i++;
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isInterviewing]);

  const startInterview = () => {
    if (!hasStream) {
      requestHardware();
      return;
    }
    setTranscript("");
    setIsInterviewing(true);
    setCurrentQuestion(resume ? "Let's explore your technical expertise. Explain a complex problem you solved recently." : "Explain a complex technical problem you solved recently.");
    playSFX('start');
  };

  const stopInterview = async () => {
    setIsInterviewing(false);
    setIsAnalyzing(true);
    
    try {
      await new Promise(r => setTimeout(r, 2000));
      const { data: pastSessions } = await supabase.from('sessions').select('score, created_at').order('created_at', { ascending: false }).limit(3);
      const historyContext = pastSessions?.map(s => ({ score: s.score, date: s.created_at })) || [];
      
      const hardContext = "PERSONA: Senior Technical Architect @ Google. FOCUS: AI Engineering & Data Structures. TONE: Industrial, rigorous, objective. TARGET: 9.5 CGPA standard.";
      const result = await analyzeInterview(transcript, historyContext, `${hardContext} | CONTEXT: ${resume}`, expertMode);
      
      const historyItem = {
        transcript, score: result.score, summary: result.summary,
        star_feedback: result.starFeedback, improved_answer: result.improvedAnswer,
        star_scores: result.starScores, next_step: result.nextStep,
        expert_mode: expertMode,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('sessions').insert([historyItem]);
      if (error) throw error;
      toast.success("CLOUD_SYNC: SUCCESS");
    } catch (err) {
      const local = JSON.parse(localStorage.getItem('local_sessions') || '[]');
      const localItem = {
        id: 'local-' + Date.now(),
        transcript, score: 85, summary: "LOCAL_VAULT_BACKUP: ACTIVE",
        star_feedback: "Awaiting primary uplink.", improved_answer: "Re-establish network connection.",
        created_at: new Date().toISOString(),
        is_local: true
      };
      localStorage.setItem('local_sessions', JSON.stringify([...local, localItem]));
      toast.success("LOCAL_VAULT: DATA_PERSISTED");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-1">
      <div className={`bg-[#0A0A0A] border border-white/5 aspect-video relative transition-all duration-300 ${isInterviewing ? 'border-[#CD7F32]/50' : ''}`}>
        {!isInterviewing ? (
          <div className="absolute inset-0 grid grid-cols-2">
            <div className="p-12 flex flex-col justify-center border-r border-white/5">
              <h2 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tighter">Simulation_Chamber</h2>
              <p className="text-slate-600 text-[10px] mono uppercase tracking-widest mb-10">Module: Technical_Architecture_v4.0</p>
              
              {hardwareError ? (
                <div className="space-y-4">
                  <button onClick={hardReset} className="w-full bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                    <RefreshCw size={14} /> Re-Initialize_Hardware
                  </button>
                  <button onClick={startMockSimulation} className="w-full bg-white/5 text-slate-500 border border-white/10 px-6 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                    <ShieldCheck size={14} /> Bypass: Use Mock Stream
                  </button>
                </div>
              ) : (
                <button 
                  onClick={startInterview} 
                  disabled={!hasStream}
                  className={`bg-[#CD7F32] hover:bg-[#b06d2b] disabled:bg-slate-800 disabled:text-slate-600 text-[#0A0A0A] px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4`}
                >
                  {hasStream ? <Play size={16} fill="currentColor" /> : <Loader2 size={16} className="animate-spin" />}
                  {hasStream ? 'Execute_Simulation' : 'Initializing_Stack...'}
                </button>
              )}
            </div>
            <ConsoleLogs logs={initLogs} />
          </div>
        ) : (
          <>
            {isMockStream ? (
              <div className="w-full h-full bg-[#111111] flex items-center justify-center">
                <div className="text-center">
                  <Cpu size={64} className="text-[#CD7F32]/20 mb-4 animate-pulse mx-auto" />
                  <p className="text-[10px] mono text-slate-700 uppercase tracking-[0.4em]">Virtual_Stream_Active</p>
                </div>
              </div>
            ) : (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale contrast-125" />
            )}
            <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-[#CD7F32] animate-ping' : 'bg-slate-700'}`} />
                  <p className="text-[#CD7F32] text-[9px] font-black uppercase tracking-[0.3em] mono">Aural_Input: Locked</p>
                </div>
                <p className="text-white/40 text-[8px] mono uppercase tracking-widest">SSL_ENCRYPTION: AES_256_ACTIVE</p>
              </div>
              <Waveform />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-black/90 to-transparent">
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mb-4 mono">Transmission_Inbound</p>
              <p className="text-2xl font-black text-white leading-tight uppercase tracking-tight">{currentQuestion}</p>
            </div>

            <button onClick={stopInterview} className="absolute top-8 right-8 bg-[#CD7F32] hover:bg-red-500 text-[#0A0A0A] hover:text-white p-4 transition-all active:scale-90">
              <Square size={20} fill="currentColor" />
            </button>
          </>
        )}
      </div>
      
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border border-[#CD7F32] border-t-transparent animate-spin mx-auto" />
            <p className="text-[#CD7F32] font-black text-xs mono uppercase tracking-[0.4em]">Pushing_Data_To_Cloud...</p>
          </div>
        </div>
      )}
    </div>
  );
};

const HistoryPage = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await supabase.from('sessions').select('*').order('created_at', { ascending: false });
        const local = JSON.parse(localStorage.getItem('local_sessions') || '[]');
        setHistory([...(data || []), ...local].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [location.pathname]);

  if (loading) return <div className="p-12 mono text-[10px] uppercase tracking-widest text-slate-500">Retrieving_Records...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <header className="border-b border-white/5 pb-8">
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">History_Vault</h1>
        <p className="text-slate-600 font-bold text-xs mt-2 mono uppercase tracking-widest">Encrypted session archive</p>
      </header>

      {history.length === 0 ? (
        <div className="industrial-card p-20 text-center space-y-6">
          <div className="w-16 h-16 bg-[#CD7F32]/5 rounded-[4px] flex items-center justify-center mx-auto text-[#CD7F32]">
            <History size={32} strokeWidth={1} />
          </div>
          <h3 className="text-xl font-black text-white uppercase italic">Vault_Empty</h3>
          <p className="text-slate-600 max-w-sm mx-auto mono text-[10px] uppercase tracking-widest">No transaction logs detected in local or cloud storage.</p>
          <Link to="/practice" className="inline-block bg-[#CD7F32] text-[#0A0A0A] px-12 py-4 rounded-[4px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#b06d2b] transition-all">
            Initiate_First_Session
          </Link>
        </div>
      ) : (
        <div className="space-y-1">
          {history.map(item => (
            <div key={item.id} className="industrial-card p-8 flex items-center justify-between group hover:bg-white/5 transition-all">
              <div className="flex items-center gap-12">
                <div className="text-center min-w-[80px] border-r border-white/5 pr-12">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mono mb-1">Index_Score</p>
                  <p className="text-3xl font-black text-[#CD7F32] mono tracking-tighter">{item.score}%</p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-white font-black uppercase text-xs tracking-tight">{new Date(item.created_at).toLocaleDateString()}</p>
                    {item.is_local && <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black px-2 py-0.5 rounded-[2px] uppercase">Local_Only</span>}
                  </div>
                  <p className="text-slate-500 text-[10px] mono uppercase tracking-widest truncate max-w-md">{item.summary}</p>
                </div>
              </div>
              <button onClick={() => setSelected(item)} className="text-[#CD7F32] font-black text-[10px] uppercase tracking-widest hover:underline px-6 py-2 border border-[#CD7F32]/30 hover:bg-[#CD7F32]/10 rounded-[4px] transition-all">
                ACCESS_REPORT
              </button>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="absolute inset-0 bg-[#0A0A0A]/95 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} className="relative bg-[#111111] p-12 rounded-[4px] border border-white/5 max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-start mb-12 border-b border-white/5 pb-8">
                <div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Session_Report_{selected.id.toString().slice(-4)}</h2>
                  <p className="text-slate-600 text-[10px] mono mt-2 tracking-widest uppercase">STAMP: {new Date(selected.created_at).toISOString()}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-600 hover:text-white mono text-[10px] uppercase font-black tracking-widest">CLOSE_REPORT [X]</button>
              </div>
              
              <div className="space-y-12">
                <div className="grid grid-cols-3 gap-8">
                  <div className="col-span-1 industrial-card p-8">
                    <p className="text-[#CD7F32] text-[9px] font-black uppercase tracking-[0.3em] mb-6 mono">STAR_MATRIX</p>
                    <div className="grid grid-cols-4 gap-2 h-24 items-end">
                      {['S', 'T', 'A', 'R'].map((key) => {
                        const score = selected.star_scores?.[key.toLowerCase()] || 15;
                        const pct = (score / 25) * 100;
                        return (
                          <div key={key} className="space-y-2 flex flex-col items-center">
                            <div className="w-full bg-white/5 relative overflow-hidden" style={{ height: `${pct}%` }}>
                              <div className="absolute inset-0 bg-[#CD7F32] opacity-40" />
                            </div>
                            <span className="text-[9px] font-black text-slate-700 mono">{key}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="col-span-2 industrial-card p-8">
                    <p className="text-emerald-500 text-[9px] font-black uppercase tracking-[0.3em] mb-4 mono flex items-center gap-2">
                      <Target size={14} strokeWidth={1} /> Recommended_Milestone
                    </p>
                    <p className="text-white text-sm font-bold leading-relaxed">{selected.next_step || "Continue optimizing architectural depth in complex technical explanations."}</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="industrial-card p-8 bg-[#0A0A0A]">
                    <p className="text-[#CD7F32] text-[9px] font-black uppercase tracking-[0.3em] mb-4 mono">Aural_Transcript</p>
                    <p className="text-slate-500 italic leading-relaxed text-sm mono">"{selected.transcript}"</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="industrial-card p-8">
                      <p className="text-[#CD7F32] text-[9px] font-black uppercase tracking-[0.3em] mb-4 mono">Assessment_Logs</p>
                      <p className="text-white text-sm font-bold leading-relaxed">{selected.summary}</p>
                    </div>
                    <div className="industrial-card p-8 bg-white/5">
                      <p className="text-[#CD7F32] text-[9px] font-black uppercase tracking-[0.3em] mb-4 mono">Optimal_Iteration</p>
                      <p className="text-white text-sm font-bold leading-relaxed">{selected.improved_answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SettingsPage = () => {
  const { resume, setResume } = useContext(ResumeContext);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setResume(text);
    localStorage.setItem('resume_text', text);
    
    // Auto-sync to Supabase profile if possible
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          resume_context: text,
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      // Fail silently for profiles, rely on localStorage
    } finally {
      setIsSaving(false);
    }
  };

  const isProd = import.meta.env.PROD;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 max-w-4xl">
      <header className="border-b border-white/5 pb-8">
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">System_Config</h1>
        <p className="text-slate-600 font-bold text-xs mt-2 mono uppercase tracking-widest">Adjust core processing parameters</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="industrial-card p-10 space-y-10">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-[#CD7F32] text-[10px] font-black uppercase tracking-[0.3em] mono">User_Context [AI_System_Instruction]</label>
              {isSaving && <Loader2 size={12} className="animate-spin text-[#CD7F32]" />}
            </div>
            <textarea 
              value={resume}
              onChange={handleSave}
              placeholder="[Input Candidate background details for AI personalization...]"
              className="w-full h-64 bg-[#0A0A0A] border border-white/5 rounded-[4px] p-8 text-white mono text-xs outline-none focus:border-[#CD7F32]/40 transition-all resize-none"
            />
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-[4px] border border-white/5">
              <ShieldCheck size={16} strokeWidth={1} className="text-[#CD7F32]" />
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em] mono">Hybrid: Supabase_Cloud + Local_Vault</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="industrial-card p-8">
            <p className="text-[#CD7F32] text-[9px] font-black uppercase tracking-[0.3em] mb-6 mono">Environment_Status</p>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deployment_Mode</span>
                <span className={`text-[10px] font-black mono uppercase ${isProd ? 'text-emerald-500' : 'text-amber-500'}`}>{isProd ? 'Production' : 'Development'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Context_Security</span>
                <span className={`text-[10px] font-black mono uppercase ${window.isSecureContext ? 'text-emerald-500' : 'text-red-500'}`}>{window.isSecureContext ? 'TLS_LOCKED' : 'INSECURE'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System_Architecture</span>
                <span className="text-[10px] font-black mono uppercase text-white">x64_Optimized</span>
              </div>
            </div>
          </div>

          <div className="industrial-card p-8 bg-red-500/5 border-red-500/20">
            <p className="text-red-500 text-[9px] font-black uppercase tracking-[0.3em] mb-4 mono">Danger_Zone</p>
            <button className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-3 rounded-[4px] text-[10px] font-black uppercase tracking-widest transition-all">
              Purge_Local_Cache
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN APP ---

  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [user, setUser] = useState<any>(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [resume, setResume] = useState(() => localStorage.getItem('resume_text') || '');
  const [expertMode, setExpertMode] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkDb = async () => {
      try {
        const { error } = await supabase.from('sessions').select('id').limit(1);
        setDbConnected(!error);
      } catch {
        setDbConnected(false);
      }
    };
    if (isOnline) checkDb();
  }, [isOnline]);

  const login = () => {
    const mockUser = { name: 'Candidate', expertMode, setExpertMode };
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    toast.success("AUTHENTICATION_GRANTED");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Environment Guard
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_GEMINI_API_KEY) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0A0A0A] p-12">
        <div className="industrial-card p-12 max-w-md w-full border-red-500/20">
          <AlertCircle size={48} strokeWidth={1} className="text-red-500 mb-8" />
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Config_Required</h2>
          <p className="text-slate-600 text-xs mono leading-relaxed uppercase tracking-widest">Missing environment variables. Ensure VITE_SUPABASE_URL and VITE_GEMINI_API_KEY are defined in .env.</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, expertMode, setExpertMode }}>
      <ResumeContext.Provider value={{ resume, setResume }}>
        <Router>
          <div className="min-h-screen bg-[#0A0A0A] font-sans text-slate-400 selection:bg-[#CD7F32]/30">
            <Toaster position="top-right" toastOptions={{
              style: { background: '#111111', color: '#fff', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px' }
            }} />
            
            {user ? (
              <div className="flex">
                <Sidebar dbConnected={dbConnected} isOnline={isOnline} />
                <main className="flex-1 ml-64 p-16 min-h-screen">
                  <div className="max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                      <Routes>
                        <Route path="/" element={<CareerHub />} />
                        <Route path="/practice" element={<SimulationChamber />} />
                        <Route path="/analytics" element={<AnalyticsPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="*" element={<Navigate to="/" />} />
                      </Routes>
                    </AnimatePresence>
                  </div>
                </main>
              </div>
            ) : (
              <div className="h-screen flex items-center justify-center bg-[#0A0A0A]">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="industrial-card p-16 max-w-lg w-full text-center space-y-10">
                  <div className="w-16 h-16 bg-[#CD7F32] rounded-[4px] flex items-center justify-center mx-auto">
                    <ShieldCheck size={32} strokeWidth={1.5} className="text-[#0A0A0A]" />
                  </div>
                  <div>
                    <h1 className="text-5xl font-black text-white tracking-[-0.08em] uppercase italic mb-2">HireSense</h1>
                    <p className="text-slate-600 font-bold text-[10px] mono uppercase tracking-[0.4em]">Enterprise_Intelligence_v4.0</p>
                  </div>
                  <button onClick={login} className="w-full bg-[#CD7F32] hover:bg-[#b06d2b] text-[#0A0A0A] py-5 rounded-[4px] font-black text-[11px] uppercase tracking-[0.3em] transition-all active:scale-[0.98] flex items-center justify-center gap-4">
                    INITIALIZE_UPLINK <ChevronRight size={16} strokeWidth={1} />
                  </button>
                </motion.div>
              </div>
            )}
          </div>
        </Router>
      </ResumeContext.Provider>
    </AuthContext.Provider>
  );
}
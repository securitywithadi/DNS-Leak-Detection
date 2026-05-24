import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Activity, Shield, Globe, Terminal, Server, 
  Zap, ShieldAlert, Cpu, Settings, Play, Pause,
  Radio, Lock
} from 'lucide-react';

// --- MOCK DATA CONSTANTS ---
const DOMAINS = [
  'api.github.com', 'google.com', 'telemetry.microsoft.com', 
  'ad.doubleclick.net', 'netflix.com', 'fonts.googleapis.com', 
  'tracker.analytics.io', '1.1.1.1.cloudflare.com', 'steamcommunity.com', 
  'update.windows.com', 'analytics.twitter.com', 'cdn.discordapp.com'
];
const TYPES = ['A', 'A', 'A', 'AAAA', 'CNAME', 'HTTPS'];
const STATUS_TYPES = ['RESOLVED', 'RESOLVED', 'CACHED', 'BLOCKED', 'TIMEOUT'];
const IPS = ['192.168.1.1', '10.0.0.42', '192.168.1.105', '127.0.0.1'];

// --- UTILS ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getLatency = (status) => status === 'CACHED' ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 120) + 10;

// --- CUSTOM SVG CHART COMPONENT ---
const CyberChart = ({ data }) => {
  const max = Math.max(...data, 10);
  const points = data.map((val, i) => `${(i / (data.length - 1)) * 100},${100 - (val / max) * 100}`).join(' ');

  return (
    <div className="relative w-full h-32 mt-4 bg-slate-900/50 border border-cyan-500/30 rounded overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0" style={{ 
        backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>
      
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(6, 182, 212, 0.5)" />
            <stop offset="100%" stopColor="rgba(6, 182, 212, 0.0)" />
          </linearGradient>
        </defs>
        <polygon points={`0,100 ${points} 100,100`} fill="url(#chartGrad)" />
        <polyline points={points} fill="none" stroke="#06b6d4" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
};

export default function App() {
  const [requests, setRequests] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const [settings, setSettings] = useState({
    blockAds: true,
    blockTelemetry: true,
    strictMode: false
  });
  const [metrics, setMetrics] = useState({
    total: 0,
    blocked: 0,
    avgLatency: 0
  });
  const [chartData, setChartData] = useState(Array(20).fill(0));
  
  const logsTopRef = useRef(null);

  // --- SIMULATION ENGINE ---
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Simulate burst traffic
      const numRequests = Math.floor(Math.random() * 3) + 1;
      const newReqs = [];
      
      for(let i=0; i < numRequests; i++) {
        const domain = getRandom(DOMAINS);
        let status = getRandom(STATUS_TYPES);
        
        // Apply dashboard settings to simulation
        if (settings.blockAds && domain.includes('doubleclick') || domain.includes('tracker')) {
          status = 'BLOCKED';
        }
        if (settings.blockTelemetry && domain.includes('telemetry')) {
          status = 'BLOCKED';
        }

        newReqs.push({
          id: generateId(),
          timestamp: new Date().toISOString(),
          domain,
          type: getRandom(TYPES),
          client: getRandom(IPS),
          status,
          latency: getLatency(status)
        });
      }

      setRequests(prev => {
        const updated = [...newReqs, ...prev].slice(0, 100); // Keep last 100
        return updated;
      });

      // Update Chart Data (requests per tick)
      setChartData(prev => [...prev.slice(1), numRequests]);

    }, 800); // Tick every 800ms

    return () => clearInterval(interval);
  }, [isLive, settings]);

  // Update Metrics
  useEffect(() => {
    if (requests.length === 0) return;
    
    const blockedCount = requests.filter(r => r.status === 'BLOCKED').length;
    const resolvedReqs = requests.filter(r => r.status === 'RESOLVED' || r.status === 'CACHED');
    const avgLat = resolvedReqs.length 
      ? Math.round(resolvedReqs.reduce((acc, curr) => acc + curr.latency, 0) / resolvedReqs.length)
      : 0;

    setMetrics(prev => ({
      total: prev.total + Math.floor(Math.random() * 3), // Cumulative fake total
      blocked: blockedCount,
      avgLatency: avgLat
    }));
  }, [requests]);


  // Auto-scroll terminal
  const scrollToTop = () => {
    logsTopRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToTop();
  }, [requests]);

  // --- RENDER HELPERS ---
  const getStatusColor = (status) => {
    switch(status) {
      case 'RESOLVED': return 'text-green-400';
      case 'CACHED': return 'text-cyan-400';
      case 'BLOCKED': return 'text-red-500';
      case 'TIMEOUT': return 'text-yellow-500';
      default: return 'text-slate-400';
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case 'RESOLVED': return 'bg-green-400/10 border-green-400/50';
      case 'CACHED': return 'bg-cyan-400/10 border-cyan-400/50';
      case 'BLOCKED': return 'bg-red-500/10 border-red-500/50';
      case 'TIMEOUT': return 'bg-yellow-500/10 border-yellow-500/50';
      default: return 'bg-slate-400/10 border-slate-400/50';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-cyan-50 font-mono p-4 md:p-6 overflow-hidden selection:bg-cyan-500/30">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-cyan-800/50 pb-4 shadow-[0_4px_20px_-10px_rgba(6,182,212,0.3)]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className={`w-8 h-8 ${isLive ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} />
            {isLive && <div className="absolute inset-0 bg-cyan-400 blur-md opacity-50 rounded-full animate-ping" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 uppercase">
              Nexus // DNS Telemetry
            </h1>
            <p className="text-xs text-cyan-600 flex items-center gap-2">
              <Lock className="w-3 h-3" /> SECURE LOCALHOST CONNECTION
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <button 
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-4 py-2 border rounded transition-all duration-300 ${
              isLive 
                ? 'border-cyan-500/50 bg-cyan-900/20 text-cyan-400 hover:bg-cyan-900/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isLive ? 'PAUSE STREAM' : 'RESUME STREAM'}
          </button>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT COLUMN: STATS & CONTROLS */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="bg-slate-900/40 border border-cyan-800/50 p-4 rounded-lg relative overflow-hidden group hover:border-cyan-400 transition-colors">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
              <Activity className="w-6 h-6 text-blue-400 mb-2" />
              <div className="text-xs text-slate-400">TOTAL QUERIES</div>
              <div className="text-2xl font-bold text-blue-100">{metrics.total.toLocaleString()}</div>
            </div>

            <div className="bg-slate-900/40 border border-red-900/50 p-4 rounded-lg relative overflow-hidden group hover:border-red-500 transition-colors">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-500/10 rounded-full blur-xl group-hover:bg-red-500/20 transition-all"></div>
              <ShieldAlert className="w-6 h-6 text-red-500 mb-2" />
              <div className="text-xs text-slate-400">THREATS BLOCKED</div>
              <div className="text-2xl font-bold text-red-400">{metrics.blocked}</div>
            </div>

            <div className="bg-slate-900/40 border border-green-800/50 p-4 rounded-lg relative overflow-hidden group hover:border-green-400 transition-colors">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-500/10 rounded-full blur-xl group-hover:bg-green-500/20 transition-all"></div>
              <Zap className="w-6 h-6 text-green-400 mb-2" />
              <div className="text-xs text-slate-400">AVG LATENCY</div>
              <div className="text-2xl font-bold text-green-100">{metrics.avgLatency} <span className="text-sm">ms</span></div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="bg-slate-900/60 border border-slate-700 p-4 rounded-lg flex-grow">
            <div className="flex items-center gap-2 mb-4 text-cyan-400 border-b border-cyan-900/50 pb-2">
              <Settings className="w-5 h-5" />
              <h2 className="font-semibold tracking-wider">ROUTER CONFIG</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-slate-300 group-hover:text-cyan-300 transition-colors">Block Ad Networks</span>
                <input 
                  type="checkbox" 
                  checked={settings.blockAds}
                  onChange={e => setSettings({...settings, blockAds: e.target.checked})}
                  className="sr-only" 
                />
                <div className={`w-10 h-5 rounded-full transition-colors ${settings.blockAds ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]' : 'bg-slate-700'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full mt-1 transition-transform ${settings.blockAds ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-slate-300 group-hover:text-cyan-300 transition-colors">Block Telemetry</span>
                <input 
                  type="checkbox" 
                  checked={settings.blockTelemetry}
                  onChange={e => setSettings({...settings, blockTelemetry: e.target.checked})}
                  className="sr-only" 
                />
                <div className={`w-10 h-5 rounded-full transition-colors ${settings.blockTelemetry ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]' : 'bg-slate-700'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full mt-1 transition-transform ${settings.blockTelemetry ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-slate-300 group-hover:text-cyan-300 transition-colors">Strict DNSSEC</span>
                <input 
                  type="checkbox" 
                  checked={settings.strictMode}
                  onChange={e => setSettings({...settings, strictMode: e.target.checked})}
                  className="sr-only" 
                />
                <div className={`w-10 h-5 rounded-full transition-colors ${settings.strictMode ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]' : 'bg-slate-700'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full mt-1 transition-transform ${settings.strictMode ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: TERMINAL & CHARTS */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Top Row: Network Graph & Info */}
          <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-4 h-64 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-cyan-400">
                <Activity className="w-5 h-5" />
                <h2 className="font-semibold tracking-wider">TRAFFIC FREQUENCY</h2>
              </div>
              <div className="text-xs text-slate-500">PACKETS / SEC</div>
            </div>
            <CyberChart data={chartData} />
          </div>

          {/* Bottom Row: Live Terminal */}
          <div className="bg-black border border-cyan-900/50 rounded-lg flex-grow flex flex-col relative overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)] min-h-[400px]">
            {/* Terminal Header */}
            <div className="bg-slate-900/80 px-4 py-2 flex items-center justify-between border-b border-cyan-900/50">
              <div className="flex items-center gap-2 text-cyan-500 text-sm">
                <Terminal className="w-4 h-4" />
                <span>LIVE_REQUEST_STREAM.log</span>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
            </div>

            {/* Terminal Output */}
            <div className="flex-grow p-4 overflow-y-auto font-mono text-sm space-y-1 relative">
              {/* Scanline Effect overlay */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-20"></div>
              
              {requests.length === 0 ? (
                <div className="text-slate-500 animate-pulse">Waiting for network traffic...</div>
              ) : (
                <div className="w-full text-left">
                  <div className="grid grid-cols-12 gap-2 text-slate-500 text-xs border-b border-slate-800 pb-2 mb-2 sticky top-0 bg-black/90 z-20">
                    <div className="col-span-2">TIMESTAMP</div>
                    <div className="col-span-4">DOMAIN</div>
                    <div className="col-span-1">TYPE</div>
                    <div className="col-span-2">CLIENT IP</div>
                    <div className="col-span-2">STATUS</div>
                    <div className="col-span-1 text-right">LAT(ms)</div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div ref={logsTopRef} />
                    {requests.map((req, i) => (
                      <div 
                        key={req.id} 
                        className={`grid grid-cols-12 gap-2 py-1.5 border-b border-slate-900/50 hover:bg-slate-900/30 transition-colors ${i === 0 ? 'animate-pulse' : ''}`}
                      >
                        <div className="col-span-2 text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">
                          {req.timestamp.split('T')[1].replace('Z','')}
                        </div>
                        <div className="col-span-4 text-cyan-100 truncate pr-2">
                          {req.domain}
                        </div>
                        <div className="col-span-1 text-purple-400">
                          {req.type}
                        </div>
                        <div className="col-span-2 text-slate-400 font-sans text-xs flex items-center">
                          {req.client}
                        </div>
                        <div className="col-span-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] border ${getStatusBg(req.status)} ${getStatusColor(req.status)}`}>
                            {req.status}
                          </span>
                        </div>
                        <div className="col-span-1 text-right text-slate-500">
                          {req.latency}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
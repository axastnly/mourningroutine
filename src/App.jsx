import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, Camera, X, Clock, Activity, Heart, Droplets, 
  TrendingUp, Battery, Moon, Zap, AlertCircle
} from 'lucide-react';

// Good Mourning - Physical health perfect, mental health [ERROR]
export default function MourningRoutine() {
  const [currentStage, setCurrentStage] = useState('dashboard');
  const [completedStages, setCompletedStages] = useState([]);
  const [stats, setStats] = useState({
    // Physical metrics
    sleepHours: 7.5,
    sleepQuality: 87,
    steps: 8247,
    protein: 150,
    hydration: 2.1,
    heartRate: 72,
    calories: 1847,
    // Mental metrics  
    existentialDread: 'High',
    motivation: 2,
    cryingEpisodes: 0,
    purpose: 'Not found',
    // Session tracking
    totalSessions: 0,
    consecutiveDays: 0,
    lastSession: null
  });
  const [sessionState, setSessionState] = useState({
    inProgress: false,
    currentStage: 'denial',
    sessionStart: null
  });
  const [showPermission, setShowPermission] = useState(false);

  const stages = ['denial', 'anger', 'bargaining', 'depression', 'acceptance'];

  const startRoutine = () => {
    setCompletedStages([]);
    setCurrentStage('denial');
    setSessionState({
      inProgress: true,
      currentStage: 'denial',
      sessionStart: new Date()
    });
    setShowPermission(true);
  };

  const nextStage = () => {
    const currentIndex = stages.indexOf(currentStage);
    if (currentStage !== 'dashboard' && currentStage !== 'completion') {
      setCompletedStages([...completedStages, currentStage]);
    }
    if (currentIndex < stages.length - 1) {
      const next = stages[currentIndex + 1];
      setCurrentStage(next);
      setSessionState(prev => ({ ...prev, currentStage: next }));
    } else {
      setCurrentStage('completion');
    }
  };

  const returnToDashboard = (fromCompletion = false) => {
    if (fromCompletion) {
      const now = new Date();
      setStats(prev => ({
        ...prev,
        totalSessions: prev.totalSessions + 1,
        consecutiveDays: prev.consecutiveDays + 1,
        lastSession: now.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        // Physical stays good
        sleepHours: 7.5,
        sleepQuality: Math.floor(Math.random() * 15) + 85,
        steps: Math.floor(Math.random() * 2000) + 7000,
        protein: Math.floor(Math.random() * 30) + 140,
        hydration: (Math.random() * 0.5 + 1.8).toFixed(1),
        calories: Math.floor(Math.random() * 200) + 1800,
        // Mental gets worse
        motivation: Math.max(prev.motivation - 1, 0),
        cryingEpisodes: prev.cryingEpisodes + Math.floor(Math.random() * 3)
      }));
      setSessionState({
        inProgress: false,
        currentStage: 'denial',
        sessionStart: null
      });
      setCompletedStages([]);
    }
    setCurrentStage('dashboard');
  };

  const updateMetric = (metric, value) => {
    setStats(prev => ({ ...prev, [metric]: value }));
  };

  const renderScreen = () => {
    const isInFlow = stages.includes(currentStage);
    return (
      <>
        {isInFlow && <ProgressBar currentStage={currentStage} completedStages={completedStages} onReturn={() => returnToDashboard(false)} />}
        {currentStage === 'dashboard' && <Dashboard onStart={startRoutine} stats={stats} sessionState={sessionState} />}
        {currentStage === 'denial' && <DenialScreen onComplete={nextStage} onUpdateSleep={(hours) => updateMetric('sleepHours', hours)} />}
        {currentStage === 'anger' && <AngerScreen onComplete={nextStage} onUpdateHR={(rate) => updateMetric('heartRate', rate)} />}
        {currentStage === 'bargaining' && <BargainingScreen onComplete={nextStage} onUpdateCalories={(cal) => updateMetric('calories', cal)} />}
        {currentStage === 'depression' && <DepressionScreen onComplete={nextStage} onUpdateTears={(count) => updateMetric('cryingEpisodes', count)} onUpdateHydration={(ml) => updateMetric('hydration', ml)} />}
        {currentStage === 'acceptance' && <AcceptanceScreen onComplete={nextStage} onUpdateSteps={(steps) => updateMetric('steps', steps)} />}
        {currentStage === 'completion' && <CompletionScreen onReturn={() => returnToDashboard(true)} stats={stats} />}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      
      {renderScreen()}
      {showPermission && <PermissionModal onClose={() => setShowPermission(false)} />}
    </div>
  );
}

// Realistic alarm sound generator
const useAlarmSound = () => {
  const audioContextRef = useRef(null);

  const playAlarmBeep = (intensity = 1) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      const now = ctx.currentTime;

      // Create the classic "beep beep beep BEEP BEEP BEEP" pattern
      const beeps = intensity < 3 ? [0, 0.15, 0.3] : [0, 0.1, 0.2, 0.35, 0.45, 0.55];
      const baseFreq = 800;

      beeps.forEach((time, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Ascending frequency for each beep
        osc.frequency.value = baseFreq + (i * 100) + (intensity * 50);
        osc.type = 'sine';
        
        const startTime = now + time;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.08);
        
        osc.start(startTime);
        osc.stop(startTime + 0.08);
      });
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  return { playAlarmBeep };
};

// Permission Modal
function PermissionModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black max-w-md w-full p-0 relative">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
        
        <div className="p-8">
          <div className="w-16 h-16 border-4 border-black mb-6 flex items-center justify-center">
            <Camera className="w-8 h-8" />
          </div>
          
          <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight">
            Biometric Tracking Required
          </h3>
          
          <p className="text-sm leading-relaxed mb-6 font-light">
            Good Mourning tracks physical and mental health metrics simultaneously to identify discrepancies between bodily wellness and psychological state.
          </p>
          
          <div className="bg-zinc-100 border-2 border-black p-4 mb-6">
            <p className="text-xs leading-relaxed">
              Monitored: Heart rate variability, micro-expressions, typing cadence, scroll patterns, tear production, sleep quality.
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full bg-black text-white py-4 border-4 border-black hover:bg-white hover:text-black transition-colors font-bold uppercase tracking-wide mb-2"
          >
            Enable Full Tracking
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-xs uppercase tracking-wide hover:underline"
          >
            Decline (Limited Metrics)
          </button>
        </div>
      </div>
    </div>
  );
}

// Progress Bar
function ProgressBar({ currentStage, completedStages, onReturn }) {
  const stages = ['denial', 'anger', 'bargaining', 'depression', 'acceptance'];
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b-4 border-black z-40 p-4">
      <div className="max-w-6xl mx-auto">
        <button onClick={onReturn} className="flex items-center gap-2 text-xs uppercase tracking-wider mb-4 hover:underline">
          <ChevronLeft className="w-4 h-4" />
          Return
        </button>
        <div className="flex gap-2">
          {stages.map((stage) => (
            <div
              key={stage}
              className={`flex-1 h-2 border-2 border-black transition-all ${
                completedStages.includes(stage) ? 'bg-black' : currentStage === stage ? 'bg-zinc-300' : 'bg-white'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Dashboard - Physical vs Mental split
function Dashboard({ onStart, stats, sessionState }) {
  const physicalHealth = Math.round((
    (stats.sleepQuality / 100) * 25 +
    (stats.steps / 10000) * 25 +
    (Math.min(stats.protein / 150, 1)) * 25 +
    (Math.min(stats.hydration / 2, 1)) * 25
  ));

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-12">
          <h1 className="text-[clamp(3rem,12vw,9rem)] font-bold leading-[0.9] tracking-tighter mb-4 uppercase">
            MOURNING<br/>ROUTINE
          </h1>
          <p className="text-sm uppercase tracking-widest text-zinc-500">
            Biometric Wellness Tracker
          </p>
        </div>

        {/* Health Split */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          {/* Physical Health - All Green */}
          <div className="border-4 border-black p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold uppercase tracking-tight">Physical Health</h2>
              <div className="text-4xl font-bold">{physicalHealth}/100</div>
            </div>
            <div className="w-full h-4 border-2 border-black mb-8">
              <div className="h-full bg-black transition-all" style={{ width: `${physicalHealth}%` }} />
            </div>
            <div className="space-y-4">
              <MetricRow icon={Moon} label="Sleep Quality" value={`${stats.sleepQuality}%`} status="optimal" />
              <MetricRow icon={Activity} label="Steps Today" value={stats.steps.toLocaleString()} status="optimal" />
              <MetricRow icon={Zap} label="Protein Intake" value={`${stats.protein}g`} status="optimal" />
              <MetricRow icon={Droplets} label="Hydration" value={`${stats.hydration}L`} status="optimal" />
            </div>
          </div>

          {/* Mental Health - All Red */}
          <div className="border-4 border-black p-8 bg-zinc-50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold uppercase tracking-tight">Mental Health</h2>
              <div className="text-4xl font-bold">[ERROR]</div>
            </div>
            <div className="w-full h-4 border-2 border-black mb-8">
              <div className="h-full bg-zinc-300 transition-all" style={{ width: '0%' }} />
            </div>
            <div className="space-y-4">
              <MetricRow icon={AlertCircle} label="Existential Dread" value={stats.existentialDread} status="critical" />
              <MetricRow icon={TrendingUp} label="Motivation" value={`${stats.motivation}%`} status="critical" />
              <MetricRow icon={Droplets} label="Crying Episodes" value={stats.cryingEpisodes} status="critical" />
              <MetricRow icon={Activity} label="Life Purpose" value={stats.purpose} status="critical" />
            </div>
          </div>
        </div>

        {/* Main CTA */}
        <div className="border-4 border-black p-12 mb-8 text-center">
          <p className="text-sm mb-8 font-light leading-relaxed">
            {stats.totalSessions === 0 
              ? 'Begin your first session to establish baseline wellness metrics.'
              : 'Continue monitoring the gap between physical optimization and mental deterioration.'
            }
          </p>
          <button
            onClick={onStart}
            className="bg-black text-white px-16 py-6 border-4 border-black hover:bg-white hover:text-black transition-colors font-bold uppercase tracking-wider text-xl"
          >
            {sessionState.inProgress ? 'Resume Session' : 'Start Routine'}
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-zinc-400">
            Session {stats.totalSessions + 1} · Consecutive Days: {stats.consecutiveDays}
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ icon: Icon, label, value, status }) {
  return (
    <div className="flex items-center justify-between text-sm border-b-2 border-black pb-3">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4" />
        <span className="uppercase tracking-wide">{label}</span>
      </div>
      <span className={`font-bold ${status === 'optimal' ? '' : 'text-zinc-400'}`}>{value}</span>
    </div>
  );
}

// DENIAL - Real alarm with sleep tracking
function DenialScreen({ onComplete, onUpdateSleep }) {
  const [snoozeCount, setSnoozeCount] = useState(0);
  const [facts, setFacts] = useState([]);
  const [holdTime, setHoldTime] = useState(1);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const { playAlarmBeep } = useAlarmSound();
  const factIdRef = useRef(0);
  const progressIntervalRef = useRef(null);

  const realityFacts = [
    "It's 7:00 AM",
    "3 meetings today", 
    "47 unread emails",
    "Rent due Friday",
    "Gym membership unused",
    "Mom's birthday next week",
    "Laundry piling up",
    "Project deadline today",
    "Coffee machine broken",
    "Phone battery 12%"
  ];

  // Alarm beeps continuously
  useEffect(() => {
    const intensity = Math.min(Math.floor(snoozeCount / 2) + 1, 5);
    const interval = setInterval(() => {
      playAlarmBeep(intensity);
    }, intensity < 3 ? 2000 : 1000);
    return () => clearInterval(interval);
  }, [snoozeCount, playAlarmBeep]);

  // Facts pop up while alarm rings
  useEffect(() => {
    const factInterval = setInterval(() => {
      if (facts.length < 20) {
        const randomFact = realityFacts[Math.floor(Math.random() * realityFacts.length)];
        const newFact = {
          id: factIdRef.current++,
          text: randomFact,
          x: Math.random() * 80 + 10,
          y: Math.random() * 70 + 15,
        };
        setFacts(prev => [...prev, newFact]);
        
        // Trigger screen shake
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 200);
      }
    }, 2000 - (snoozeCount * 200));
    return () => clearInterval(factInterval);
  }, [snoozeCount, facts.length]);

  const handleMouseDown = () => {
    setIsHolding(true);
    setHoldProgress(0);
    
    progressIntervalRef.current = setInterval(() => {
      setHoldProgress(prev => {
        const newProgress = prev + (100 / (holdTime * 10));
        if (newProgress >= 100) {
          handleSnoozeComplete();
          return 100;
        }
        return newProgress;
      });
    }, 100);
  };

  const handleMouseUp = () => {
    setIsHolding(false);
    setHoldProgress(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const handleSnoozeComplete = () => {
    setIsHolding(false);
    setHoldProgress(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    setSnoozeCount(prev => prev + 1);
    setHoldTime(prev => Math.min(prev + 0.5, 3));
    onUpdateSleep(7.5 - (snoozeCount * 0.1));

    if (snoozeCount >= 5) {
      setTimeout(onComplete, 1500);
    }
  };

  return (
    <div className={`h-screen flex items-center justify-center p-8 pt-24 relative overflow-hidden ${isShaking ? 'animate-shake' : ''}`}>
      {/* Biometric overlay */}
      <div className="absolute top-24 right-8 border-2 border-black bg-white p-4 z-20">
        <div className="text-xs uppercase tracking-widest mb-2">Sleep Tracking</div>
        <div className="text-2xl font-bold">{(7.5 - snoozeCount * 0.1).toFixed(1)}h</div>
        <div className="text-xs text-zinc-500 mt-1">Quality: {Math.max(87 - snoozeCount * 3, 50)}%</div>
      </div>

      {/* Facts floating */}
      <div className="absolute inset-0 pointer-events-none">
        {facts.map((fact) => (
          <div
            key={fact.id}
            className="absolute border-2 border-black bg-white px-4 py-2 text-sm uppercase tracking-wide animate-[fadeIn_0.3s_ease-out]"
            style={{
              left: `${fact.x}%`,
              top: `${fact.y}%`,
            }}
          >
            {fact.text}
          </div>
        ))}
      </div>

      {/* Center content */}
      <div className="text-center z-10">
        <h2 className="text-8xl font-bold uppercase tracking-tighter mb-8">
          7:00
        </h2>
        <p className="text-sm uppercase tracking-widest mb-12 text-zinc-500">
          Alarm Active · Snooze Count: {snoozeCount}
        </p>

        {snoozeCount < 6 ? (
          <button
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            className="relative border-4 border-black bg-white px-20 py-8 hover:bg-zinc-50 transition-all font-bold uppercase tracking-wider text-2xl"
            style={{ transform: isHolding ? 'scale(0.95)' : 'scale(1)' }}
          >
            {isHolding ? 'HOLDING...' : 'SNOOZE'}
            {isHolding && (
              <div 
                className="absolute bottom-0 left-0 h-2 bg-black transition-all"
                style={{ width: `${holdProgress}%` }}
              />
            )}
          </button>
        ) : (
          <button
            onClick={onComplete}
            className="border-4 border-black bg-black text-white px-20 py-8 hover:bg-white hover:text-black transition-colors font-bold uppercase tracking-wider text-2xl"
          >
            ACKNOWLEDGE
          </button>
        )}

        <div className="text-xs uppercase tracking-widest mt-6 text-zinc-500">
          {snoozeCount < 6 ? `Hold for ${holdTime.toFixed(1)}s` : 'Reality unavoidable'}
        </div>
      </div>
    </div>
  );
}

// ANGER - Type once, then explode
function AngerScreen({ onComplete, onUpdateHR }) {
  const [text, setText] = useState('');
  const [exploded, setExploded] = useState(false);
  const [fragments, setFragments] = useState([]);
  const [showFlash, setShowFlash] = useState(false);

  const handleSubmit = () => {
    // Flash effect
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 100);
    
    // Create fragments from each word
    const words = text.split(' ').filter(w => w.length > 0);
    const newFragments = words.map((word, i) => ({
      id: i,
      text: word,
      x: 50 + (Math.random() - 0.5) * 80,
      y: 50 + (Math.random() - 0.5) * 80,
      rotation: (Math.random() - 0.5) * 720,
      scale: 1 + Math.random() * 2
    }));
    
    setFragments(newFragments);
    setExploded(true);
    onUpdateHR(72 + Math.min(text.length, 50));
    
    setTimeout(onComplete, 2500);
  };

  return (
    <div className="h-screen flex items-center justify-center p-8 pt-24 relative overflow-hidden">
      {/* Flash overlay */}
      {showFlash && (
        <div className="absolute inset-0 bg-red-500 z-50 animate-[flash_0.1s_ease-out]" />
      )}
      
      {/* Biometric overlay */}
      <div className="absolute top-24 right-8 border-2 border-black bg-white p-4 z-20">
        <div className="text-xs uppercase tracking-widest mb-2">Heart Rate</div>
        <div className="text-2xl font-bold">{72 + Math.min(text.length, 50)} BPM</div>
        <div className="text-xs text-zinc-500 mt-1">Elevated</div>
      </div>

      {/* Exploded fragments */}
      {exploded && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {fragments.map((frag) => (
            <div
              key={frag.id}
              className="absolute text-6xl font-bold uppercase text-red-600"
              style={{
                left: `${frag.x}%`,
                top: `${frag.y}%`,
                animation: 'explodeDramatic 1s ease-out forwards',
                '--rotate': `${frag.rotation}deg`,
                '--scale': frag.scale
              }}
            >
              {frag.text}
            </div>
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="max-w-2xl w-full z-10">
        {!exploded ? (
          <>
            <h2 className="text-6xl font-bold uppercase tracking-tighter mb-12 text-center">
              ANGER
            </h2>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="TYPE YOUR RAGE..."
              className="w-full h-48 border-4 border-black px-6 py-6 text-2xl focus:outline-none uppercase tracking-wider resize-none mb-8 font-bold"
              autoFocus
            />

            <button
              onClick={handleSubmit}
              disabled={text.length < 3}
              className="w-full bg-black text-white py-6 border-4 border-black hover:bg-white hover:text-black disabled:bg-zinc-300 disabled:border-zinc-300 transition-colors font-bold uppercase tracking-wider text-xl"
            >
              Submit
            </button>

            <div className="text-center text-xs uppercase tracking-widest mt-4 text-zinc-500">
              Characters: {text.length}
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-xl uppercase tracking-widest">Rage processed.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// BARGAINING - Negotiate with yourself
function BargainingScreen({ onComplete, onUpdateCalories }) {
  const [deals, setDeals] = useState([
    { id: 1, text: "Skip breakfast for 10 more minutes", timeSaved: 10, checked: false },
    { id: 2, text: "Shower later to check phone now", timeSaved: 15, checked: false },
    { id: 3, text: "Work through lunch to leave early", timeSaved: 30, checked: false },
    { id: 4, text: "Skip gym to catch up on emails", timeSaved: 60, checked: false },
    { id: 5, text: "Coffee instead of proper meal", timeSaved: 20, checked: false },
  ]);

  const toggleDeal = (id) => {
    setDeals(deals.map(d => 
      d.id === id ? { ...d, checked: !d.checked } : d
    ));
  };

  const totalTime = deals.filter(d => d.checked).reduce((sum, d) => sum + d.timeSaved, 0);
  const calorieDeficit = deals.filter(d => d.checked).length * 200;

  const handleComplete = () => {
    onUpdateCalories(1847 - calorieDeficit);
    setTimeout(onComplete, 1500);
  };

  return (
    <div className="h-screen flex items-center justify-center p-4 pt-20">
      <div className="max-w-2xl w-full">
        {/* Biometric overlay */}
        <div className="absolute top-20 right-4 border-2 border-black bg-white p-3">
          <div className="text-xs uppercase tracking-widest mb-1">Calories</div>
          <div className="text-xl font-bold">{1847 - calorieDeficit}</div>
          <div className="text-xs text-zinc-500">-{calorieDeficit} cal</div>
        </div>

        <h2 className="text-5xl font-bold uppercase tracking-tighter mb-6">
          BARGAINING
        </h2>

        <div className="border-4 border-black p-4 mb-4">
          <p className="text-xs uppercase tracking-widest mb-4 text-zinc-500">
            Make trade-offs to optimize your morning
          </p>
          
          <div className="space-y-2 mb-4">
            {deals.map(deal => (
              <label 
                key={deal.id}
                className="flex items-start gap-3 p-3 border-2 border-black cursor-pointer hover:bg-zinc-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={deal.checked}
                  onChange={() => toggleDeal(deal.id)}
                  className="w-5 h-5 mt-0.5 border-2 border-black flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs uppercase tracking-wide">{deal.text}</div>
                  <div className="text-xs text-zinc-500">+{deal.timeSaved} min</div>
                </div>
              </label>
            ))}
          </div>

          <div className="border-t-2 border-black pt-3 flex justify-between items-center">
            <div className="text-xs uppercase tracking-wide">Total Saved:</div>
            <div className="text-2xl font-bold">{totalTime} min</div>
          </div>
        </div>

        <button
          onClick={handleComplete}
          disabled={deals.filter(d => d.checked).length === 0}
          className="w-full bg-black text-white py-4 border-4 border-black hover:bg-white hover:text-black disabled:bg-zinc-300 disabled:border-zinc-300 transition-colors font-bold uppercase tracking-wider"
        >
          Accept Terms
        </button>
      </div>
    </div>
  );
}

// DEPRESSION - Cry to fill hydration meter
function DepressionScreen({ onComplete, onUpdateTears, onUpdateHydration }) {
  const [tearsMl, setTearsMl] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);

  const handleCry = () => {
    const newMl = tearsMl + Math.floor(Math.random() * 15) + 5;
    setTearsMl(newMl);
    onUpdateTears(Math.floor(newMl / 20));
    onUpdateHydration((2.1 + newMl / 1000).toFixed(1));
  };

  const handleBreath = () => {
    setIsBreathing(true);
    setTimeout(() => {
      setIsBreathing(false);
      setBreathCount(prev => prev + 1);
      
      if (breathCount >= 4 && tearsMl >= 50) {
        setTimeout(onComplete, 1500);
      }
    }, 3000);
  };

  const isComplete = breathCount >= 5 && tearsMl >= 50;

  return (
    <div className="h-screen flex items-center justify-center p-8 pt-24">
      <div className="max-w-2xl w-full">
        {/* Biometric overlay */}
        <div className="absolute top-24 right-8 border-2 border-black bg-white p-4">
          <div className="text-xs uppercase tracking-widest mb-2">Hydration</div>
          <div className="text-2xl font-bold">{(2.1 + tearsMl / 1000).toFixed(2)}L</div>
          <div className="text-xs text-zinc-500 mt-1">Via tears: {tearsMl}ml</div>
        </div>

        <h2 className="text-6xl font-bold uppercase tracking-tighter mb-6 text-center">
          DEPRESSION
        </h2>

        <p className="text-sm uppercase tracking-widest mb-8 text-center text-zinc-500">
          Required: 50ml tears + 5 breaths
        </p>

        {/* Tear collection glass */}
        <div className="border-4 border-black h-48 mb-6 relative overflow-hidden bg-white">
          <div 
            className="absolute bottom-0 left-0 right-0 bg-blue-100 border-t-2 border-black transition-all duration-500"
            style={{ height: `${Math.min((tearsMl / 100) * 100, 100)}%` }}
          >
            <div className="absolute top-2 left-0 right-0 text-center">
              <Droplets className="w-8 h-8 mx-auto text-blue-400" />
            </div>
          </div>
          <div className="absolute top-4 right-4 text-sm font-bold">{tearsMl} ml</div>
        </div>

        {/* Breathing visualization */}
        <div className="border-4 border-black h-32 mb-6 relative overflow-hidden bg-white flex items-center justify-center">
          <div 
            className={`w-24 h-24 rounded-full border-4 border-black transition-all ${isBreathing ? 'duration-[3000ms]' : 'duration-500'}`}
            style={{
              transform: isBreathing ? 'scale(1.5)' : 'scale(1)',
              backgroundColor: isBreathing ? '#dbeafe' : '#ffffff'
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs uppercase tracking-widest">
                {isBreathing ? 'Breathe' : 'Hold'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={handleCry}
            className="border-4 border-black bg-white px-8 py-6 hover:bg-zinc-50 transition-colors font-bold uppercase tracking-wider"
          >
            Cry
          </button>
          <button
            onClick={handleBreath}
            disabled={isBreathing}
            className="border-4 border-black bg-white px-8 py-6 hover:bg-zinc-50 disabled:bg-zinc-200 transition-colors font-bold uppercase tracking-wider"
          >
            {isBreathing ? 'Breathing...' : 'Breathe'}
          </button>
        </div>

        <div className="text-center text-xs uppercase tracking-widest text-zinc-500 mb-6">
          Breaths: {breathCount}/5 · Tears: {tearsMl}/50ml
        </div>

        {isComplete && (
          <button
            onClick={onComplete}
            className="w-full bg-black text-white py-6 border-4 border-black hover:bg-white hover:text-black transition-colors font-bold uppercase tracking-wider text-xl"
          >
            Complete
          </button>
        )}
      </div>
    </div>
  );
}

// ACCEPTANCE - Real social media feed
function AcceptanceScreen({ onComplete, onUpdateSteps }) {
  const [scrolled, setScrolled] = useState(0);

  const posts = [
    { user: "sarah_wellness", text: "Grateful for my morning coffee ☕️", likes: "2.4K" },
    { user: "mindful_mike", text: "Another beautiful sunrise 🌅", likes: "892" },
    { user: "jess_fitness", text: "Thankful for this healthy body 💪", likes: "1.1K" },
    { user: "daily_gratitude", text: "Grateful my package arrived on time", likes: "445" },
    { user: "positivity_prime", text: "Thankful for a new day!", likes: "3.2K" },
    { user: "blessed_brian", text: "Grateful for my morning routine", likes: "678" },
    { user: "thankful_tina", text: "Appreciating the little things today", likes: "234" },
    { user: "grace_notes", text: "Grateful for my wifi connection", likes: "156" },
    { user: "zen_zara", text: "Thankful for clean water 💧", likes: "543" },
    { user: "optimist_oli", text: "Grateful I woke up today", likes: "1.8K" },
    { user: "happy_hannah", text: "Appreciating my cozy bed", likes: "721" },
    { user: "joy_journal", text: "Thankful for electricity", likes: "298" },
    { user: "grateful_gina", text: "Blessed by this oxygen", likes: "912" },
    { user: "positive_pete", text: "Grateful for my phone charger", likes: "445" },
    { user: "thankful_theo", text: "Appreciating functional legs", likes: "1.2K" },
    { user: "mindful_maya", text: "Grateful for the weekend (in 4 days)", likes: "2.1K" },
    { user: "blessed_ben", text: "Thankful my alarm went off", likes: "567" },
    { user: "grace_gray", text: "Grateful for indoor plumbing", likes: "891" },
    { user: "zen_zoe", text: "Thankful for opposable thumbs", likes: "1.5K" },
    { user: "grateful_greg", text: "Appreciating my working eyes", likes: "723" },
    { user: "positive_pam", text: "Grateful for grocery stores", likes: "456" },
    { user: "blessed_beth", text: "Thankful I have a job", likes: "2.8K" },
    { user: "mindful_mark", text: "Grateful for functional ears", likes: "892" },
    { user: "joy_jules", text: "Appreciating the concept of weekends", likes: "3.1K" },
    { user: "thankful_tom", text: "Grateful for the invention of coffee", likes: "4.2K" },
    { user: "zen_zack", text: "Thankful for my immune system", likes: "678" },
    { user: "grateful_gail", text: "Appreciating modern medicine", likes: "1.9K" },
    { user: "positive_paul", text: "Grateful for roads and infrastructure", likes: "445" },
    { user: "blessed_bill", text: "Thankful for the internet", likes: "5.3K" },
    { user: "mindful_mel", text: "Grateful my phone is charged", likes: "892" },
  ];

  const handleScroll = (e) => {
    const element = e.target;
    const scrolledPx = element.scrollTop;
    const total = element.scrollHeight - element.clientHeight;
    const progress = (scrolledPx / total) * 100;
    
    setScrolled(Math.round(progress));
    onUpdateSteps(8247 + Math.floor(scrolledPx / 10));
    
    if (progress > 85) {
      setTimeout(onComplete, 1500);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center p-8 pt-24">
      <div className="max-w-2xl w-full">
        {/* Biometric overlay */}
        <div className="absolute top-24 right-8 border-2 border-black bg-white p-4">
          <div className="text-xs uppercase tracking-widest mb-2">Activity</div>
          <div className="text-2xl font-bold">{8247 + Math.floor(scrolled * 10)}</div>
          <div className="text-xs text-zinc-500 mt-1">Thumb movement</div>
        </div>

        <h2 className="text-6xl font-bold uppercase tracking-tighter mb-8">
          ACCEPTANCE
        </h2>

        <p className="text-sm uppercase tracking-widest mb-6 text-zinc-500">
          Absorb collective gratitude
        </p>

        <div
          onScroll={handleScroll}
          className="border-4 border-black h-[500px] overflow-y-auto bg-white"
        >
          <div className="p-6 space-y-4">
            {posts.map((post, i) => (
              <div key={i} className="border-2 border-black p-6 bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 border-2 border-black bg-zinc-100"></div>
                  <div className="text-sm font-bold">{post.user}</div>
                </div>
                <p className="text-base mb-3">{post.text}</p>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span>❤️ {post.likes}</span>
                  <span>💬 {Math.floor(Math.random() * 100)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-xs uppercase tracking-widest mt-4 text-zinc-500">
          Progress: {scrolled}% · Required: 85%
        </div>
      </div>
    </div>
  );
}

// Completion Screen
function CompletionScreen({ onReturn, stats }) {
  return (
    <div className="h-screen flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <h2 className="text-[clamp(3rem,10vw,8rem)] font-bold uppercase tracking-tighter mb-12 leading-[0.9]">
          ROUTINE<br/>COMPLETE
        </h2>
        
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div className="border-4 border-black p-8">
            <div className="text-sm uppercase tracking-widest mb-4 text-zinc-500">Physical Health</div>
            <div className="text-6xl font-bold mb-2">94/100</div>
            <div className="text-xs">All metrics optimal</div>
          </div>
          <div className="border-4 border-black p-8 bg-zinc-50">
            <div className="text-sm uppercase tracking-widest mb-4 text-zinc-500">Mental Health</div>
            <div className="text-6xl font-bold mb-2">[ERROR]</div>
            <div className="text-xs">Status unavailable</div>
          </div>
        </div>

        <button
          onClick={onReturn}
          className="w-full bg-black text-white py-6 border-4 border-black hover:bg-white hover:text-black transition-colors font-bold uppercase tracking-wider text-xl mb-8"
        >
          Return to Dashboard
        </button>

        <p className="text-xs uppercase tracking-widest text-center text-zinc-400">
          Session logged. Discrepancy noted.
        </p>
      </div>
    </div>
  );
}

// Add CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes explodeDramatic {
      0% { 
        opacity: 1; 
        transform: translate(-50%, -50%) rotate(0deg) scale(1); 
      }
      50% {
        opacity: 1;
        transform: translate(-50%, -50%) rotate(calc(var(--rotate) * 0.5)) scale(calc(var(--scale) * 1.5));
      }
      100% { 
        opacity: 0; 
        transform: translate(-50%, -50%) rotate(var(--rotate)) scale(calc(var(--scale) * 3)); 
      }
    }
    @keyframes screenShake {
      0%, 100% { transform: translate(0, 0); }
      25% { transform: translate(-8px, 8px); }
      50% { transform: translate(8px, -8px); }
      75% { transform: translate(-8px, -8px); }
    }
    @keyframes flash {
      0% { opacity: 0.8; }
      100% { opacity: 0; }
    }
    .animate-shake {
      animation: screenShake 0.2s ease-in-out;
    }
  `;
  if (!document.getElementById('mourning-animations')) {
    style.id = 'mourning-animations';
    document.head.appendChild(style);
  }
}

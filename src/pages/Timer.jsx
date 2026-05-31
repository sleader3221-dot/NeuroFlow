import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, RotateCcw, Settings, Coffee, Zap, CheckCircle, Music } from 'lucide-react';

const MODES = {
  work: { label: 'Focus', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
  shortBreak: { label: 'Short Break', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  longBreak: { label: 'Long Break', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
};

export default function Timer() {
  const { state, actions } = useApp();
  const { pomodoroSettings, profile, subjects } = state;

  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.work * 60);
  const [running, setRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalToday, setTotalToday] = useState(0); // minutes today
  const [editSettings, setEditSettings] = useState(false);
  const [localSettings, setLocalSettings] = useState({ ...pomodoroSettings });
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || 'General');
  const [completedSessions, setCompletedSessions] = useState([]);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const totalTime = pomodoroSettings[mode === 'work' ? 'work' : mode === 'shortBreak' ? 'shortBreak' : 'longBreak'] * 60;
  const progress = 1 - timeLeft / totalTime;
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  useEffect(() => {
    const mins = mode === 'work' ? pomodoroSettings.work : mode === 'shortBreak' ? pomodoroSettings.shortBreak : pomodoroSettings.longBreak;
    setTimeLeft(mins * 60);
    setRunning(false);
  }, [mode, pomodoroSettings]);

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            handleComplete();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function handleComplete() {
    if (mode === 'work') {
      const elapsed = Math.round((Date.now() - (startTimeRef.current || Date.now())) / 60000) || pomodoroSettings.work;
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      setTotalToday(t => t + pomodoroSettings.work);
      setCompletedSessions(prev => [...prev, { subject: selectedSubject, duration: pomodoroSettings.work, time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) }]);
      actions.addSession({ subject: selectedSubject, duration: pomodoroSettings.work, type: 'pomodoro', cardsReviewed: 0 });
      actions.addXP(25, 'Pomodoro completed');
      actions.toast(`🍅 Pomodoro #${newCount} complete! Take a break.`, 'success');
      if (newCount % pomodoroSettings.sessions === 0) setMode('longBreak');
      else setMode('shortBreak');
    } else {
      actions.toast('⚡ Break over — back to focus!', 'info');
      setMode('work');
    }
  }

  function reset() {
    setRunning(false);
    clearInterval(intervalRef.current);
    const mins = pomodoroSettings[mode === 'work' ? 'work' : mode === 'shortBreak' ? 'shortBreak' : 'longBreak'];
    setTimeLeft(mins * 60);
  }

  function saveSettings() {
    actions.updatePomodoro(localSettings);
    setEditSettings(false);
    actions.toast('Timer settings saved!', 'success');
  }

  function formatTime(s) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  const modeInfo = MODES[mode];

  return (
    <div className="page-enter">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Focus Timer ⏱️</h1>
            <p className="page-subtitle">Pomodoro technique for deep focus and productivity</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setEditSettings(true)}>
            <Settings size={15} /> Settings
          </button>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: 'var(--space-6)' }}>
        {/* Timer */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--space-8)' }}>
          {/* Mode selector */}
          <div className="tabs" style={{ marginBottom: 'var(--space-8)' }}>
            {Object.entries(MODES).map(([key, { label }]) => (
              <button key={key} className={`tab ${mode === key ? 'active' : ''}`} onClick={() => { setMode(key); setRunning(false); }}>
                {label}
              </button>
            ))}
          </div>

          {/* SVG Ring Timer */}
          <div className="timer-ring" style={{ marginBottom: 'var(--space-6)' }}>
            <svg width="300" height="300" viewBox="0 0 300 300">
              <defs>
                <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={modeInfo.color} />
                  <stop offset="100%" stopColor={mode === 'work' ? '#06b6d4' : mode === 'shortBreak' ? '#06b6d4' : '#7c3aed'} />
                </linearGradient>
              </defs>
              {/* Background glow */}
              <circle cx="150" cy="150" r={radius + 15} fill={modeInfo.bg} />
              {/* Track */}
              <circle className="timer-circle-bg" cx="150" cy="150" r={radius} strokeWidth={10} />
              {/* Progress */}
              <circle
                cx="150" cy="150" r={radius}
                fill="none"
                stroke={`url(#timer-gradient)`}
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 150 150)"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
              {/* Center display */}
              <text x="150" y="135" textAnchor="middle" fill="var(--text-primary)" fontSize="52" fontWeight="700" fontFamily="Space Grotesk">
                {formatTime(timeLeft)}
              </text>
              <text x="150" y="165" textAnchor="middle" fill="var(--text-secondary)" fontSize="14" fontFamily="Inter">
                {modeInfo.label}
              </text>
              <text x="150" y="185" textAnchor="middle" fill={modeInfo.color} fontSize="12" fontFamily="Inter" fontWeight="600">
                {selectedSubject}
              </text>
            </svg>
          </div>

          {/* Subject selector */}
          <select className="input select" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
            style={{ marginBottom: 'var(--space-4)', maxWidth: 260, textAlign: 'center' }}>
            {subjects.map(s => <option key={s.id} value={s.name}>{s.icon} {s.name}</option>)}
          </select>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <button onClick={reset} className="btn btn-secondary btn-icon" style={{ width: 48, height: 48, borderRadius: '50%' }}>
              <RotateCcw size={18} />
            </button>
            <button onClick={() => setRunning(r => !r)} style={{
              width: 72, height: 72, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: `linear-gradient(135deg, ${modeInfo.color}, ${modeInfo.color}cc)`,
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 30px ${modeInfo.color}55`, transition: 'all 0.2s',
              animation: running ? 'glow 2s ease-in-out infinite' : 'none',
            }}>
              {running ? <Pause size={30} /> : <Play size={30} style={{ marginLeft: 3 }} />}
            </button>
            <div style={{ width: 48, height: 48 }} />
          </div>

          {/* Session dots */}
          <div style={{ display: 'flex', gap: 8, marginTop: 'var(--space-6)' }}>
            {Array.from({ length: pomodoroSettings.sessions }).map((_, i) => (
              <div key={i} style={{
                width: 12, height: 12, borderRadius: '50%',
                background: i < sessionCount % pomodoroSettings.sessions ? modeInfo.color : 'var(--bg-glass)',
                border: `1px solid ${modeInfo.color}44`,
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 8 }}>
            {sessionCount} sessions completed today
          </p>
        </div>

        {/* Stats + History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Today's stats */}
          <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
            {[
              { label: 'Sessions Today', value: sessionCount, icon: Zap, color: '#7c3aed' },
              { label: 'Focus Minutes', value: totalToday, icon: CheckCircle, color: '#10b981' },
              { label: 'Total Sessions', value: state.studySessions.filter(s => s.type === 'pomodoro').length, icon: Coffee, color: '#f59e0b' },
              { label: 'All-Time Hours', value: Math.round(profile.totalStudyTime / 60), icon: Music, color: '#06b6d4' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <s.icon size={18} color={s.color} />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{s.label}</span>
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Session History */}
          <div className="glass-card" style={{ flex: 1 }}>
            <h3 style={{ marginBottom: 'var(--space-5)', fontSize: 'var(--text-lg)' }}>Today's Sessions</h3>
            {completedSessions.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🍅</div>
                <p style={{ fontSize: 'var(--text-sm)' }}>Start your first Pomodoro!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {completedSessions.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: 'var(--space-3)',
                    background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)',
                    animation: 'slideInLeft 300ms ease-out'
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--primary-light)', fontSize: 'var(--text-sm)' }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{s.subject}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{s.duration} min • {s.time}</div>
                    </div>
                    <CheckCircle size={16} color="var(--accent)" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--primary-light)', marginBottom: 6 }}>💡 Tip</p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              The Pomodoro Technique boosts productivity by working in focused bursts. After {pomodoroSettings.sessions} sessions, you earn a long break!
            </p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {editSettings && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditSettings(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>⚙️ Timer Settings</h3>
              <button onClick={() => setEditSettings(false)} className="btn btn-ghost btn-icon"><Settings size={16} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { key: 'work', label: 'Focus Duration (minutes)' },
                { key: 'shortBreak', label: 'Short Break (minutes)' },
                { key: 'longBreak', label: 'Long Break (minutes)' },
                { key: 'sessions', label: 'Sessions before Long Break' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="label">{label}: {localSettings[key]}</label>
                  <input type="range" min={key === 'sessions' ? 2 : 1} max={key === 'sessions' ? 8 : 60}
                    value={localSettings[key]} onChange={e => setLocalSettings(s => ({ ...s, [key]: Number(e.target.value) }))}
                    style={{ width: '100%', accentColor: 'var(--primary)' }} />
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditSettings(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveSettings}>Save Settings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard, BookOpen, Brain, FileText, Timer, BarChart3,
  MessageSquare, Map, Network, Trophy, Settings, Zap, Flame, Star, ChevronRight
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/flashcards', label: 'Flashcards', icon: BookOpen },
  { path: '/quiz', label: 'Quiz', icon: Brain },
  { path: '/notes', label: 'Notes', icon: FileText },
  { path: '/timer', label: 'Focus Timer', icon: Timer },
];

const advancedItems = [
  { path: '/ai-tutor', label: 'AI Tutor', icon: MessageSquare, badge: 'AI' },
  { path: '/study-plan', label: 'Study Plan', icon: Map, badge: 'AI' },
  { path: '/knowledge-graph', label: 'Knowledge Graph', icon: Network },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/achievements', label: 'Achievements', icon: Trophy },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { state, actions } = useApp();
  const { profile, badges, sidebarOpen } = state;
  const location = useLocation();

  const unlockedBadges = badges.filter(b => b.unlocked).length;
  const dueCards = state.flashcards.filter(c => new Date(c.nextReview) <= new Date()).length;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={actions.toggleSidebar} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 39, display: 'none'
        }} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Zap size={20} />
          </div>
          <div>
            <div className="logo-text">NeuroFlow</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 1 }}>AI Learning Platform</div>
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={14} color="var(--warning-light)" fill="var(--warning-light)" />
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--warning-light)' }}>Level {profile.level}</span>
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{profile.xp}/{profile.xpToNext} XP</span>
          </div>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${(profile.xp / profile.xpToNext) * 100}%` }} />
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Main</div>
          </div>

          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => sidebarOpen && actions.toggleSidebar()}
            >
              <Icon className="nav-icon" />
              {label}
              {path === '/flashcards' && dueCards > 0 && (
                <span className="nav-badge">{dueCards}</span>
              )}
            </NavLink>
          ))}

          <div className="sidebar-section" style={{ marginTop: 16 }}>
            <div className="sidebar-section-title">Advanced</div>
          </div>

          {advancedItems.map(({ path, label, icon: Icon, badge }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => sidebarOpen && actions.toggleSidebar()}
            >
              <Icon className="nav-icon" />
              {label}
              {badge && (
                <span style={{
                  marginLeft: 'auto', fontSize: '0.6rem', background: 'var(--gradient-primary)',
                  color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 700
                }}>{badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Streak + User */}
        <div className="sidebar-footer">
          {/* Streak */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.15)', borderRadius: 'var(--radius-lg)', marginBottom: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={16} color="var(--warning-light)" className="streak-flame" />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--warning-light)' }}>
                {profile.streak} day streak
              </span>
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>🏅 {unlockedBadges} badges</span>
          </div>

          {/* User */}
          <NavLink to="/settings" style={{ textDecoration: 'none' }}>
            <div className="sidebar-user">
              <div className="user-avatar">{profile.name[0].toUpperCase()}</div>
              <div className="user-info">
                <div className="user-name">{profile.name}</div>
                <div className="user-level">
                  <Zap size={10} />
                  Level {profile.level} • {profile.xp} XP
                </div>
              </div>
              <ChevronRight size={14} color="var(--text-tertiary)" />
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Send, Bot, User, RotateCcw, Sparkles, BookOpen, Brain, Lightbulb } from 'lucide-react';
import { getAIResponse } from '../utils/ai';

const SUGGESTIONS = [
  'How do I solve quadratic equations?',
  'Explain Big O notation simply',
  'What is Newton\'s Second Law?',
  'Best study techniques for exams?',
  "I'm feeling unmotivated, help!",
  'Explain DNA replication',
  'How does recursion work?',
  'Tips for memorizing formulas?',
];

export default function AITutor() {
  const { state, actions } = useApp();
  const { chatHistory, profile } = state;

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const messages = chatHistory.length === 0
    ? [{ id: 'welcome', role: 'ai', content: `Hello ${profile.name}! 👋 I'm NeuroFlow AI, your personal learning companion.\n\nI can help you with:\n• 📚 Subject explanations\n• 🎯 Study strategies\n• 💡 Concept clarification\n• 🔥 Motivation & tips\n\nWhat would you like to learn today?`, timestamp: new Date().toISOString() }]
    : chatHistory;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  function sendMessage(text = input) {
    const msg = text.trim();
    if (!msg) return;
    actions.addChatMessage({ role: 'user', content: msg });
    setInput('');
    setIsTyping(true);

    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const response = getAIResponse(msg);
      actions.addChatMessage({ role: 'ai', content: response });
      setIsTyping(false);
      actions.addXP(3, 'AI tutoring session');

      // Track ai_chat badge: unlock after 5 user messages
      const userMsgCount = chatHistory.filter(m => m.role === 'user').length + 1;
      if (userMsgCount >= 5) actions.unlockBadge('ai_chat');
    }, delay);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function formatMessage(content) {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  }

  return (
    <div className="page-enter" style={{ height: 'calc(100vh - var(--header-height) - 48px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)' }}>AI Tutor <span>🤖</span></h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Powered by NeuroFlow AI • Always available</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { actions.clearChat(); actions.toast('Chat cleared', 'info'); }}>
            <RotateCcw size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Suggestions (when no history) */}
      {chatHistory.length === 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-4)', flexShrink: 0 }}>
          {SUGGESTIONS.slice(0, 4).map(s => (
            <button key={s} onClick={() => sendMessage(s)} className="btn btn-secondary btn-sm" style={{ fontSize: 'var(--text-xs)' }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Chat container */}
      <div className="chat-container" style={{ flex: 1, minHeight: 0 }}>
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.role === 'ai' ? 'ai' : 'user'}`}>
              <div className="message-avatar">
                {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="message-content"
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7 }}
              />
            </div>
          ))}

          {isTyping && (
            <div className="chat-message ai" style={{ animation: 'fadeIn 200ms ease-out' }}>
              <div className="message-avatar"><Bot size={16} /></div>
              <div className="message-content" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                <div className="typing-indicator">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="chat-input-area">
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              ref={inputRef}
              className="input"
              style={{ paddingRight: 50, resize: 'none', minHeight: 44, maxHeight: 120, lineHeight: 1.5 }}
              placeholder="Ask anything... (Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
          </div>
          <button className="btn btn-primary" onClick={() => sendMessage()} disabled={!input.trim() || isTyping}
            style={{ alignSelf: 'flex-end', minWidth: 44, height: 44 }}>
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Quick topic buttons below chat */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'var(--space-3)', flexShrink: 0 }}>
        {[
          { icon: BookOpen, label: 'Study Tips', msg: 'Give me evidence-based study strategies' },
          { icon: Brain, label: 'Concept Help', msg: 'Explain a difficult concept simply' },
          { icon: Lightbulb, label: 'Motivation', msg: "I need motivation to keep studying" },
          { icon: Sparkles, label: 'Quick Quiz', msg: 'Give me a quick practice question' },
        ].map(({ icon: Icon, label, msg }) => (
          <button key={label} onClick={() => sendMessage(msg)} className="btn btn-secondary btn-sm" style={{ fontSize: 'var(--text-xs)' }}>
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

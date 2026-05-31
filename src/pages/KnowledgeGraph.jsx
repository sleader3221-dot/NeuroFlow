import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateKnowledgeGraph } from '../utils/ai';
import { ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react';

export default function KnowledgeGraph() {
  const { state } = useApp();
  const { subjects } = state;
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const [selected, setSelected] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    const { nodes, links } = generateKnowledgeGraph(subjects.map(s => s.name));
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;

    // Initialize node positions in a radial layout
    const subjectNodes = nodes.filter(n => n.type === 'subject');
    const conceptNodes = nodes.filter(n => n.type === 'concept');

    subjectNodes.forEach((n, i) => {
      const angle = (i / subjectNodes.length) * Math.PI * 2;
      const r = Math.min(W, H) * 0.28;
      n.x = W / 2 + Math.cos(angle) * r;
      n.y = H / 2 + Math.sin(angle) * r;
      n.vx = 0; n.vy = 0;
    });

    conceptNodes.forEach((n, i) => {
      const parent = subjectNodes.find(s => s.id === n.subject);
      const angle = (i / conceptNodes.length) * Math.PI * 2 + (Math.random() * 0.5);
      const r = Math.min(W, H) * 0.45;
      n.x = parent ? parent.x + Math.cos(angle) * 90 : W / 2 + Math.cos(angle) * r;
      n.y = parent ? parent.y + Math.sin(angle) * 90 : H / 2 + Math.sin(angle) * r;
      n.vx = 0; n.vy = 0;
    });

    nodesRef.current = nodes;
    linksRef.current = links;

    const ctx = canvas.getContext('2d');

    function simulate() {
      const ns = nodesRef.current;
      const ls = linksRef.current;

      // Force simulation
      ns.forEach(a => {
        ns.forEach(b => {
          if (a === b) return;
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const repulse = -2500 / (dist * dist);
          a.vx += (dx / dist) * repulse * 0.01;
          a.vy += (dy / dist) * repulse * 0.01;
        });
        // Center gravity
        a.vx += (W / 2 - a.x) * 0.001;
        a.vy += (H / 2 - a.y) * 0.001;
      });

      ls.forEach(link => {
        const s = ns.find(n => n.id === link.source);
        const t = ns.find(n => n.id === link.target);
        if (!s || !t) return;
        const dx = t.x - s.x, dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const ideal = link.strength > 0.5 ? 120 : 180;
        const force = (dist - ideal) * 0.03 * link.strength;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        s.vx += fx; s.vy += fy;
        t.vx -= fx; t.vy -= fy;
      });

      ns.forEach(n => {
        if (n.fixed) return;
        n.vx *= 0.85; n.vy *= 0.85;
        n.x += n.vx; n.y += n.vy;
        n.x = Math.max(n.size + 5, Math.min(W - n.size - 5, n.x));
        n.y = Math.max(n.size + 5, Math.min(H - n.size - 5, n.y));
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(zoom, zoom);

      const ns = nodesRef.current;
      const ls = linksRef.current;

      // Draw links
      ls.forEach(link => {
        const s = ns.find(n => n.id === link.source);
        const t = ns.find(n => n.id === link.target);
        if (!s || !t) return;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = link.strength > 0.5
          ? 'rgba(124,58,237,0.35)'
          : 'rgba(148,163,184,0.15)';
        ctx.lineWidth = link.strength > 0.5 ? 1.5 : 0.8;
        ctx.stroke();
      });

      // Draw nodes
      ns.forEach(node => {
        const isSelected = selected?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;
        const r = node.size + (isHovered || isSelected ? 4 : 0);

        // Glow effect
        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 8, 0, Math.PI * 2);
          ctx.fillStyle = node.color + '22';
          ctx.fill();
        }

        // Shadow
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isSelected ? 20 : 8;

        // Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);

        if (node.type === 'subject') {
          const grad = ctx.createRadialGradient(node.x - r * 0.3, node.y - r * 0.3, 0, node.x, node.y, r);
          grad.addColorStop(0, node.color + 'ff');
          grad.addColorStop(1, node.color + 'aa');
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = node.color + '44';
          ctx.strokeStyle = node.color + 'aa';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = node.type === 'subject' ? '#ffffff' : '#f1f5f9';
        ctx.font = node.type === 'subject'
          ? `bold ${Math.min(13, node.size * 0.7)}px "Space Grotesk", sans-serif`
          : `${Math.min(10, node.size * 0.7)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const label = node.label.length > 12 ? node.label.slice(0, 10) + '…' : node.label;
        if (node.type === 'subject') {
          ctx.fillText(label, node.x, node.y);
        } else {
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(label, node.x, node.y + r + 12);
        }
      });

      ctx.restore();
      simulate();
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [subjects, zoom, offset, selected, hoveredNode]);

  function handleCanvasClick(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / zoom;
    const y = (e.clientY - rect.top - offset.y) / zoom;
    const hit = nodesRef.current.find(n => {
      const dx = n.x - x, dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= n.size + 5;
    });
    setSelected(hit || null);
  }

  function handleMouseMove(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / zoom;
    const y = (e.clientY - rect.top - offset.y) / zoom;
    const hit = nodesRef.current.find(n => {
      const dx = n.x - x, dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= n.size + 5;
    });
    setHoveredNode(hit || null);
    canvas.style.cursor = hit ? 'pointer' : 'default';
  }

  return (
    <div className="page-enter">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Knowledge Graph 🕸️</h1>
            <p className="page-subtitle">Visual map of your study subjects and concept connections</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setZoom(z => Math.min(2, z + 0.1))}><ZoomIn size={15} /></button>
            <button className="btn btn-secondary btn-sm" onClick={() => setZoom(z => Math.max(0.4, z - 0.1))}><ZoomOut size={15} /></button>
            <button className="btn btn-secondary btn-sm" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); setSelected(null); }}><RotateCcw size={15} /> Reset</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        {/* Graph Canvas */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{
            position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', overflow: 'hidden', height: 520
          }}>
            {/* Radial bg glow */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <canvas
              ref={canvasRef}
              width={800} height={520}
              style={{ width: '100%', height: '100%' }}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
            />
            {/* Zoom indicator */}
            <div style={{ position: 'absolute', bottom: 12, right: 12, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', background: 'var(--bg-glass)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', backdropFilter: 'blur(10px)' }}>
              {Math.round(zoom * 100)}%
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div style={{ width: 260, flexShrink: 0 }}>
          {/* Legend */}
          <div className="glass-card" style={{ marginBottom: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)' }}>Legend</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {subjects.slice(0, 6).map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{s.name}</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px solid var(--text-tertiary)', flexShrink: 0 }} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Concept</span>
              </div>
            </div>
          </div>

          {/* Selected node details */}
          {selected ? (
            <div className="glass-card" style={{ animation: 'scaleIn 250ms ease-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-4)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: selected.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{selected.label}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>{selected.type}</div>
                </div>
              </div>
              {selected.type === 'subject' && (
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Concepts connected to this subject are shown around it in the graph.
                  </p>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    Connected concepts: {nodesRef.current.filter(n => n.subject === selected.id).length}
                  </div>
                </div>
              )}
              {selected.type === 'concept' && (
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Part of: <strong>{selected.subject}</strong>
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    Cross-links show connections to other subjects and concepts.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Info size={16} color="var(--text-tertiary)" />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>How to use</span>
              </div>
              <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', paddingLeft: 16, lineHeight: 2 }}>
                <li>Click nodes to see details</li>
                <li>Large dots = subjects</li>
                <li>Small dots = concepts</li>
                <li>Lines show connections</li>
                <li>Use zoom controls to explore</li>
              </ul>
            </div>
          )}

          {/* Graph stats */}
          <div className="glass-card" style={{ marginTop: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-3)' }}>Graph Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Subjects', value: subjects.length },
                { label: 'Concepts', value: nodesRef.current.filter(n => n.type === 'concept').length || subjects.length * 5 },
                { label: 'Connections', value: linksRef.current.length || subjects.length * 6 },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

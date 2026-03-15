import { useEffect, useState } from 'react';

function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return count;
}

export default function StatCard({ icon, label, value, couleur, suffix = '', delay = 0 }) {
  const count = useCountUp(typeof value === 'number' ? value : 0);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 20,
        padding: '20px 22px',
        border: `1px solid ${hovered ? 'rgba(181,40,28,0.25)' : '#E8E1D5'}`,
        display: 'flex', flexDirection: 'column', gap: 14,
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? '0 15px 40px -15px rgba(181,40,28,0.2)' : '0 2px 8px rgba(42,22,16,0.04)',
        animation: `fadeUp 0.5s ease ${delay}s both`,
        cursor: 'default',
        fontFamily: 'Lato, sans-serif',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: couleur || 'rgba(181,40,28,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#B5281C', flexShrink: 0,
          transition: 'transform 0.3s',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
        }}>
          {icon}
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#9B8E84', background: '#F3F0EA', padding: '3px 8px', borderRadius: 6 }}>
          Ce mois
        </div>
      </div>
      <div>
        <div style={{ fontSize: 34, fontWeight: 900, color: '#2A1610', letterSpacing: '-1px', lineHeight: 1 }}>
          {typeof value === 'number' ? count.toLocaleString() : value}{suffix}
        </div>
        <div style={{ fontSize: 13, color: '#9B8E84', fontWeight: 700, marginTop: 5 }}>{label}</div>
      </div>
    </div>
  );
}
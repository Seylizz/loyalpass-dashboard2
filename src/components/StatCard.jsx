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
        background: 'white',
        borderRadius: '18px',
        padding: '24px',
        border: `1px solid ${hovered ? couleur?.replace(')', ',0.3)').replace('rgb', 'rgba') || 'rgba(192,57,43,0.3)' : '#EAEAF0'}`,
        display: 'flex', flexDirection: 'column', gap: '16px',
        cursor: 'default',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.06)',
        animation: `fadeUp 0.5s ease ${delay}s both`,
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: '48px', height: '48px',
          borderRadius: '14px',
          background: couleur || '#FDEDEC',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px',
          transition: 'transform 0.3s ease',
          transform: hovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1)',
        }}>
          {icon}
        </div>
        <div style={{
          fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px',
          textTransform: 'uppercase', color: '#9B9BB4',
          background: '#F8F9FA', padding: '4px 8px', borderRadius: '6px'
        }}>
          Ce mois
        </div>
      </div>
      <div>
        <div style={{
          fontSize: '36px', fontWeight: '800', color: '#1A1A2E',
          letterSpacing: '-1px', lineHeight: 1,
          animation: `countUp 0.6s ease ${delay + 0.2}s both`,
        }}>
          {typeof value === 'number' ? count.toLocaleString() : value}{suffix}
        </div>
        <div style={{ fontSize: '13px', color: '#9B9BB4', fontWeight: '500', marginTop: '6px' }}>
          {label}
        </div>
      </div>
    </div>
  );
}
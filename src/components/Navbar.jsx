import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const C = { bg: '#FCFBF8', text: '#2A1610', primary: '#B5281C', border: '#E8E1D5', gray: '#9B8E84' };

const IconDash = () => <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
const IconUsers = () => <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IconQr = () => <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>;
const IconScan = () => <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9V5a2 2 0 012-2h4M3 15v4a2 2 0 002 2h4m10-16h-4a2 2 0 00-2 2v4m6 10h-4a2 2 0 01-2-2v-4"/></svg>;
const IconSettings = () => <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IconCard = () => <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>;
const IconLogout = () => <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>;
const IconHeart = () => <svg width="18" height="18" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>;

const LIENS = [
  { path: '/dashboard', icon: <IconDash />, label: 'Dashboard' },
  { path: '/clients', icon: <IconUsers />, label: 'Clients' },
  { path: '/caisse', icon: <IconScan />, label: 'Caisse' },
  { path: '/qrcode', icon: <IconQr />, label: 'QR Code' },
  { path: '/programme', icon: <IconSettings />, label: 'Programme' },
  { path: '/abonnement', icon: <IconCard />, label: 'Abonnement' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [restaurant, setRestaurant] = useState(JSON.parse(localStorage.getItem('restaurant') || '{}'));

  useEffect(() => {
    const sync = () => setRestaurant(JSON.parse(localStorage.getItem('restaurant') || '{}'));
    window.addEventListener('storage', sync);
    sync();
    return () => window.removeEventListener('storage', sync);
  }, [location]);

  const logout = () => { localStorage.clear(); navigate('/'); };

  return (
    <>
      <nav style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 12px rgba(42,22,16,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>

          {/* Logo — cœur bordeaux fixe + nom restaurant en rouge */}
          <div onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(181,40,28,0.35)', flexShrink: 0 }}>
              <IconHeart />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, color: C.text, letterSpacing: '-0.3px', lineHeight: 1.1 }}>LoyalPass</div>
              {restaurant.nom && (
                <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, letterSpacing: '0.2px', lineHeight: 1.3, marginTop: 1, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {restaurant.nom}
                </div>
              )}
            </div>
          </div>

          {/* Nav links */}
          <div className="top-nav-links" style={{ display: 'flex', gap: 2 }}>
            {LIENS.map((l) => {
              const actif = location.pathname === l.path;
              return (
                <button key={l.path} onClick={() => navigate(l.path)} style={{ background: actif ? 'rgba(181,40,28,0.08)' : 'transparent', color: actif ? C.primary : C.gray, border: actif ? '1px solid rgba(181,40,28,0.2)' : '1px solid transparent', padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: actif ? 700 : 600, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s', cursor: 'pointer', fontFamily: 'Lato, sans-serif' }}
                onMouseEnter={e => { if (!actif) { e.currentTarget.style.background = C.gray + '12'; e.currentTarget.style.color = C.text; } }}
                onMouseLeave={e => { if (!actif) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.gray; } }}>
                  {l.icon} {l.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: C.gray + '10', border: `1px solid ${C.border}`, borderRadius: 10, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, color: '#fff', flexShrink: 0 }}>
              {restaurant.nom?.[0]?.toUpperCase() || 'R'}
            </div>
            <div className="hide-mobile">
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{restaurant.nom || 'Restaurant'}</div>
              <div style={{ fontSize: 10, color: C.gray }}>{restaurant.email || ''}</div>
            </div>
          </div>
          <button onClick={logout} style={{ background: 'transparent', color: C.gray, border: `1px solid ${C.border}`, padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, transition: 'all 0.2s', fontFamily: 'Lato, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          onMouseEnter={e => { e.currentTarget.style.color = C.primary; e.currentTarget.style.borderColor = C.primary + '55'; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.gray; e.currentTarget.style.borderColor = C.border; }}>
            <IconLogout /> <span className="hide-mobile">Déconnexion</span>
          </button>
        </div>
      </nav>

      {/* BOTTOM NAV — Mobile */}
      <div className="bottom-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, background: C.bg, borderTop: `1px solid ${C.border}`, display: 'none', justifyContent: 'space-around', alignItems: 'center', padding: '8px 0 12px', boxShadow: '0 -4px 20px rgba(42,22,16,0.08)' }}>
        {LIENS.map(l => {
          const actif = location.pathname === l.path;
          return (
            <button key={l.path} onClick={() => navigate(l.path)} style={{ background: actif ? 'rgba(181,40,28,0.08)' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: actif ? C.primary : C.gray, fontFamily: 'Lato, sans-serif', padding: '4px 8px', borderRadius: 10 }}>
              {l.icon}
              <span style={{ fontSize: 10, fontWeight: actif ? 700 : 600 }}>{l.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
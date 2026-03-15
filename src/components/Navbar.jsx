import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [restaurant, setRestaurant] = useState(JSON.parse(localStorage.getItem('restaurant') || '{}'));
  const [scrolled, setScrolled] = useState(false);

  // Recharger le restaurant quand localStorage change
  useEffect(() => {
    const sync = () => setRestaurant(JSON.parse(localStorage.getItem('restaurant') || '{}'));
    window.addEventListener('storage', sync);
    // Aussi vérifier à chaque navigation
    sync();
    return () => window.removeEventListener('storage', sync);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  const couleur = restaurant.couleur || '#C0392B';
  const emoji = restaurant.logo_emoji || '🥙';

  const liens = [
    { path: '/dashboard', icon: '▦', label: 'Dashboard' },
    { path: '/clients', icon: '◎', label: 'Clients' },
    { path: '/caisse', icon: '⊡', label: 'Caisse' },
    { path: '/qrcode', icon: '⊞', label: 'QR Code' },
    { path: '/programme', icon: '⚙', label: 'Programme' },
    { path: '/abonnement', icon: '💳', label: 'Abonnement' },
  ];

  return (
    <nav style={{
      background: scrolled ? 'rgba(26,26,46,0.97)' : '#1A1A2E',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '68px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      transition: 'all 0.3s ease',
      boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: couleur,
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
            boxShadow: `0 4px 12px ${couleur}66`,
            transition: 'all 0.3s',
          }}>{emoji}</div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '16px', color: 'white', letterSpacing: '-0.3px' }}>
              LoyalPass
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {restaurant.nom || 'Dashboard'}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {liens.map((l, i) => {
            const actif = location.pathname === l.path;
            return (
              <button key={l.path} onClick={() => navigate(l.path)} style={{
                background: actif ? `${couleur}33` : 'transparent',
                color: actif ? couleur : 'rgba(255,255,255,0.55)',
                border: actif ? `1px solid ${couleur}55` : '1px solid transparent',
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: actif ? '700' : '500',
                display: 'flex', alignItems: 'center', gap: '7px',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif',
                animation: `slideIn 0.4s ease ${i * 0.05}s both`,
              }}
              onMouseEnter={e => {
                if (!actif) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={e => {
                if (!actif) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                }
              }}>
                <span style={{ fontSize: '15px' }}>{l.icon}</span>
                {l.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Droite */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
          padding: '7px 14px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <div style={{
            width: '28px', height: '28px',
            background: couleur,
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '700', color: 'white'
          }}>
            {restaurant.nom?.[0] || 'R'}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'white' }}>{restaurant.nom || 'Restaurant'}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{restaurant.email || ''}</div>
          </div>
        </div>

        <button onClick={logout} style={{
          background: 'transparent',
          color: 'rgba(255,255,255,0.4)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '8px 14px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '600',
          transition: 'all 0.2s',
          fontFamily: 'Outfit, sans-serif',
          cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#E74C3C'; e.currentTarget.style.borderColor = 'rgba(192,57,43,0.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
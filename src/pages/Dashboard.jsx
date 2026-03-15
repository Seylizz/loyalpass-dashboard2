import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';
import Onboarding from './Onboarding';


export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [restaurant, setRestaurant] = useState(JSON.parse(localStorage.getItem('restaurant') || '{}'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/'); return; }
    chargerStats();
    verifierOnboarding();
  }, []);

  const verifierOnboarding = async () => {
    // N'afficher que si c'est une nouvelle inscription
    if (localStorage.getItem('onboarding_done')) return;
    if (!localStorage.getItem('nouvelle_inscription')) return;
    try {
      const { data } = await API.get('/restaurants/profil');
      if (data.restaurant && !data.restaurant.onboarding_complete) {
        setShowOnboarding(true);
      }
    } catch (err) {}
  };

  const chargerStats = async () => {
    try {
      const { data } = await API.get('/restaurants/stats');
      setStats(data.stats);
    } catch (err) {
      toast.error('Erreur chargement stats');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      <Toaster position="top-right" />
      <Navbar />

      {showOnboarding && (
        <Onboarding
          restaurant={restaurant}
          onComplete={(updates) => {
            setShowOnboarding(false);
            localStorage.setItem('onboarding_done', 'true');
            localStorage.removeItem('nouvelle_inscription');
            const updated = { ...restaurant, ...updates, onboarding_complete: true };
            setRestaurant(updated);
            localStorage.setItem('restaurant', JSON.stringify(updated));
            toast.success('Programme configuré avec succès ! 🎉');
          }}
        />
      )}

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px' }}>

        <div style={{ marginBottom: '36px', animation: 'fadeUp 0.5s ease' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#C0392B', marginBottom: '8px' }}>
            Vue d'ensemble
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#1A1A2E', letterSpacing: '-0.8px', marginBottom: '6px' }}>
            Bonjour, {restaurant.nom} 👋
          </h1>
          <p style={{ color: '#9B9BB4', fontSize: '15px' }}>
            Voici les performances de votre programme de fidélité
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ height: '140px', background: 'white', borderRadius: '18px', animation: 'pulse 1.5s ease infinite', border: '1px solid #EAEAF0' }} />
            ))}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
              <StatCard icon="👥" label="Total clients" value={stats?.total_clients || 0} couleur="#FDEDEC" delay={0} />
              <StatCard icon="📅" label="Actifs ce mois" value={stats?.clients_ce_mois || 0} couleur="#EAFAF1" delay={0.1} />
              <StatCard icon="⭐" label="Points distribués" value={stats?.points_distribues || 0} couleur="#FEF9E7" delay={0.2} />
              <StatCard icon="🎁" label="Récompenses" value={stats?.recompenses_utilisees || 0} couleur="#EAF4FB" delay={0.3} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>

              <div style={{
                background: 'white', borderRadius: '20px',
                border: '1px solid #EAEAF0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                animation: 'fadeUp 0.5s ease 0.3s both',
              }}>
                <div style={{ padding: '24px 28px', borderBottom: '1px solid #F0F0F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#1A1A2E' }}>🏆 Top clients</div>
                    <div style={{ fontSize: '12px', color: '#9B9BB4', marginTop: '2px' }}>Classés par points</div>
                  </div>
                  <button onClick={() => navigate('/clients')} style={{
                    background: '#F8F9FA', border: '1px solid #EAEAF0', color: '#4A4A6A',
                    padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                    fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FDEDEC'; e.currentTarget.style.color = '#C0392B'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F8F9FA'; e.currentTarget.style.color = '#4A4A6A'; }}>
                    Voir tous →
                  </button>
                </div>

                {!stats?.top_clients?.length ? (
                  <div style={{ padding: '60px', textAlign: 'center', color: '#9B9BB4' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
                    <div style={{ fontWeight: '700', marginBottom: '4px' }}>Aucun client encore</div>
                    <div style={{ fontSize: '13px' }}>Partagez votre QR code pour commencer</div>
                  </div>
                ) : (
                  <div>
                    {stats.top_clients.map((c, i) => (
                      <div key={i} style={{
                        padding: '16px 28px',
                        borderBottom: i < stats.top_clients.length - 1 ? '1px solid #F8F8FC' : 'none',
                        display: 'flex', alignItems: 'center', gap: '14px',
                        transition: 'background 0.2s',
                        animation: `fadeUp 0.4s ease ${0.4 + i * 0.08}s both`,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '10px',
                          background: i === 0 ? 'linear-gradient(135deg, #F39C12, #E67E22)' : i === 1 ? 'linear-gradient(135deg, #BDC3C7, #95A5A6)' : i === 2 ? 'linear-gradient(135deg, #CD853F, #A0522D)' : '#F8F9FA',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '14px', fontWeight: '800', color: i < 3 ? 'white' : '#9B9BB4', flexShrink: 0
                        }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '700', fontSize: '14px', color: '#1A1A2E' }}>{c.prenom || 'Anonyme'}</div>
                          <div style={{ fontSize: '12px', color: '#9B9BB4' }}>{c.visites} visites</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '16px', fontWeight: '800', color: '#C0392B' }}>{c.points}</div>
                          <div style={{ fontSize: '11px', color: '#9B9BB4' }}>points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', animation: 'fadeUp 0.5s ease 0.4s both' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#9B9BB4', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Actions rapides
                </div>
                {[
                  { icon: '📱', label: 'Scanner un client', sub: 'Créditer des points', path: '/caisse', couleur: '#FDEDEC', border: 'rgba(192,57,43,0.2)' },
                  { icon: '🔲', label: 'Mon QR Code', sub: "Page d'inscription clients", path: '/qrcode', couleur: '#EAF4FB', border: 'rgba(41,128,185,0.2)' },
                  { icon: '👥', label: 'Mes clients', sub: `${stats?.total_clients || 0} membres inscrits`, path: '/clients', couleur: '#EAFAF1', border: 'rgba(39,174,96,0.2)' },
                ].map((action, i) => (
                  <button key={i} onClick={() => navigate(action.path)} style={{
                    background: 'white', border: `1px solid ${action.border}`,
                    borderRadius: '16px', padding: '18px 20px',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    cursor: 'pointer', transition: 'all 0.25s ease',
                    textAlign: 'left', width: '100%',
                    fontFamily: 'Outfit, sans-serif',
                    animation: `fadeUp 0.4s ease ${0.5 + i * 0.1}s both`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(6px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: action.couleur,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px', flexShrink: 0
                    }}>
                      {action.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#1A1A2E' }}>{action.label}</div>
                      <div style={{ fontSize: '12px', color: '#9B9BB4', marginTop: '2px' }}>{action.sub}</div>
                    </div>
                    <div style={{ color: '#EAEAF0', fontSize: '18px' }}>→</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
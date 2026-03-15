import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';
import Onboarding from './Onboarding';

const C = { bg: '#FCFBF8', text: '#2A1610', primary: '#B5281C', amber: '#D97706', border: '#E8E1D5', gray: '#9B8E84' };

const IconUsers = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IconCalendar = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;
const IconStar = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>;
const IconGift = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>;
const IconScan = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9V5a2 2 0 012-2h4M3 15v4a2 2 0 002 2h4m10-16h-4a2 2 0 00-2 2v4m6 10h-4a2 2 0 01-2-2v-4"/></svg>;
const IconQr = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>;
const IconArrow = () => <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>;
const IconActivity = () => <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>;

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activite, setActivite] = useState([]);
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
    if (localStorage.getItem('onboarding_done')) return;
    if (!localStorage.getItem('nouvelle_inscription')) return;
    try {
      const { data } = await API.get('/restaurants/profil');
      if (data.restaurant && !data.restaurant.onboarding_complete) setShowOnboarding(true);
    } catch {}
  };

  const chargerStats = async () => {
    try {
      const { data } = await API.get('/restaurants/stats');
      setStats(data.stats);
      // Activité récente depuis les top clients (dernières transactions simulées)
      if (data.stats?.top_clients?.length) {
        setActivite(data.stats.top_clients.slice(0, 4).map(c => ({
          prenom: c.prenom,
          points: c.points,
          visites: c.visites,
        })));
      }
    } catch { toast.error('Erreur chargement stats'); }
    setLoading(false);
  };

  const couleur = restaurant.couleur || C.primary;
  const emoji = restaurant.logo_emoji || '🥙';

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Lato, sans-serif' }}>
      <Toaster position="top-right" />
      <Navbar />

      {showOnboarding && (
        <Onboarding restaurant={restaurant} onComplete={(updates) => {
          setShowOnboarding(false);
          localStorage.setItem('onboarding_done', 'true');
          localStorage.removeItem('nouvelle_inscription');
          const updated = { ...restaurant, ...updates, onboarding_complete: true };
          setRestaurant(updated);
          localStorage.setItem('restaurant', JSON.stringify(updated));
          toast.success('Programme configuré !');
        }} />
      )}

      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, #2A1610 0%, #3D1F17 60%, #2A1610 100%)`, padding: '36px 32px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(181,40,28,0.15)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(217,119,6,0.1)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: couleur, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: `0 8px 24px ${couleur}55`, flexShrink: 0 }}>{emoji}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Tableau de bord</div>
              <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.8px', lineHeight: 1.1 }}>Bonjour, {restaurant.nom}</h1>
            </div>
          </div>
          {!loading && stats && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'clients fidèles', val: stats.total_clients || 0 },
                { label: 'actifs ce mois', val: stats.clients_ce_mois || 0, amber: true },
                { label: 'points distribués', val: (stats.points_distribues || 0).toLocaleString() },
              ].map(({ label, val, amber }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 100, padding: '6px 14px' }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: amber ? C.amber : '#fff' }}>{val}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CONTENU */}
      <div className="page-content" style={{ maxWidth: 1100, margin: '-44px auto 0', padding: '0 32px 48px', position: 'relative', zIndex: 10 }}>
        {loading ? (
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
            {[0,1,2,3].map(i => <div key={i} style={{ height: 130, background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, animation: 'pulse 1.5s ease infinite' }} />)}
          </div>
        ) : (
          <>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
              <StatCard icon={<IconUsers/>} label="Total clients" value={stats?.total_clients||0} couleur="rgba(181,40,28,0.08)" delay={0}/>
              <StatCard icon={<IconCalendar/>} label="Actifs ce mois" value={stats?.clients_ce_mois||0} couleur="rgba(5,150,105,0.08)" delay={0.1}/>
              <StatCard icon={<IconStar/>} label="Points distribués" value={stats?.points_distribues||0} couleur="rgba(217,119,6,0.08)" delay={0.2}/>
              <StatCard icon={<IconGift/>} label="Récompenses" value={stats?.recompenses_utilisees||0} couleur="rgba(41,128,185,0.08)" delay={0.3}/>
            </div>

            <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

              {/* Top clients */}
              <div style={{ background: '#fff', borderRadius: 24, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 15px 40px -15px rgba(181,40,28,0.1)', animation: 'fadeUp 0.5s ease 0.3s both' }}>
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: C.text }}>Top clients</div>
                    <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>Classés par points</div>
                  </div>
                  <button onClick={() => navigate('/clients')} style={{ background: '#F3F0EA', border: `1px solid ${C.border}`, color: C.text, padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: 'Lato, sans-serif', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(181,40,28,0.08)'; e.currentTarget.style.color = C.primary; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F3F0EA'; e.currentTarget.style.color = C.text; }}>
                    Voir tous <IconArrow/>
                  </button>
                </div>
                {!stats?.top_clients?.length ? (
                  <div style={{ padding: '60px', textAlign: 'center' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#F3F0EA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: C.gray }}><IconUsers/></div>
                    <div style={{ fontWeight: 900, color: C.text, marginBottom: 6, fontSize: 16 }}>Aucun client encore</div>
                    <div style={{ fontSize: 13, color: C.gray }}>Partagez votre QR code pour commencer</div>
                    <button onClick={() => navigate('/qrcode')} style={{ marginTop: 18, background: C.primary, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato, sans-serif', boxShadow: '0 4px 12px rgba(181,40,28,0.3)' }}>
                      Voir mon QR Code →
                    </button>
                  </div>
                ) : (
                  stats.top_clients.map((c, i) => (
                    <div key={i} style={{ padding: '14px 24px', borderBottom: i < stats.top_clients.length-1 ? `1px solid #F3F0EA` : 'none', display: 'flex', alignItems: 'center', gap: 14, transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAF8'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: i===0?`linear-gradient(135deg,${C.amber},#B45309)`:i===1?'linear-gradient(135deg,#9B8E84,#7A6E66)':i===2?`linear-gradient(135deg,${C.primary},#96281B)`:'#F3F0EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: i<3?'white':C.gray, flexShrink: 0 }}>{i+1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{c.prenom||'Anonyme'}</div>
                        <div style={{ fontSize: 12, color: C.gray }}>{c.visites} visites</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 17, fontWeight: 900, color: C.primary }}>{c.points}</div>
                        <div style={{ fontSize: 11, color: C.gray }}>points</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Colonne droite */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Bannière programme */}
                <div style={{ background: `linear-gradient(135deg, ${couleur}, ${couleur}CC)`, borderRadius: 20, padding: '20px', boxShadow: `0 15px 40px -15px ${couleur}55`, animation: 'fadeUp 0.5s ease 0.2s both', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', marginBottom: 2 }}>{restaurant.nom}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 14 }}>Programme de fidélité actif</div>
                  <button onClick={() => navigate('/programme')} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato, sans-serif' }}>
                    Gérer le programme →
                  </button>
                </div>

                {/* Actions rapides */}
                <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: 1 }}>Actions rapides</div>
                {[
                  { icon: <IconScan/>, label: 'Scanner un client', sub: 'Créditer des points', path: '/caisse', accent: C.primary },
                  { icon: <IconQr/>, label: 'Mon QR Code', sub: "Page d'inscription", path: '/qrcode', accent: '#2980B9' },
                ].map((a, i) => (
                  <button key={i} onClick={() => navigate(a.path)} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'all 0.25s', textAlign: 'left', width: '100%', fontFamily: 'Lato, sans-serif', boxShadow: '0 2px 8px rgba(42,22,16,0.04)' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(42,22,16,0.08)'; e.currentTarget.style.borderColor = `${a.accent}44`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(42,22,16,0.04)'; e.currentTarget.style.borderColor = C.border; }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${a.accent}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.accent, flexShrink: 0 }}>{a.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: C.gray, marginTop: 1 }}>{a.sub}</div>
                    </div>
                    <div style={{ color: C.border }}><IconArrow/></div>
                  </button>
                ))}

                {/* Activité récente */}
                <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(42,22,16,0.04)' }}>
                  <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ color: C.amber }}><IconActivity/></div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: C.text }}>Activité récente</div>
                  </div>
                  {activite.length === 0 ? (
                    <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 12, color: C.gray }}>Aucune activité pour l'instant</div>
                  ) : (
                    activite.map((a, i) => (
                      <div key={i} style={{ padding: '10px 16px', borderBottom: i < activite.length-1 ? `1px solid #F3F0EA` : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: `hsl(${(a.prenom?.charCodeAt(0)||0)*7%360},40%,88%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: `hsl(${(a.prenom?.charCodeAt(0)||0)*7%360},40%,30%)`, flexShrink: 0 }}>
                          {a.prenom?.[0]?.toUpperCase()||'?'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{a.prenom||'Anonyme'}</div>
                          <div style={{ fontSize: 11, color: C.gray }}>{a.visites} visites au total</div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 900, color: C.primary }}>{a.points} pts</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
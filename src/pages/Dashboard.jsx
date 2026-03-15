import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';
import Onboarding from './Onboarding';

const C = { bg: '#FCFBF8', text: '#2A1610', primary: '#B5281C', border: '#E8E1D5', gray: '#9B8E84' };

const IconUsers = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IconCalendar = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;
const IconStar = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>;
const IconGift = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>;
const IconScan = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9V5a2 2 0 012-2h4M3 15v4a2 2 0 002 2h4m10-16h-4a2 2 0 00-2 2v4m6 10h-4a2 2 0 01-2-2v-4"/></svg>;
const IconQr = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>;
const IconArrow = () => <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>;

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
    } catch { toast.error('Erreur chargement stats'); }
    setLoading(false);
  };

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
          toast.success('Programme configuré ! 🎉');
        }} />
      )}

      <div className="page-content" style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32, animation: 'fadeUp 0.5s ease' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: C.primary, marginBottom: 8 }}>Vue d'ensemble</div>
          <h1 className="h1-title" style={{ fontSize: 30, fontWeight: 900, color: C.text, letterSpacing: '-0.8px', marginBottom: 4 }}>
            Bonjour, {restaurant.nom}
          </h1>
          <p style={{ color: C.gray, fontSize: 15 }}>Performances de votre programme de fidélité</p>
        </div>

        {loading ? (
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
            {[0,1,2,3].map(i => <div key={i} style={{ height: 130, background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, animation: 'pulse 1.5s ease infinite' }} />)}
          </div>
        ) : (
          <>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
              <StatCard icon={<IconUsers/>} label="Total clients" value={stats?.total_clients||0} couleur="rgba(181,40,28,0.08)" delay={0}/>
              <StatCard icon={<IconCalendar/>} label="Actifs ce mois" value={stats?.clients_ce_mois||0} couleur="rgba(5,150,105,0.08)" delay={0.1}/>
              <StatCard icon={<IconStar/>} label="Points distribués" value={stats?.points_distribues||0} couleur="rgba(217,119,6,0.08)" delay={0.2}/>
              <StatCard icon={<IconGift/>} label="Récompenses" value={stats?.recompenses_utilisees||0} couleur="rgba(41,128,185,0.08)" delay={0.3}/>
            </div>

            <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
              {/* Top clients */}
              <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(42,22,16,0.04)', animation: 'fadeUp 0.5s ease 0.3s both' }}>
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: C.text }}>Top clients</div>
                    <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>Classés par points</div>
                  </div>
                  <button onClick={() => navigate('/clients')} style={{ background: '#F3F0EA', border: `1px solid ${C.border}`, color: C.text, padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: 'Lato, sans-serif', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(181,40,28,0.08)'; e.currentTarget.style.color = C.primary; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F3F0EA'; e.currentTarget.style.color = C.text; }}>
                    Voir tous →
                  </button>
                </div>
                {!stats?.top_clients?.length ? (
                  <div style={{ padding: '60px', textAlign: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F3F0EA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: C.gray }}><IconUsers/></div>
                    <div style={{ fontWeight: 900, color: C.text, marginBottom: 4 }}>Aucun client encore</div>
                    <div style={{ fontSize: 13, color: C.gray }}>Partagez votre QR code pour commencer</div>
                  </div>
                ) : (
                  stats.top_clients.map((c, i) => (
                    <div key={i} style={{ padding: '14px 24px', borderBottom: i < stats.top_clients.length-1 ? `1px solid #F3F0EA` : 'none', display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.2s', animation: `fadeUp 0.4s ease ${0.4+i*0.08}s both` }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAF8'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: i===0?'linear-gradient(135deg,#D97706,#B45309)':i===1?'linear-gradient(135deg,#9B8E84,#7A6E66)':i===2?'linear-gradient(135deg,#B5281C,#96281B)':'#F3F0EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: i<3?'white':C.gray, flexShrink: 0 }}>{i+1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{c.prenom||'Anonyme'}</div>
                        <div style={{ fontSize: 12, color: C.gray }}>{c.visites} visites</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: C.primary }}>{c.points}</div>
                        <div style={{ fontSize: 11, color: C.gray }}>points</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Actions rapides */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeUp 0.5s ease 0.4s both' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: 1 }}>Actions rapides</div>
                {[
                  { icon: <IconScan/>, label: 'Scanner un client', sub: 'Créditer des points', path: '/caisse', bg: 'rgba(181,40,28,0.06)', border: 'rgba(181,40,28,0.15)' },
                  { icon: <IconQr/>, label: 'Mon QR Code', sub: "Page d'inscription clients", path: '/qrcode', bg: 'rgba(41,128,185,0.06)', border: 'rgba(41,128,185,0.15)' },
                  { icon: <IconUsers/>, label: 'Mes clients', sub: `${stats?.total_clients||0} membres inscrits`, path: '/clients', bg: 'rgba(5,150,105,0.06)', border: 'rgba(5,150,105,0.15)' },
                ].map((a, i) => (
                  <button key={i} onClick={() => navigate(a.path)} style={{ background: '#fff', border: `1px solid ${a.border}`, borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'all 0.25s', textAlign: 'left', width: '100%', fontFamily: 'Lato, sans-serif', animation: `fadeUp 0.4s ease ${0.5+i*0.1}s both` }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(42,22,16,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, flexShrink: 0 }}>{a.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{a.label}</div>
                      <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{a.sub}</div>
                    </div>
                    <div style={{ color: C.border }}><IconArrow/></div>
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
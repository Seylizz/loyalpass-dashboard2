import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';

const C = { bg: '#FCFBF8', text: '#2A1610', primary: '#B5281C', amber: '#D97706', border: '#E8E1D5', gray: '#9B8E84' };

const IconSearch = () => <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>;
const IconUsers = () => <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState('');

  useEffect(() => { chargerClients(); }, []);

  const chargerClients = async () => {
    try {
      const { data } = await API.get('/clients');
      setClients(data.clients);
    } catch { toast.error('Erreur chargement clients'); }
    setLoading(false);
  };

  const filtres = clients.filter(c =>
    c.prenom?.toLowerCase().includes(recherche.toLowerCase()) ||
    c.telephone?.includes(recherche) ||
    c.code_unique?.includes(recherche.toUpperCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Lato, sans-serif' }}>
      <Toaster position="top-right" />
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #2A1610 0%, #3D1F17 60%, #2A1610 100%)', padding: '36px 32px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(181,40,28,0.15)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(217,119,6,0.1)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Base clients</div>
          <h1 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.8px', marginBottom: 6 }}>Mes clients</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>{clients.length} membre{clients.length > 1 ? 's' : ''} inscrit{clients.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="page-content" style={{ maxWidth: 1100, margin: '-44px auto 0', padding: '0 32px 48px', position: 'relative', zIndex: 10 }}>

        {/* Recherche */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.gray }}><IconSearch/></div>
            <input placeholder="Nom, téléphone ou code..." value={recherche} onChange={e => setRecherche(e.target.value)}
              style={{ padding: '11px 16px 11px 38px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, width: 260, background: '#fff', outline: 'none', fontFamily: 'Lato, sans-serif', color: C.text, boxShadow: '0 2px 8px rgba(42,22,16,0.06)' }}
              onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = C.border}/>
          </div>
        </div>

        {loading ? (
          <div style={{ height: 300, background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, animation: 'pulse 1.5s ease infinite' }} />
        ) : filtres.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: '0 15px 40px -15px rgba(181,40,28,0.1)' }}>
            <div style={{ color: C.gray, margin: '0 auto 12px', display: 'flex', justifyContent: 'center' }}><IconUsers/></div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.text, marginBottom: 8 }}>{recherche ? 'Aucun résultat' : 'Aucun client encore'}</div>
            <div style={{ fontSize: 14, color: C.gray }}>{recherche ? 'Essayez un autre terme' : "Partagez votre QR code pour que vos clients s'inscrivent !"}</div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 15px 40px -15px rgba(181,40,28,0.1)' }}>
            <div className="table-header" style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1.2fr', padding: '12px 24px', background: '#F3F0EA', borderBottom: `1px solid ${C.border}` }}>
              {['Client','Téléphone','Code','Points','Visites','Inscrit le'].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</div>
              ))}
            </div>
            {filtres.map((c, i) => (
              <div key={c.id} style={{ padding: '14px 24px', borderBottom: i < filtres.length-1 ? `1px solid #F3F0EA` : 'none', display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#FAFAF8'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `hsl(${(c.prenom?.charCodeAt(0)||0)*7%360},50%,88%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: `hsl(${(c.prenom?.charCodeAt(0)||0)*7%360},50%,30%)`, flexShrink: 0 }}>
                  {c.prenom?.[0]?.toUpperCase()||'?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{c.prenom||'Anonyme'}</div>
                  <div style={{ fontSize: 12, color: C.gray }}>{c.telephone||'—'}</div>
                </div>
                <div className="hide-mobile" style={{ fontFamily: 'monospace', background: '#F3F0EA', border: `1px solid ${C.border}`, padding: '3px 8px', borderRadius: 6, fontSize: 11, color: C.text, letterSpacing: 1 }}>{c.code_unique}</div>
                <div style={{ textAlign: 'right', minWidth: 60 }}>
                  <div style={{ fontSize: 17, fontWeight: 900, color: C.primary }}>{c.points}</div>
                  <div style={{ fontSize: 11, color: C.gray }}>pts</div>
                </div>
                <div className="hide-mobile" style={{ fontSize: 13, color: C.gray, fontWeight: 600, minWidth: 40, textAlign: 'center' }}>{c.visites}</div>
                <div className="hide-mobile" style={{ fontSize: 12, color: C.gray }}>
                  {new Date(c.inscrit_le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
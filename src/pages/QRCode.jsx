import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';

const C = { bg: '#FCFBF8', text: '#2A1610', primary: '#B5281C', amber: '#D97706', border: '#E8E1D5', gray: '#9B8E84' };

const IconPrint = () => <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>;
const IconCopy = () => <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>;

export default function QRCode() {
  const [qrCode, setQrCode] = useState(null);
  const [urlInscription, setUrlInscription] = useState('');
  const [loading, setLoading] = useState(true);
  const [imprimerUrl, setImprimerUrl] = useState('');

  useEffect(() => { chargerQR(); }, []);

  const chargerQR = async () => {
    try {
      const { data } = await API.get('/qrcode/inscription');
      setQrCode(data.qr_code);
      setUrlInscription(data.url_inscription);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      setImprimerUrl(`https://loyalpass-backend-production.up.railway.app/api/qrcode/imprimer?token=${token}`);
    } catch { toast.error('Erreur chargement QR code'); }
    setLoading(false);
  };

  const copier = () => { navigator.clipboard.writeText(urlInscription).then(() => toast.success('Lien copié !')); };
  const imprimer = () => { window.open(imprimerUrl, '_blank'); };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Lato, sans-serif' }}>
      <Toaster position="top-right" />
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #2A1610 0%, #3D1F17 60%, #2A1610 100%)', padding: '36px 32px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(181,40,28,0.15)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(217,119,6,0.1)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Programme fidélité</div>
          <h1 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.8px', marginBottom: 6 }}>Votre QR Code</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>Posez-le sur votre comptoir — vos clients s'inscrivent en 10 secondes</p>
        </div>
      </div>

      <div className="page-content" style={{ maxWidth: 680, margin: '-44px auto 0', padding: '0 32px 48px', position: 'relative', zIndex: 10 }}>
        {loading ? (
          <div style={{ height: 400, background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, animation: 'pulse 1.5s ease infinite' }} />
        ) : (
          <>
            <div style={{ background: '#fff', borderRadius: 24, border: `1px solid ${C.border}`, padding: '44px 40px', textAlign: 'center', marginBottom: 16, boxShadow: '0 15px 40px -15px rgba(181,40,28,0.1)' }}>
              {qrCode && (
                <div style={{ display: 'inline-block', position: 'relative', marginBottom: 28 }}>
                  <div style={{ position: 'absolute', inset: -10, background: 'rgba(181,40,28,0.05)', borderRadius: 22 }} />
                  <img src={qrCode} alt="QR Code fidélité" style={{ width: 200, height: 200, borderRadius: 16, position: 'relative', boxShadow: '0 8px 32px rgba(42,22,16,0.1)' }} />
                </div>
              )}
              <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Lien d'inscription</div>
              <div style={{ background: '#F3F0EA', border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 14px', fontSize: 12, color: C.text, fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: 1.5 }}>
                {urlInscription}
              </div>
            </div>

            <div className="actions-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <button onClick={copier} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 700, boxShadow: '0 8px 20px -6px rgba(181,40,28,0.5)', transition: 'all 0.2s', fontFamily: 'Lato, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <IconCopy/> Copier le lien
              </button>
              <button onClick={imprimer} style={{ background: '#fff', color: C.primary, border: `2px solid rgba(181,40,28,0.25)`, borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 700, transition: 'all 0.2s', fontFamily: 'Lato, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(181,40,28,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <IconPrint/> Imprimer
              </button>
            </div>

            <div style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 16, padding: '18px 22px' }}>
              <div style={{ fontWeight: 900, fontSize: 14, color: '#92400E', marginBottom: 12 }}>Comment ça marche pour vos clients</div>
              {['Le client scanne le QR code avec son téléphone', 'Il entre son prénom et numéro en 10 secondes', "Sa carte s'ajoute dans Apple Wallet ou Google Wallet", "À chaque visite, le caissier scanne son code → les points s'ajoutent"].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#92400E', marginBottom: 8, lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 900, flexShrink: 0 }}>{i+1}.</span> {s}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
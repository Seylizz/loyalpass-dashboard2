import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';

const C = { bg: '#FCFBF8', text: '#2A1610', primary: '#B5281C', border: '#E8E1D5', gray: '#9B8E84' };

const IconPrint = () => <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>;
const IconCopy = () => <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>;
const IconInfo = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;

export default function QRCode() {
  const [qrCode, setQrCode] = useState(null);
  const [urlInscription, setUrlInscription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { chargerQR(); }, []);

  const chargerQR = async () => {
    try {
      const { data } = await API.get('/qrcode/inscription');
      setQrCode(data.qr_code);
      setUrlInscription(data.url_inscription);
    } catch { toast.error('Erreur chargement QR code'); }
    setLoading(false);
  };

  const copier = () => { navigator.clipboard.writeText(urlInscription).then(() => toast.success('Lien copié !')); };

  const steps = [
    'Le client scanne le QR code avec son téléphone',
    'Il entre son prénom et numéro en 10 secondes',
    "Sa carte fidélité s'ajoute dans Apple Wallet ou Google Wallet",
    'À chaque visite, le caissier scanne son code — les points s\'ajoutent automatiquement',
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Lato, sans-serif' }}>
      <Toaster position="top-right" />
      <Navbar />
      <div className="page-content" style={{ maxWidth: 680, margin: '0 auto', padding: '36px 32px' }}>

        <div style={{ marginBottom: 28, animation: 'fadeUp 0.5s ease' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: C.primary, marginBottom: 8 }}>Programme fidélité</div>
          <h1 className="h1-title" style={{ fontSize: 30, fontWeight: 900, color: C.text, letterSpacing: '-0.8px' }}>Votre QR Code</h1>
          <p style={{ color: C.gray, fontSize: 15, marginTop: 4 }}>Posez-le sur votre comptoir — vos clients s'inscrivent en 10 secondes</p>
        </div>

        {loading ? (
          <div style={{ height: 400, background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, animation: 'pulse 1.5s ease infinite' }} />
        ) : (
          <>
            {/* QR Card */}
            <div style={{ background: '#fff', borderRadius: 24, border: `1px solid ${C.border}`, padding: '44px 40px', textAlign: 'center', marginBottom: 16, boxShadow: '0 4px 24px rgba(42,22,16,0.06)', animation: 'fadeUp 0.5s ease 0.1s both' }}>
              {qrCode && (
                <div style={{ display: 'inline-block', position: 'relative', marginBottom: 28 }}>
                  <div style={{ position: 'absolute', inset: -10, background: 'rgba(181,40,28,0.05)', borderRadius: 22 }} />
                  <img src={qrCode} alt="QR Code fidélité" style={{ width: 200, height: 200, borderRadius: 16, position: 'relative', boxShadow: '0 8px 32px rgba(42,22,16,0.1)' }} />
                </div>
              )}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Lien d'inscription</div>
                <div style={{ background: '#F3F0EA', border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 14px', fontSize: 12, color: C.text, fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: 1.5 }}>
                  {urlInscription}
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="actions-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, animation: 'fadeUp 0.5s ease 0.2s both' }}>
              <button onClick={copier} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 700, boxShadow: '0 8px 20px -6px rgba(181,40,28,0.5)', transition: 'all 0.2s', fontFamily: 'Lato, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                <IconCopy/> Copier le lien
              </button>
              <button onClick={() => window.print()} style={{ background: '#fff', color: C.primary, border: `2px solid rgba(181,40,28,0.25)`, borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 700, transition: 'all 0.2s', fontFamily: 'Lato, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(181,40,28,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <IconPrint/> Imprimer
              </button>
            </div>

            {/* Info */}
            <div style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 16, padding: '18px 22px', animation: 'fadeUp 0.5s ease 0.3s both' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: 14, color: '#92400E', marginBottom: 12 }}>
                <IconInfo/> Comment ça marche pour vos clients
              </div>
              {steps.map((s, i) => (
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
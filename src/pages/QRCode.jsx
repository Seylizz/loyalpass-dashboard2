import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';

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
    } catch (err) {
      toast.error('Erreur chargement QR code');
    }
    setLoading(false);
  };

  const imprimer = () => {
    window.open('http://localhost:3000/api/qrcode/imprimer', '_blank');
  };

  const copier = () => {
    navigator.clipboard.writeText(urlInscription).then(() => toast.success('Lien copié !'));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', fontFamily: 'Outfit, sans-serif' }}>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Outfit, sans-serif', fontWeight: '600' } }} />
      <Navbar />

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px', animation: 'fadeUp 0.5s ease' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#C0392B', marginBottom: '8px' }}>
            Programme fidélité
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#1A1A2E', letterSpacing: '-0.8px' }}>
            Votre QR Code
          </h1>
          <p style={{ color: '#9B9BB4', fontSize: '15px', marginTop: '6px' }}>
            Posez-le sur votre comptoir — vos clients s'inscrivent en 10 secondes
          </p>
        </div>

        {loading ? (
          <div style={{ height: '400px', background: 'white', borderRadius: '20px', border: '1px solid #EAEAF0', animation: 'pulse 1.5s ease infinite' }} />
        ) : (
          <>
            {/* QR Code */}
            <div style={{
              background: 'white', borderRadius: '24px',
              border: '1px solid #EAEAF0',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              padding: '48px',
              textAlign: 'center',
              marginBottom: '16px',
              animation: 'fadeUp 0.5s ease 0.1s both',
            }}>
              {qrCode && (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <div style={{
                    position: 'absolute', inset: '-12px',
                    background: 'linear-gradient(135deg, rgba(192,57,43,0.1), rgba(231,76,60,0.05))',
                    borderRadius: '20px',
                  }} />
                  <img src={qrCode} alt="QR Code fidélité" style={{
                    width: '220px', height: '220px',
                    borderRadius: '16px',
                    position: 'relative',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }} />
                </div>
              )}

              <div style={{ marginTop: '32px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#9B9BB4', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Lien d'inscription
                </div>
                <div style={{
                  background: '#F8F9FA', border: '1px solid #EAEAF0',
                  borderRadius: '10px', padding: '12px 16px',
                  fontSize: '12px', color: '#4A4A6A',
                  fontFamily: 'JetBrains Mono, monospace',
                  wordBreak: 'break-all', lineHeight: '1.5'
                }}>
                  {urlInscription}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', animation: 'fadeUp 0.5s ease 0.2s both' }}>
              <button onClick={imprimer} style={{
                background: 'linear-gradient(135deg, #C0392B, #E74C3C)',
                color: 'white', border: 'none', borderRadius: '14px',
                padding: '16px', fontSize: '15px', fontWeight: '700',
                boxShadow: '0 8px 24px rgba(192,57,43,0.3)',
                transition: 'all 0.2s', fontFamily: 'Outfit, sans-serif',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                🖨️ Imprimer l'affiche
              </button>
              <button onClick={copier} style={{
                background: 'white', color: '#C0392B',
                border: '2px solid rgba(192,57,43,0.3)', borderRadius: '14px',
                padding: '16px', fontSize: '15px', fontWeight: '700',
                transition: 'all 0.2s', fontFamily: 'Outfit, sans-serif',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FDEDEC'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                📋 Copier le lien
              </button>
            </div>

            {/* Info */}
            <div style={{
              background: '#FEF9E7', border: '1px solid rgba(243,156,18,0.3)',
              borderRadius: '16px', padding: '20px 24px',
              animation: 'fadeUp 0.5s ease 0.3s both',
            }}>
              <div style={{ fontWeight: '800', fontSize: '14px', color: '#8B6914', marginBottom: '10px' }}>
                💡 Comment ça marche pour vos clients
              </div>
              {[
                '1. Le client scanne le QR code avec son téléphone',
                '2. Il entre son prénom et numéro en 10 secondes',
                '3. Sa carte fidélité s\'ajoute dans Apple Wallet ou Google Wallet',
                '4. À chaque visite, le caissier scanne son code → les points s\'ajoutent automatiquement',
              ].map((step, i) => (
                <div key={i} style={{ fontSize: '13px', color: '#8B6914', fontWeight: '500', marginBottom: '6px', lineHeight: '1.5' }}>
                  {step}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
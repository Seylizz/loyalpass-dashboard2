import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';
import { Html5Qrcode } from 'html5-qrcode';

export default function Caisse() {
  const [code, setCode] = useState('');
  const [montant, setMontant] = useState('');
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannerActif, setScannerActif] = useState(false);
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const demarrerScanner = async () => {
    setScannerActif(true);
    setScanning(true);
    setTimeout(async () => {
      try {
        html5QrRef.current = new Html5Qrcode('qr-reader');
        await html5QrRef.current.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            setCode(decodedText);
            arreterScanner();
            toast.success('QR Code scanné !');
          },
          () => {}
        );
      } catch (err) {
        toast.error('Impossible d\'accéder à la caméra');
        setScannerActif(false);
        setScanning(false);
      }
    }, 300);
  };

  const arreterScanner = async () => {
    if (html5QrRef.current) {
      await html5QrRef.current.stop().catch(() => {});
      html5QrRef.current = null;
    }
    setScannerActif(false);
    setScanning(false);
  };

  const crediter = async () => {
    if (!code || !montant) {
      toast.error('Entre le code client et le montant');
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.post('/points/crediter', {
        code_client: code,
        montant_euro: parseFloat(montant)
      });
      setClient(data.client);
      toast.success(data.message);
      setCode('');
      setMontant('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Client introuvable');
    }
    setLoading(false);
  };

  const utiliserRecompense = async () => {
    setLoading(true);
    try {
      const { data } = await API.post('/points/utiliser', { code_client: code || client?.code_unique });
      toast.success(`🎁 ${data.recompense} accordée !`);
      setClient(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
    setLoading(false);
  };

  const reset = () => {
    setClient(null);
    setCode('');
    setMontant('');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', fontFamily: 'Outfit, sans-serif' }}>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Outfit, sans-serif', fontWeight: '600' } }} />
      <Navbar />

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px', animation: 'fadeUp 0.5s ease' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#C0392B', marginBottom: '8px' }}>
            Terminal de caisse
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#1A1A2E', letterSpacing: '-0.8px' }}>
            Scanner un client
          </h1>
          <p style={{ color: '#9B9BB4', fontSize: '15px', marginTop: '6px' }}>
            Scannez le QR code ou entrez le code manuellement
          </p>
        </div>

        {/* Scanner QR */}
        <div style={{
          background: 'white', borderRadius: '20px',
          border: '1px solid #EAEAF0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          marginBottom: '20px',
          animation: 'fadeUp 0.5s ease 0.1s both',
        }}>
          {/* Header card */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F0F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: '800', fontSize: '15px', color: '#1A1A2E' }}>
              📷 Scanner le QR code
            </div>
            <button
              onClick={scannerActif ? arreterScanner : demarrerScanner}
              style={{
                background: scannerActif ? '#FDEDEC' : 'linear-gradient(135deg, #C0392B, #E74C3C)',
                color: scannerActif ? '#C0392B' : 'white',
                border: scannerActif ? '1px solid rgba(192,57,43,0.3)' : 'none',
                padding: '9px 20px', borderRadius: '10px',
                fontSize: '13px', fontWeight: '700',
                transition: 'all 0.2s ease',
                boxShadow: scannerActif ? 'none' : '0 4px 12px rgba(192,57,43,0.3)',
                fontFamily: 'Outfit, sans-serif',
              }}>
              {scannerActif ? '✕ Arrêter' : '📷 Ouvrir caméra'}
            </button>
          </div>

          {/* Zone scanner */}
          <div style={{ padding: '24px' }}>
            {scannerActif && (
              <div style={{ marginBottom: '20px', position: 'relative' }}>
                <div id="qr-reader" style={{ width: '100%', borderRadius: '14px', overflow: 'hidden' }} />
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '220px', height: '220px',
                  border: '3px solid #E74C3C',
                  borderRadius: '16px',
                  pointerEvents: 'none',
                  boxShadow: '0 0 0 4000px rgba(0,0,0,0.4)',
                }} />
                <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px', color: '#9B9BB4', fontWeight: '500' }}>
                  Pointez la caméra vers le QR code du client
                </p>
              </div>
            )}

            {/* Séparateur */}
            {scannerActif && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ flex: 1, height: '1px', background: '#EAEAF0' }} />
                <span style={{ fontSize: '12px', color: '#9B9BB4', fontWeight: '600' }}>OU</span>
                <div style={{ flex: 1, height: '1px', background: '#EAEAF0' }} />
              </div>
            )}

            {/* Code manuel */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#9B9BB4', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '8px' }}>
                Code client (8 caractères)
              </label>
              <input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="Ex: AB3C5DEF"
                maxLength={8}
                style={{
                  width: '100%', padding: '14px 18px',
                  borderRadius: '12px', border: '1.5px solid #EAEAF0',
                  fontSize: '22px', fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '6px', color: '#1A1A2E', outline: 'none',
                  transition: 'border 0.2s',
                  textAlign: 'center',
                }}
                onFocus={e => e.target.style.border = '1.5px solid #C0392B'}
                onBlur={e => e.target.style.border = '1.5px solid #EAEAF0'}
              />
            </div>

            {/* Montant */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#9B9BB4', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '8px' }}>
                Montant du repas (€)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={montant}
                  onChange={e => setMontant(e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: '100%', padding: '14px 18px 14px 44px',
                    borderRadius: '12px', border: '1.5px solid #EAEAF0',
                    fontSize: '20px', fontWeight: '700', color: '#1A1A2E',
                    outline: 'none', transition: 'border 0.2s',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                  onFocus={e => e.target.style.border = '1.5px solid #C0392B'}
                  onBlur={e => e.target.style.border = '1.5px solid #EAEAF0'}
                />
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#9B9BB4', fontWeight: '700' }}>€</span>
                {montant && (
                  <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#27AE60', fontWeight: '700' }}>
                    +{Math.round(parseFloat(montant) * 10)} pts
                  </span>
                )}
              </div>
            </div>

            {/* Bouton créditer */}
            <button onClick={crediter} disabled={loading || !code || !montant} style={{
              width: '100%',
              background: (!code || !montant) ? '#F0F0F8' : 'linear-gradient(135deg, #C0392B, #E74C3C)',
              color: (!code || !montant) ? '#9B9BB4' : 'white',
              border: 'none', borderRadius: '14px',
              padding: '16px', fontSize: '16px', fontWeight: '800',
              boxShadow: (!code || !montant) ? 'none' : '0 8px 24px rgba(192,57,43,0.35)',
              transition: 'all 0.3s ease',
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '-0.3px',
            }}
            onMouseEnter={e => { if (code && montant && !loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              {loading ? '⏳ Traitement...' : '✅ Valider et créditer les points'}
            </button>
          </div>
        </div>

        {/* Résultat client */}
        {client && (
          <div style={{
            background: 'white', borderRadius: '20px',
            border: client.recompense_disponible ? '2px solid #27AE60' : '1px solid #EAEAF0',
            boxShadow: client.recompense_disponible ? '0 8px 32px rgba(39,174,96,0.15)' : '0 1px 3px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            animation: 'fadeUp 0.4s ease',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F0F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '900', fontSize: '20px', color: '#1A1A2E' }}>
                  {client.recompense_disponible ? '🎉' : '✅'} {client.prenom}
                </div>
                <div style={{ fontSize: '13px', color: '#9B9BB4', marginTop: '2px' }}>
                  Points crédités avec succès
                </div>
              </div>
              <button onClick={reset} style={{
                background: '#F8F9FA', border: '1px solid #EAEAF0',
                color: '#9B9BB4', padding: '8px 14px', borderRadius: '8px',
                fontSize: '12px', fontWeight: '600', fontFamily: 'Outfit, sans-serif',
              }}>
                Nouveau client
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Stats points */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: 'Points gagnés', value: `+${client.points_gagnes}`, couleur: '#EAFAF1', texte: '#27AE60' },
                  { label: 'Total points', value: client.points_total, couleur: '#FEF9E7', texte: '#F39C12' },
                  { label: 'Il manque', value: client.recompense_disponible ? '0' : client.points_manquants, couleur: '#FDEDEC', texte: '#C0392B' },
                ].map((s, i) => (
                  <div key={i} style={{ background: s.couleur, borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '26px', fontWeight: '900', color: s.texte, letterSpacing: '-0.5px' }}>{s.value}</div>
                    <div style={{ fontSize: '11px', color: '#9B9BB4', fontWeight: '600', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Barre de progression */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9B9BB4', marginBottom: '8px' }}>
                  <span>Progression</span>
                  <span>{Math.min(100, Math.round((client.points_total / 500) * 100))}%</span>
                </div>
                <div style={{ height: '8px', background: '#F0F0F8', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round((client.points_total / 500) * 100))}%`,
                    background: 'linear-gradient(90deg, #C0392B, #E74C3C)',
                    borderRadius: '99px',
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>

              {/* Bouton récompense */}
              {client.recompense_disponible ? (
                <button onClick={utiliserRecompense} disabled={loading} style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #27AE60, #2ECC71)',
                  color: 'white', border: 'none', borderRadius: '14px',
                  padding: '16px', fontSize: '16px', fontWeight: '800',
                  boxShadow: '0 8px 24px rgba(39,174,96,0.35)',
                  fontFamily: 'Outfit, sans-serif',
                  animation: 'pulse 2s ease infinite',
                }}>
                  🎁 Utiliser la récompense — {client.description_recompense}
                </button>
              ) : (
                <div style={{ textAlign: 'center', padding: '14px', background: '#F8F9FA', borderRadius: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#9B9BB4', fontWeight: '600' }}>
                    Encore <strong style={{ color: '#C0392B' }}>{client.points_manquants} pts</strong> pour obtenir {client.description_recompense}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
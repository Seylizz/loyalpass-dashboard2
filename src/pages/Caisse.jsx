import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';
import { Html5Qrcode } from 'html5-qrcode';

const C = { bg: '#FCFBF8', text: '#2A1610', primary: '#B5281C', amber: '#D97706', border: '#E8E1D5', gray: '#9B8E84' };

export default function Caisse() {
  const [code, setCode] = useState('');
  const [montant, setMontant] = useState('');
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scannerActif, setScannerActif] = useState(false);
  const html5QrRef = useRef(null);
  const restaurant = JSON.parse(localStorage.getItem('restaurant') || '{}');
  const ptsParEuro = restaurant.pts_par_euro || 10;

  useEffect(() => { return () => { if (html5QrRef.current) html5QrRef.current.stop().catch(() => {}); }; }, []);

  const demarrerScanner = async () => {
    setScannerActif(true);
    setTimeout(async () => {
      try {
        html5QrRef.current = new Html5Qrcode('qr-reader');
        await html5QrRef.current.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 200, height: 200 } },
          (text) => { setCode(text); arreterScanner(); toast.success('QR Code scanné !'); }, () => {});
      } catch { toast.error("Impossible d'accéder à la caméra"); setScannerActif(false); }
    }, 300);
  };

  const arreterScanner = async () => {
    if (html5QrRef.current) { await html5QrRef.current.stop().catch(() => {}); html5QrRef.current = null; }
    setScannerActif(false);
  };

  const crediter = async () => {
    if (!code || !montant) { toast.error('Entre le code client et le montant'); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/points/crediter', { code_client: code, montant_euro: parseFloat(montant) });
      setClient(data.client);
      toast.success(data.message);
      setCode(''); setMontant('');
    } catch (err) { toast.error(err.response?.data?.message || 'Client introuvable'); }
    setLoading(false);
  };

  const utiliserRecompense = async () => {
    setLoading(true);
    try {
      const { data } = await API.post('/points/utiliser', { code_client: code || client?.code_unique });
      toast.success(`Récompense accordée : ${data.recompense}`);
      setClient(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    setLoading(false);
  };

  const ptsGagnes = montant ? Math.round(parseFloat(montant) * ptsParEuro) : 0;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Lato, sans-serif' }}>
      <Toaster position="top-right" />
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #2A1610 0%, #3D1F17 60%, #2A1610 100%)', padding: '36px 32px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(181,40,28,0.15)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(217,119,6,0.1)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Terminal de caisse</div>
          <h1 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.8px', marginBottom: 6 }}>Scanner un client</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>Scannez le QR code ou entrez le code manuellement</p>
        </div>
      </div>

      <div className="page-content" style={{ maxWidth: 680, margin: '-44px auto 0', padding: '0 32px 48px', position: 'relative', zIndex: 10 }}>

        <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 20, boxShadow: '0 15px 40px -15px rgba(181,40,28,0.1)' }}>
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 900, fontSize: 15, color: C.text }}>Scanner le QR code</div>
            <button onClick={scannerActif ? arreterScanner : demarrerScanner} style={{ background: scannerActif ? 'rgba(181,40,28,0.08)' : C.primary, color: scannerActif ? C.primary : '#fff', border: scannerActif ? `1px solid rgba(181,40,28,0.25)` : 'none', padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato, sans-serif', boxShadow: scannerActif ? 'none' : '0 4px 12px rgba(181,40,28,0.3)' }}>
              {scannerActif ? '✕ Arrêter' : 'Ouvrir caméra'}
            </button>
          </div>
          <div style={{ padding: 22 }}>
            {scannerActif && (
              <div style={{ marginBottom: 20, borderRadius: 14, overflow: 'hidden' }}>
                <div id="qr-reader" style={{ width: '100%', borderRadius: 14, overflow: 'hidden' }} />
                <p style={{ textAlign: 'center', marginTop: 10, fontSize: 13, color: C.gray, fontWeight: 600 }}>Pointez la caméra vers le QR code du client</p>
              </div>
            )}
            {scannerActif && <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}><div style={{ flex: 1, height: 1, background: C.border }}/><span style={{ fontSize: 12, color: C.gray, fontWeight: 700 }}>OU</span><div style={{ flex: 1, height: 1, background: C.border }}/></div>}

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', marginBottom: 8 }}>Code client</label>
              <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Ex: AB3C5DEF" maxLength={8}
                style={{ width: '100%', padding: '13px 18px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 22, fontFamily: 'monospace', letterSpacing: 6, color: C.text, outline: 'none', textAlign: 'center', background: '#FAFAF8' }}
                onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = C.border}/>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', marginBottom: 8 }}>Montant du repas (€)</label>
              <div style={{ position: 'relative' }}>
                <input type="number" value={montant} onChange={e => setMontant(e.target.value)} placeholder="0.00"
                  style={{ width: '100%', padding: '13px 18px 13px 42px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 20, fontWeight: 700, color: C.text, outline: 'none', background: '#FAFAF8', fontFamily: 'Lato, sans-serif' }}
                  onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = C.border}/>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 17, color: C.gray, fontWeight: 700 }}>€</span>
                {ptsGagnes > 0 && <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#059669', fontWeight: 700, background: 'rgba(5,150,105,0.08)', padding: '3px 8px', borderRadius: 6 }}>+{ptsGagnes} pts</span>}
              </div>
            </div>

            <button onClick={crediter} disabled={loading || !code || !montant} style={{ width: '100%', background: (!code||!montant) ? '#F3F0EA' : C.primary, color: (!code||!montant) ? C.gray : '#fff', border: 'none', borderRadius: 14, padding: '15px', fontSize: 15, fontWeight: 900, boxShadow: (!code||!montant) ? 'none' : '0 8px 20px -6px rgba(181,40,28,0.5)', transition: 'all 0.3s', fontFamily: 'Lato, sans-serif', cursor: (!code||!montant) ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Traitement...' : 'Valider et créditer les points'}
            </button>
          </div>
        </div>

        {client && (
          <div style={{ background: '#fff', borderRadius: 20, border: client.recompense_disponible ? `2px solid #059669` : `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 15px 40px -15px rgba(181,40,28,0.1)', animation: 'fadeUp 0.4s ease' }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18, color: C.text }}>{client.prenom}</div>
                <div style={{ fontSize: 13, color: C.gray, marginTop: 2 }}>Points crédités avec succès</div>
              </div>
              <button onClick={() => { setClient(null); setCode(''); setMontant(''); }} style={{ background: '#F3F0EA', border: `1px solid ${C.border}`, color: C.text, padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato, sans-serif' }}>Nouveau client</button>
            </div>
            <div style={{ padding: 22 }}>
              <div className="actions-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Points gagnés', value: `+${client.points_gagnes}`, bg: 'rgba(5,150,105,0.07)', color: '#059669' },
                  { label: 'Total points', value: client.points_total, bg: 'rgba(217,119,6,0.07)', color: C.amber },
                  { label: 'Il manque', value: client.recompense_disponible ? '0' : client.points_manquants, bg: 'rgba(181,40,28,0.07)', color: C.primary },
                ].map((s, i) => (
                  <div key={i} style={{ background: s.bg, borderRadius: 14, padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: s.color, letterSpacing: '-0.5px' }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: C.gray, fontWeight: 700, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ height: 8, background: '#F3F0EA', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, Math.round((client.points_total/500)*100))}%`, background: `linear-gradient(90deg, ${C.primary}, ${C.amber})`, borderRadius: 99, transition: 'width 1s ease' }} />
                </div>
              </div>
              {client.recompense_disponible ? (
                <button onClick={utiliserRecompense} disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg,#059669,#10B981)', color: '#fff', border: 'none', borderRadius: 14, padding: '15px', fontSize: 15, fontWeight: 900, boxShadow: '0 8px 24px rgba(5,150,105,0.3)', fontFamily: 'Lato, sans-serif', cursor: 'pointer' }}>
                  Utiliser la récompense — {client.description_recompense}
                </button>
              ) : (
                <div style={{ textAlign: 'center', padding: 14, background: '#F3F0EA', borderRadius: 12 }}>
                  <span style={{ fontSize: 14, color: C.gray, fontWeight: 700 }}>Encore <strong style={{ color: C.primary }}>{client.points_manquants} pts</strong> pour {client.description_recompense}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
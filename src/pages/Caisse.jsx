import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';
import { Html5Qrcode } from 'html5-qrcode';

const C = { bg: '#FCFBF8', text: '#2A1610', primary: '#B5281C', amber: '#D97706', border: '#E8E1D5', gray: '#9B8E84' };

export default function Caisse() {
  const [etape, setEtape] = useState('scan'); // 'scan' | 'client' | 'succes'
  const [montant, setMontant] = useState('');
  const [client, setClient] = useState(null);
  const [resultat, setResultat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scannerActif, setScannerActif] = useState(false);
  const html5QrRef = useRef(null);
  const montantRef = useRef(null);
  const restaurant = JSON.parse(localStorage.getItem('restaurant') || '{}');
  const ptsParEuro = restaurant.pts_par_euro || 10;

  useEffect(() => {
    return () => { if (html5QrRef.current) html5QrRef.current.stop().catch(() => {}); };
  }, []);

  // Focus automatique sur le montant quand le client est affiché
  useEffect(() => {
    if (etape === 'client' && montantRef.current) {
      setTimeout(() => montantRef.current?.focus(), 300);
    }
  }, [etape]);

  const demarrerScanner = async () => {
    setScannerActif(true);
    setTimeout(async () => {
      try {
        html5QrRef.current = new Html5Qrcode('qr-reader');
        await html5QrRef.current.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          async (code) => {
            await arreterScanner();
            await chargerClient(code);
          },
          () => {}
        );
      } catch {
        toast.error("Impossible d'accéder à la caméra");
        setScannerActif(false);
      }
    }, 300);
  };

  const arreterScanner = async () => {
    if (html5QrRef.current) {
      await html5QrRef.current.stop().catch(() => {});
      html5QrRef.current = null;
    }
    setScannerActif(false);
  };

  const chargerClient = async (code) => {
    setLoading(true);
    try {
      const { data } = await API.get(`/points/client/${code.toUpperCase()}`);
      setClient(data.client);
      setEtape('client');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Client introuvable');
    }
    setLoading(false);
  };

  const crediter = async () => {
    if (!montant || parseFloat(montant) <= 0) { toast.error('Entre le montant de la commande'); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/points/crediter', {
        code_client: client.code_unique,
        montant_euro: parseFloat(montant)
      });
      setResultat(data.client);
      setClient(data.client);
      setEtape('succes');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
    setLoading(false);
  };

  const utiliserRecompense = async () => {
    setLoading(true);
    try {
      const { data } = await API.post('/points/utiliser', { code_client: client.code_unique });
      toast.success(`Récompense accordée : ${data.recompense}`);
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
    setLoading(false);
  };

  const reset = () => {
    setEtape('scan');
    setClient(null);
    setResultat(null);
    setMontant('');
  };

  const ptsGagnes = montant ? Math.round(parseFloat(montant) * ptsParEuro) : 0;
  const progression = client ? Math.min(100, Math.round((client.points / client.seuil_recompense) * 100)) : 0;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Lato, sans-serif' }}>
      <Toaster position="top-center" toastOptions={{ style: { fontFamily: 'Lato, sans-serif', fontWeight: 700 } }} />
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #2A1610 0%, #3D1F17 60%, #2A1610 100%)', padding: '36px 32px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(181,40,28,0.15)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(217,119,6,0.1)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Terminal de caisse</div>
          <h1 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.8px', marginBottom: 6 }}>
            {etape === 'scan' && 'Scanner le client'}
            {etape === 'client' && `Bonjour, ${client?.prenom} !`}
            {etape === 'succes' && 'Points crédités !'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
            {etape === 'scan' && 'Scannez le QR code de la carte fidélité du client'}
            {etape === 'client' && 'Entrez le montant de la commande pour créditer les points'}
            {etape === 'succes' && 'La transaction a été enregistrée avec succès'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: '-44px auto 0', padding: '0 20px 48px', position: 'relative', zIndex: 10 }}>

        {/* ÉTAPE 1 — SCAN */}
        {etape === 'scan' && (
          <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 15px 40px -15px rgba(181,40,28,0.1)' }}>
            <div style={{ padding: '22px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 900, fontSize: 15, color: C.text }}>QR Code client</div>
              <button onClick={scannerActif ? arreterScanner : demarrerScanner}
                style={{ background: scannerActif ? 'rgba(181,40,28,0.08)' : C.primary, color: scannerActif ? C.primary : '#fff', border: scannerActif ? `1px solid rgba(181,40,28,0.25)` : 'none', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato, sans-serif', boxShadow: scannerActif ? 'none' : '0 4px 12px rgba(181,40,28,0.3)' }}>
                {scannerActif ? '✕ Arrêter' : '▶ Ouvrir la caméra'}
              </button>
            </div>

            <div style={{ padding: 24 }}>
              {scannerActif ? (
                <>
                  <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
                    <div id="qr-reader" style={{ width: '100%' }} />
                  </div>
                  <p style={{ textAlign: 'center', fontSize: 13, color: C.gray, fontWeight: 600 }}>Pointez vers le QR code de la carte du client</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                    <span style={{ fontSize: 12, color: C.gray, fontWeight: 700 }}>ou entrez le code manuellement</span>
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0 20px' }}>
                  <div style={{ width: 72, height: 72, borderRadius: 18, background: 'rgba(181,40,28,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg width="32" height="32" fill="none" stroke={C.primary} strokeWidth="1.8" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
                      <path d="M14 14h2v2h-2zM18 14h3M14 18h1M18 18h3M14 21h3M20 18v3"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: 14, color: C.gray, fontWeight: 600, marginBottom: 20 }}>Appuyez sur "Ouvrir la caméra" pour scanner</p>
                </div>
              )}

              {/* Saisie manuelle */}
              <input
                placeholder="Code manuel (ex: AB3C5DEF)"
                maxLength={8}
                onChange={e => { if (e.target.value.length === 8) chargerClient(e.target.value); }}
                style={{ width: '100%', padding: '13px 18px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 18, fontFamily: 'monospace', letterSpacing: 5, color: C.text, outline: 'none', textAlign: 'center', background: '#FAFAF8', textTransform: 'uppercase' }}
                onFocus={e => e.target.style.borderColor = C.primary}
                onBlur={e => e.target.style.borderColor = C.border}
              />
              {loading && <p style={{ textAlign: 'center', marginTop: 12, color: C.gray, fontSize: 13, fontWeight: 700 }}>Recherche du client...</p>}
            </div>
          </div>
        )}

        {/* ÉTAPE 2 — CLIENT TROUVÉ */}
        {etape === 'client' && client && (
          <>
            {/* Carte client */}
            <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 15px 40px -15px rgba(181,40,28,0.1)', marginBottom: 16 }}>
              <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18, color: C.text }}>{client.prenom}</div>
                  <div style={{ fontSize: 12, color: C.gray, fontFamily: 'monospace', letterSpacing: 2, marginTop: 2 }}>{client.code_unique}</div>
                </div>
                <button onClick={reset} style={{ background: '#F3F0EA', border: `1px solid ${C.border}`, color: C.text, padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato, sans-serif' }}>
                  ← Autre client
                </button>
              </div>
              <div style={{ padding: '18px 22px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div style={{ background: 'rgba(217,119,6,0.07)', borderRadius: 14, padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: C.amber }}>{client.points}</div>
                    <div style={{ fontSize: 11, color: C.gray, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>Points actuels</div>
                  </div>
                  <div style={{ background: 'rgba(181,40,28,0.07)', borderRadius: 14, padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: C.primary }}>{client.points_manquants}</div>
                    <div style={{ fontSize: 11, color: C.gray, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>Il manque</div>
                  </div>
                </div>
                {/* Barre de progression */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: C.gray, fontWeight: 700 }}>Progression</span>
                    <span style={{ fontSize: 12, color: C.primary, fontWeight: 900 }}>{progression}%</span>
                  </div>
                  <div style={{ height: 8, background: '#F3F0EA', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progression}%`, background: `linear-gradient(90deg, ${C.primary}, ${C.amber})`, borderRadius: 99, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
                <div style={{ fontSize: 13, color: C.gray, fontWeight: 600, textAlign: 'center' }}>
                  {client.recompense_disponible
                    ? <span style={{ color: '#059669', fontWeight: 900 }}>Récompense disponible : {client.description_recompense}</span>
                    : `Encore ${client.points_manquants} pts pour : ${client.description_recompense}`
                  }
                </div>
              </div>
            </div>

            {/* Montant + validation */}
            <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, padding: 22, boxShadow: '0 15px 40px -15px rgba(181,40,28,0.1)', marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', marginBottom: 10 }}>Montant de la commande (€)</label>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <input
                  ref={montantRef}
                  type="number"
                  value={montant}
                  onChange={e => setMontant(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') crediter(); }}
                  placeholder="0.00"
                  style={{ width: '100%', padding: '16px 18px 16px 44px', borderRadius: 14, border: `1.5px solid ${C.border}`, fontSize: 26, fontWeight: 900, color: C.text, outline: 'none', background: '#FAFAF8', fontFamily: 'Lato, sans-serif' }}
                  onFocus={e => e.target.style.borderColor = C.primary}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: C.gray, fontWeight: 700 }}>€</span>
                {ptsGagnes > 0 && (
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#059669', fontWeight: 900, background: 'rgba(5,150,105,0.1)', padding: '4px 10px', borderRadius: 8 }}>
                    +{ptsGagnes} pts
                  </span>
                )}
              </div>
              <button onClick={crediter} disabled={loading || !montant}
                style={{ width: '100%', background: !montant ? '#F3F0EA' : C.primary, color: !montant ? C.gray : '#fff', border: 'none', borderRadius: 14, padding: '16px', fontSize: 16, fontWeight: 900, boxShadow: !montant ? 'none' : '0 8px 20px -6px rgba(181,40,28,0.5)', fontFamily: 'Lato, sans-serif', cursor: !montant ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                {loading ? 'Traitement...' : `Valider — créditer ${ptsGagnes > 0 ? `+${ptsGagnes} pts` : 'les points'}`}
              </button>
            </div>

            {/* Bouton récompense si dispo */}
            {client.recompense_disponible && (
              <button onClick={utiliserRecompense} disabled={loading}
                style={{ width: '100%', background: 'linear-gradient(135deg,#059669,#10B981)', color: '#fff', border: 'none', borderRadius: 14, padding: '16px', fontSize: 15, fontWeight: 900, boxShadow: '0 8px 24px rgba(5,150,105,0.3)', fontFamily: 'Lato, sans-serif', cursor: 'pointer' }}>
                Utiliser la récompense — {client.description_recompense}
              </button>
            )}
          </>
        )}

        {/* ÉTAPE 3 — SUCCÈS */}
        {etape === 'succes' && resultat && (
          <div style={{ background: '#fff', borderRadius: 20, border: `2px solid #059669`, overflow: 'hidden', boxShadow: '0 15px 40px -15px rgba(5,150,105,0.2)', textAlign: 'center' }}>
            <div style={{ padding: '36px 28px 28px' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#ECFDF5', border: '2px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="32" height="32" fill="none" stroke="#059669" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 6 }}>{resultat.prenom}</div>
              <div style={{ fontSize: 15, color: C.gray, marginBottom: 28 }}>Points crédités avec succès</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
                {[
                  { label: 'Gagnés', value: `+${resultat.points_gagnes}`, color: '#059669', bg: 'rgba(5,150,105,0.07)' },
                  { label: 'Total', value: resultat.points_total, color: C.amber, bg: 'rgba(217,119,6,0.07)' },
                  { label: 'Il manque', value: resultat.recompense_disponible ? '—' : resultat.points_manquants, color: C.primary, bg: 'rgba(181,40,28,0.07)' },
                ].map((s, i) => (
                  <div key={i} style={{ background: s.bg, borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: C.gray, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {resultat.recompense_disponible ? (
                <button onClick={utiliserRecompense} disabled={loading}
                  style={{ width: '100%', background: 'linear-gradient(135deg,#059669,#10B981)', color: '#fff', border: 'none', borderRadius: 14, padding: '15px', fontSize: 15, fontWeight: 900, boxShadow: '0 8px 24px rgba(5,150,105,0.3)', fontFamily: 'Lato, sans-serif', cursor: 'pointer', marginBottom: 12 }}>
                  Utiliser la récompense — {resultat.description_recompense}
                </button>
              ) : (
                <div style={{ padding: '14px', background: '#F3F0EA', borderRadius: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 14, color: C.gray, fontWeight: 700 }}>
                    Encore <strong style={{ color: C.primary }}>{resultat.points_manquants} pts</strong> pour : {resultat.description_recompense}
                  </span>
                </div>
              )}

              <button onClick={reset}
                style={{ width: '100%', background: '#F3F0EA', color: C.text, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 900, fontFamily: 'Lato, sans-serif', cursor: 'pointer' }}>
                Client suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
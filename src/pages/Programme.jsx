import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';

const C = { bg: '#FCFBF8', text: '#2A1610', primary: '#B5281C', amber: '#D97706', border: '#E8E1D5', gray: '#9B8E84' };

const RECOMPENSES_EXEMPLES = [
  { label: 'Boisson offerte', seuil: 200, desc: 'Une boisson au choix offerte' },
  { label: 'Frites offertes', seuil: 300, desc: 'Une portion de frites offerte' },
  { label: 'Dessert offert', seuil: 400, desc: 'Un dessert au choix offert' },
  { label: 'Réduction 10%', seuil: 500, desc: '10% de réduction sur la commande' },
  { label: 'Menu offert', seuil: 800, desc: 'Un menu complet offert' },
  { label: 'Repas offert', seuil: 1000, desc: 'Un repas complet offert' },
];

const genererConseils = (form, stats) => {
  const conseils = [];
  const triees = [...form.recompenses_selectionnees].sort((a, b) => a.seuil - b.seuil);
  const ptsParEuro = form.pts_par_euro;
  const totalClients = stats?.total_clients || 0;

  if (triees.length > 0) {
    const eurosNecessaires = Math.round(triees[0].seuil / ptsParEuro);
    if (eurosNecessaires > 80) {
      conseils.push({ type: 'warning', titre: 'Première récompense trop lointaine', texte: `Avec ${ptsParEuro} pts/€, vos clients doivent dépenser ${eurosNecessaires}€ pour leur première récompense. Envisagez un palier sous 50€.` });
    } else if (eurosNecessaires < 15) {
      conseils.push({ type: 'success', titre: 'Première récompense très accessible', texte: `Votre premier palier est atteint dès ${eurosNecessaires}€. Très motivant pour les nouveaux clients !` });
    } else {
      conseils.push({ type: 'success', titre: 'Bon équilibre du premier palier', texte: `Votre première récompense est atteinte après ~${eurosNecessaires}€. C'est un bon équilibre.` });
    }
  }
  if (triees.length === 1) {
    conseils.push({ type: 'warning', titre: 'Ajoutez plusieurs paliers', texte: "Avec un seul palier, vos clients n'ont plus de motivation après la première récompense. Ajoutez 2-3 paliers progressifs." });
  } else if (triees.length >= 3) {
    conseils.push({ type: 'success', titre: 'Programme bien structuré', texte: `${triees.length} paliers créent une progression motivante.` });
  }
  if (ptsParEuro < 5) {
    conseils.push({ type: 'warning', titre: 'Taux de points faible', texte: 'Moins de 5 pts/€ peut sembler peu généreux pour vos clients.' });
  } else if (ptsParEuro > 30) {
    conseils.push({ type: 'info', titre: 'Taux de points élevé', texte: 'Assurez-vous que vos récompenses restent rentables pour votre restaurant.' });
  }
  if (totalClients > 10 && triees.length > 0) {
    const seuilMoyen = triees.reduce((s, r) => s + r.seuil, 0) / triees.length;
    const visitesNecessaires = Math.round(seuilMoyen / (ptsParEuro * 20));
    conseils.push({ type: 'info', titre: 'Estimation de fidélisation', texte: `En moyenne, vos clients atteignent une récompense après ~${visitesNecessaires} visites à 20€/visite.` });
  }
  return conseils.slice(0, 3);
};

const IconCheck = ({ color = '#059669' }) => <svg width="13" height="13" fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>;
const IconWarn = () => <svg width="13" height="13" fill="none" stroke="#D97706" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>;
const IconInfo = () => <svg width="13" height="13" fill="none" stroke="#2980B9" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;

export default function Programme() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ pts_par_euro: 10, recompenses_selectionnees: [], recompenses_custom: [], nouveauCustom: { seuil: '', desc: '' }, erreurCustom: '' });

  useEffect(() => { chargerDonnees(); }, []);

  const chargerDonnees = async () => {
    try {
      const [profilRes, statsRes] = await Promise.all([API.get('/restaurants/profil'), API.get('/restaurants/stats').catch(() => ({ data: { stats: null } }))]);
      const r = profilRes.data.restaurant;
      setStats(statsRes.data.stats);
      let recompenses = [];
      try {
        recompenses = JSON.parse(r.description_recompense || '[]');
        if (!Array.isArray(recompenses)) recompenses = [];
      } catch { if (r.description_recompense) recompenses = [{ label: r.description_recompense, seuil: r.seuil_recompense || 500, desc: r.description_recompense }]; }
      const labels = RECOMPENSES_EXEMPLES.map(r => r.label);
      const custom = recompenses.filter(r => !labels.includes(r.label));
      setForm(f => ({ ...f, pts_par_euro: r.pts_par_euro || 10, recompenses_selectionnees: recompenses, recompenses_custom: custom }));
    } catch { toast.error('Erreur chargement du programme'); }
    setLoading(false);
  };

  const toggleRecompense = (r) => {
    const existe = form.recompenses_selectionnees.find(x => x.label === r.label);
    setForm({ ...form, recompenses_selectionnees: existe ? form.recompenses_selectionnees.filter(x => x.label !== r.label) : [...form.recompenses_selectionnees, r] });
  };

  const ajouterCustom = () => {
    const seuil = parseInt(form.nouveauCustom.seuil);
    if (!form.nouveauCustom.seuil || !form.nouveauCustom.desc) { setForm({ ...form, erreurCustom: 'Remplissez le nombre de points et la description.' }); return; }
    if (isNaN(seuil) || seuil <= 0) { setForm({ ...form, erreurCustom: 'Le nombre de points doit être un nombre positif.' }); return; }
    const nouvelle = { label: form.nouveauCustom.desc, seuil, desc: form.nouveauCustom.desc };
    setForm({ ...form, recompenses_custom: [...form.recompenses_custom, nouvelle], recompenses_selectionnees: [...form.recompenses_selectionnees, nouvelle], nouveauCustom: { seuil: '', desc: '' }, erreurCustom: '' });
  };

  const supprimerCustom = (index) => {
    const custom = form.recompenses_custom[index];
    setForm({ ...form, recompenses_custom: form.recompenses_custom.filter((_, i) => i !== index), recompenses_selectionnees: form.recompenses_selectionnees.filter(x => x.label !== custom.label) });
  };

  const handleSave = async () => {
    if (form.recompenses_selectionnees.length === 0) { toast.error('Sélectionnez au moins une récompense'); return; }
    setSaving(true);
    try {
      const restaurantLocal = JSON.parse(localStorage.getItem('restaurant') || '{}');
      const triees = [...form.recompenses_selectionnees].sort((a, b) => a.seuil - b.seuil);
      await API.post('/auth/onboarding', { couleur: restaurantLocal.couleur || C.primary, logo_emoji: restaurantLocal.logo_emoji || '🥙', pts_par_euro: form.pts_par_euro, seuil_recompense: triees[0].seuil, description_recompense: JSON.stringify(triees) });
      const updated = { ...restaurantLocal, pts_par_euro: form.pts_par_euro };
      localStorage.setItem('restaurant', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      toast.success('Programme mis à jour !');
    } catch { toast.error('Erreur lors de la sauvegarde'); }
    setSaving(false);
  };

  const toutesRecompenses = [...form.recompenses_selectionnees].sort((a, b) => a.seuil - b.seuil);
  const conseils = genererConseils(form, stats);
  const conseilStyles = {
    success: { bg: 'rgba(5,150,105,0.06)', border: 'rgba(5,150,105,0.2)', icon: <IconCheck/>, titleColor: '#065F46' },
    warning: { bg: 'rgba(217,119,6,0.06)', border: 'rgba(217,119,6,0.25)', icon: <IconWarn/>, titleColor: '#92400E' },
    info: { bg: 'rgba(41,128,185,0.06)', border: 'rgba(41,128,185,0.2)', icon: <IconInfo/>, titleColor: '#1E3A5F' },
  };

  if (loading) return <div style={{ minHeight: '100vh', background: C.bg }}><Navbar /><div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: C.gray, fontSize: 14, fontFamily: 'Lato, sans-serif' }}>Chargement...</div></div>;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Lato, sans-serif' }}>
      <Toaster position="top-right" />
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #2A1610 0%, #3D1F17 60%, #2A1610 100%)', padding: '36px 32px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(181,40,28,0.15)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(217,119,6,0.1)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Configuration</div>
          <h1 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.8px', marginBottom: 6 }}>Mon programme de fidélité</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>Modifiez les paramètres de votre programme à tout moment</p>
        </div>
      </div>

      <div className="page-content" style={{ maxWidth: 1000, margin: '-44px auto 0', padding: '0 32px 48px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Colonne gauche */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Conseils */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 26, border: `1px solid ${C.border}`, boxShadow: '0 15px 40px -15px rgba(181,40,28,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(217,119,6,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💡</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.text }}>Conseils personnalisés</div>
              </div>
              {conseils.length === 0 ? (
                <div style={{ fontSize: 13, color: C.gray, textAlign: 'center', padding: '16px 0' }}>Configurez votre programme pour voir des conseils</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {conseils.map((c, i) => {
                    const s = conseilStyles[c.type];
                    return (
                      <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>{s.icon}<span style={{ fontSize: 12, fontWeight: 900, color: s.titleColor }}>{c.titre}</span></div>
                        <p style={{ fontSize: 12, color: C.text, lineHeight: 1.6, margin: 0, opacity: 0.75 }}>{c.texte}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Points */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 26, border: `1px solid ${C.border}`, boxShadow: '0 15px 40px -15px rgba(181,40,28,0.08)' }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: C.text, marginBottom: 18 }}>Règle des points</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F3F0EA', borderRadius: 12, padding: '14px 16px' }}>
                <span style={{ fontSize: 14, color: C.text, fontWeight: 700 }}>1€ dépensé =</span>
                <input type="number" min="1" max="100" value={form.pts_par_euro} onChange={e => setForm({ ...form, pts_par_euro: parseInt(e.target.value) || 1 })}
                  style={{ width: 64, padding: '8px 10px', borderRadius: 8, border: `2px solid ${C.border}`, fontSize: 18, fontWeight: 900, color: C.primary, textAlign: 'center', outline: 'none', fontFamily: 'Lato, sans-serif' }}
                  onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = C.border}/>
                <span style={{ fontSize: 14, color: C.text, fontWeight: 700 }}>points</span>
              </div>
              <p style={{ fontSize: 13, color: C.gray, marginTop: 8 }}>20€ dépensés = <strong style={{ color: C.primary }}>{form.pts_par_euro * 20} points</strong></p>
            </div>
          </div>

          {/* Colonne droite */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 26, border: `1px solid ${C.border}`, boxShadow: '0 15px 40px -15px rgba(181,40,28,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: C.text }}>Récompenses</div>
              {form.recompenses_selectionnees.length > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, color: C.primary, background: 'rgba(181,40,28,0.08)', padding: '3px 10px', borderRadius: 100 }}>
                  {form.recompenses_selectionnees.length} active{form.recompenses_selectionnees.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {RECOMPENSES_EXEMPLES.map((r, i) => {
                const sel = form.recompenses_selectionnees.find(x => x.label === r.label);
                return (
                  <button key={i} onClick={() => toggleRecompense(r)} style={{ padding: '10px 12px', borderRadius: 10, textAlign: 'left', border: sel ? `2px solid ${C.primary}` : `2px solid ${C.border}`, background: sel ? 'rgba(181,40,28,0.05)' : '#F3F0EA', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}>
                    {sel && <div style={{ position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconCheck color="white"/></div>}
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: C.primary, fontWeight: 700, marginTop: 2 }}>{r.seuil} pts</div>
                  </button>
                );
              })}
            </div>

            {form.recompenses_custom.length > 0 && (
              <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {form.recompenses_custom.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(181,40,28,0.05)', border: `2px solid ${C.primary}`, borderRadius: 10, padding: '8px 12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: C.primary, fontWeight: 700 }}>{r.seuil} pts</div>
                    </div>
                    <button onClick={() => supprimerCustom(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray, fontSize: 18, padding: 2, lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ border: `2px dashed ${C.border}`, borderRadius: 10, padding: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.gray, marginBottom: 8 }}>+ Récompense personnalisée</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="number" placeholder="Points" min="1" value={form.nouveauCustom.seuil}
                  onChange={e => setForm({ ...form, nouveauCustom: { ...form.nouveauCustom, seuil: e.target.value }, erreurCustom: '' })}
                  style={{ width: 78, padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: 'Lato, sans-serif', outline: 'none', color: C.text }}
                  onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = C.border}/>
                <input type="text" placeholder="Ex: Café offert" value={form.nouveauCustom.desc}
                  onChange={e => setForm({ ...form, nouveauCustom: { ...form.nouveauCustom, desc: e.target.value }, erreurCustom: '' })}
                  style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: 'Lato, sans-serif', outline: 'none', color: C.text }}
                  onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = C.border}/>
                <button onClick={ajouterCustom} style={{ padding: '8px 14px', borderRadius: 8, background: C.primary, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'Lato, sans-serif', boxShadow: '0 4px 10px rgba(181,40,28,0.3)' }}>+</button>
              </div>
              {form.erreurCustom && <p style={{ fontSize: 12, color: C.primary, marginTop: 6, fontWeight: 700 }}>⚠️ {form.erreurCustom}</p>}
            </div>

            {form.recompenses_selectionnees.length === 0 && <p style={{ fontSize: 12, color: C.primary, fontWeight: 700, marginBottom: 10 }}>⚠️ Sélectionnez au moins une récompense.</p>}

            {toutesRecompenses.length > 0 && (
              <div style={{ background: '#F3F0EA', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: C.text, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Résumé</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {toutesRecompenses.map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: 8, padding: '8px 12px' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{r.label}</span>
                      <span style={{ fontSize: 12, color: C.primary, fontWeight: 900 }}>{r.seuil} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button onClick={handleSave} disabled={saving} style={{ background: saving ? '#ccc' : C.primary, color: '#fff', border: 'none', borderRadius: 12, padding: '14px 40px', fontSize: 15, fontWeight: 900, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Lato, sans-serif', boxShadow: saving ? 'none' : '0 8px 20px -6px rgba(181,40,28,0.5)', transition: 'all 0.2s' }}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </button>
        </div>
      </div>
    </div>
  );
}
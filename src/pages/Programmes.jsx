import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';

const COULEURS = [
  '#B5281C', '#1A56DB', '#047857', '#7C3AED',
  '#D97706', '#DB2777', '#0891B2', '#374151',
];

const EMOJIS = ['🥙', '🍕', '🍔', '🍜', '🍣', '🥗', '🌮', '🍗', '🥩', '🍝', '🫕', '🥘'];

const RECOMPENSES_EXEMPLES = [
  { label: 'Boisson offerte', seuil: 200, desc: 'Une boisson au choix offerte' },
  { label: 'Frites offertes', seuil: 300, desc: 'Une portion de frites offerte' },
  { label: 'Dessert offert', seuil: 400, desc: 'Un dessert au choix offert' },
  { label: 'Réduction 10%', seuil: 500, desc: '10% de réduction sur la commande' },
  { label: 'Menu offert', seuil: 800, desc: 'Un menu complet offert' },
  { label: 'Repas offert', seuil: 1000, desc: 'Un repas complet offert' },
];

export default function Programme() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurantData, setRestaurantData] = useState(null);
  const [form, setForm] = useState({
    couleur: '#B5281C',
    logo_emoji: '🥙',
    pts_par_euro: 10,
    recompenses_selectionnees: [],
    recompenses_custom: [],
    nouveauCustom: { seuil: '', desc: '' },
    erreurCustom: '',
  });

  useEffect(() => {
    chargerProfil();
  }, []);

  const chargerProfil = async () => {
    try {
      const { data } = await API.get('/restaurants/profil');
      const r = data.restaurant;
      setRestaurantData(r);

      let recompenses = [];
      try {
        recompenses = JSON.parse(r.description_recompense || '[]');
        if (!Array.isArray(recompenses)) recompenses = [];
      } catch {
        if (r.description_recompense) {
          recompenses = [{ label: r.description_recompense, seuil: r.seuil_recompense || 500, desc: r.description_recompense }];
        }
      }

      const recompensesExemplesLabels = RECOMPENSES_EXEMPLES.map(r => r.label);
      const selectionnees = recompenses.filter(r => recompensesExemplesLabels.includes(r.label));
      const custom = recompenses.filter(r => !recompensesExemplesLabels.includes(r.label));

      setForm(f => ({
        ...f,
        couleur: r.couleur || '#B5281C',
        logo_emoji: r.logo_emoji || '🥙',
        pts_par_euro: r.pts_par_euro || 10,
        recompenses_selectionnees: recompenses,
        recompenses_custom: custom,
      }));
    } catch (err) {
      toast.error('Erreur chargement du programme');
    }
    setLoading(false);
  };

  const toggleRecompense = (r) => {
    const existe = form.recompenses_selectionnees.find(x => x.label === r.label);
    if (existe) {
      setForm({ ...form, recompenses_selectionnees: form.recompenses_selectionnees.filter(x => x.label !== r.label) });
    } else {
      setForm({ ...form, recompenses_selectionnees: [...form.recompenses_selectionnees, r] });
    }
  };

  const ajouterCustom = () => {
    const seuil = parseInt(form.nouveauCustom.seuil);
    if (!form.nouveauCustom.seuil || !form.nouveauCustom.desc) {
      setForm({ ...form, erreurCustom: 'Remplissez le nombre de points et la description.' });
      return;
    }
    if (isNaN(seuil) || seuil <= 0) {
      setForm({ ...form, erreurCustom: 'Le nombre de points doit être un nombre positif.' });
      return;
    }
    const nouvelle = { label: form.nouveauCustom.desc, seuil, desc: form.nouveauCustom.desc };
    setForm({
      ...form,
      recompenses_custom: [...form.recompenses_custom, nouvelle],
      recompenses_selectionnees: [...form.recompenses_selectionnees, nouvelle],
      nouveauCustom: { seuil: '', desc: '' },
      erreurCustom: '',
    });
  };

  const supprimerCustom = (index) => {
    const custom = form.recompenses_custom[index];
    setForm({
      ...form,
      recompenses_custom: form.recompenses_custom.filter((_, i) => i !== index),
      recompenses_selectionnees: form.recompenses_selectionnees.filter(x => x.label !== custom.label),
    });
  };

  const handleSave = async () => {
    if (form.recompenses_selectionnees.length === 0) {
      toast.error('Sélectionnez au moins une récompense');
      return;
    }
    setSaving(true);
    try {
      const triees = [...form.recompenses_selectionnees].sort((a, b) => a.seuil - b.seuil);
      await API.post('/auth/onboarding', {
        couleur: form.couleur,
        logo_emoji: form.logo_emoji,
        pts_par_euro: form.pts_par_euro,
        seuil_recompense: triees[0].seuil,
        description_recompense: JSON.stringify(triees),
      });
      const updated = { ...JSON.parse(localStorage.getItem('restaurant') || '{}'), couleur: form.couleur, logo_emoji: form.logo_emoji, pts_par_euro: form.pts_par_euro };
      localStorage.setItem('restaurant', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      toast.success('Programme mis à jour ! ✅');
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde');
    }
    setSaving(false);
  };

  const toutesRecompenses = [...form.recompenses_selectionnees].sort((a, b) => a.seuil - b.seuil);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontSize: 40 }}>⏳</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', fontFamily: 'Outfit, sans-serif' }}>
      <Toaster position="top-right" />
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 32px' }}>

        <div style={{ marginBottom: '36px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#C0392B', marginBottom: '8px' }}>Configuration</div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#1A1A2E', letterSpacing: '-0.8px', marginBottom: '6px' }}>Mon programme de fidélité</h1>
          <p style={{ color: '#9B9BB4', fontSize: '15px' }}>Modifiez les paramètres de votre programme à tout moment.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* Colonne gauche */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Apparence */}
            <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid #EAEAF0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E', marginBottom: 20 }}>Apparence</div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <div style={{ width: 72, height: 72, borderRadius: 20, background: form.couleur, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, boxShadow: `0 12px 30px ${form.couleur}55`, transition: 'all 0.2s' }}>
                  {form.logo_emoji}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#9B9BB4', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Couleur</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {COULEURS.map(c => (
                    <button key={c} onClick={() => setForm({ ...form, couleur: c })} style={{
                      width: 36, height: 36, borderRadius: 10, background: c, border: 'none', cursor: 'pointer',
                      boxShadow: form.couleur === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : 'none',
                      transition: 'all 0.2s', transform: form.couleur === c ? 'scale(1.15)' : 'scale(1)',
                    }} />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#9B9BB4', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Icône</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setForm({ ...form, logo_emoji: e })} style={{
                      width: 40, height: 40, borderRadius: 10, fontSize: 20,
                      background: form.logo_emoji === e ? form.couleur + '18' : '#F3F0EA',
                      border: form.logo_emoji === e ? `2px solid ${form.couleur}` : '2px solid transparent',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}>{e}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Points */}
            <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid #EAEAF0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E', marginBottom: 20 }}>Règle des points</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F8F9FA', borderRadius: 12, padding: '14px 18px' }}>
                <span style={{ fontSize: 14, color: '#1A1A2E', fontWeight: 600 }}>1€ dépensé =</span>
                <input
                  type="number" min="1" max="100"
                  value={form.pts_par_euro}
                  onChange={e => setForm({ ...form, pts_par_euro: parseInt(e.target.value) || 1 })}
                  style={{ width: 65, padding: '8px 10px', borderRadius: 8, border: '2px solid #EAEAF0', fontSize: 18, fontWeight: 900, color: '#C0392B', textAlign: 'center', outline: 'none', fontFamily: 'Outfit, sans-serif' }}
                  onFocus={e => e.target.style.borderColor = '#C0392B'}
                  onBlur={e => e.target.style.borderColor = '#EAEAF0'}
                />
                <span style={{ fontSize: 14, color: '#1A1A2E', fontWeight: 600 }}>points</span>
              </div>
              <p style={{ fontSize: 13, color: '#9B9BB4', marginTop: 8 }}>
                20€ dépensés = <strong style={{ color: '#C0392B' }}>{form.pts_par_euro * 20} points</strong>
              </p>
            </div>
          </div>

          {/* Colonne droite — Récompenses */}
          <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid #EAEAF0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>Récompenses</div>
              {form.recompenses_selectionnees.length > 0 && (
                <span style={{ fontSize: 12, fontWeight: 700, color: '#C0392B', background: 'rgba(192,57,43,0.08)', padding: '3px 10px', borderRadius: 100 }}>
                  {form.recompenses_selectionnees.length} active{form.recompenses_selectionnees.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {RECOMPENSES_EXEMPLES.map((r, i) => {
                const selectionne = form.recompenses_selectionnees.find(x => x.label === r.label);
                return (
                  <button key={i} onClick={() => toggleRecompense(r)} style={{
                    padding: '10px 12px', borderRadius: 10, textAlign: 'left',
                    border: selectionne ? '2px solid #C0392B' : '2px solid #EAEAF0',
                    background: selectionne ? 'rgba(192,57,43,0.05)' : '#F8F9FA',
                    cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                  }}>
                    {selectionne && (
                      <div style={{ position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: '50%', background: '#C0392B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="9" height="9" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                      </div>
                    )}
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A2E' }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: '#C0392B', fontWeight: 700, marginTop: 2 }}>{r.seuil} pts</div>
                  </button>
                );
              })}
            </div>

            {form.recompenses_custom.length > 0 && (
              <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {form.recompenses_custom.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(192,57,43,0.05)', border: '2px solid #C0392B', borderRadius: 10, padding: '8px 12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A2E' }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: '#C0392B', fontWeight: 700 }}>{r.seuil} pts</div>
                    </div>
                    <button onClick={() => supprimerCustom(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9B9BB4', fontSize: 18, padding: 2, lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ border: '2px dashed #EAEAF0', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#9B9BB4', marginBottom: 8 }}>+ Ajouter une récompense personnalisée</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="number" placeholder="Points" min="1"
                  value={form.nouveauCustom.seuil}
                  onChange={e => {
                    const val = e.target.value;
                    setForm({ ...form, nouveauCustom: { ...form.nouveauCustom, seuil: val }, erreurCustom: '' });
                  }}
                  style={{ width: 80, padding: '8px 10px', borderRadius: 8, border: '1px solid #EAEAF0', fontSize: 13, fontFamily: 'Outfit, sans-serif', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#C0392B'}
                  onBlur={e => e.target.style.borderColor = '#EAEAF0'}
                />
                <input
                  type="text" placeholder="Ex: Café offert"
                  value={form.nouveauCustom.desc}
                  onChange={e => setForm({ ...form, nouveauCustom: { ...form.nouveauCustom, desc: e.target.value }, erreurCustom: '' })}
                  style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #EAEAF0', fontSize: 13, fontFamily: 'Outfit, sans-serif', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#C0392B'}
                  onBlur={e => e.target.style.borderColor = '#EAEAF0'}
                />
                <button onClick={ajouterCustom} style={{ padding: '8px 14px', borderRadius: 8, background: '#C0392B', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>
                  +
                </button>
              </div>
              {form.erreurCustom && (
                <p style={{ fontSize: 12, color: '#C0392B', marginTop: 6, fontWeight: 600 }}>⚠️ {form.erreurCustom}</p>
              )}
            </div>

            {form.recompenses_selectionnees.length === 0 && (
              <p style={{ fontSize: 12, color: '#C0392B', marginTop: 10, fontWeight: 600 }}>⚠️ Sélectionnez au moins une récompense.</p>
            )}
          </div>
        </div>

        {/* Résumé + Bouton sauvegarder */}
        {toutesRecompenses.length > 0 && (
          <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #EAEAF0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginTop: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E', marginBottom: 14 }}>Résumé de votre programme</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {toutesRecompenses.map((r, i) => (
                <div key={i} style={{ background: '#F8F9FA', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>{r.label}</span>
                  <span style={{ fontSize: 12, color: '#C0392B', fontWeight: 700 }}>{r.seuil} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button onClick={handleSave} disabled={saving} style={{
            background: saving ? '#ccc' : 'linear-gradient(135deg, #C0392B, #E74C3C)',
            color: '#fff', border: 'none', borderRadius: 12,
            padding: '14px 40px', fontSize: 16, fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: 'Outfit, sans-serif',
            boxShadow: saving ? 'none' : '0 8px 24px rgba(192,57,43,0.35)',
            transition: 'all 0.2s',
          }}>
            {saving ? '⏳ Sauvegarde...' : '✅ Sauvegarder les modifications'}
          </button>
        </div>
      </div>
    </div>
  );
}
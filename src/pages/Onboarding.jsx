import { useState } from 'react';
import API from '../api';

const C = { bg: '#FCFBF8', text: '#2A1610', primary: '#B5281C', border: '#E8E1D5', gray: '#9B8E84' };

const RECOMPENSES_EXEMPLES = [
  { label: 'Boisson offerte', seuil: 200, desc: 'Une boisson au choix offerte' },
  { label: 'Frites offertes', seuil: 300, desc: 'Une portion de frites offerte' },
  { label: 'Dessert offert', seuil: 400, desc: 'Un dessert au choix offert' },
  { label: 'Réduction 10%', seuil: 500, desc: '10% de réduction sur la commande' },
  { label: 'Menu offert', seuil: 800, desc: 'Un menu complet offert' },
  { label: 'Repas offert', seuil: 1000, desc: 'Un repas complet offert' },
];

const IconCheck = () => <svg width="10" height="10" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>;

export default function Onboarding({ restaurant, onComplete }) {
  const [etape, setEtape] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    pts_par_euro: 10,
    recompenses_selectionnees: [],
    recompenses_custom: [],
    nouveauCustom: { seuil: '', desc: '' },
    erreurCustom: '',
  });

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

  const toutesRecompenses = [...form.recompenses_selectionnees].sort((a, b) => a.seuil - b.seuil);
  const peutContinuer = etape !== 1 || form.recompenses_selectionnees.length > 0;

  const handleFinish = async () => {
    setLoading(true);
    try {
      const restaurantLocal = JSON.parse(localStorage.getItem('restaurant') || '{}');
      await API.post('/auth/onboarding', {
        couleur: restaurantLocal.couleur || C.primary,
        logo_emoji: restaurantLocal.logo_emoji || '🥙',
        pts_par_euro: form.pts_par_euro,
        seuil_recompense: toutesRecompenses[0]?.seuil || 500,
        description_recompense: JSON.stringify(toutesRecompenses),
      });
      onComplete({});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(42,22,16,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'Lato, sans-serif',
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, padding: '40px 44px',
        maxWidth: 560, width: '100%',
        boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: 2 }}>
              Étape {etape} sur 2
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2].map(n => (
                <div key={n} style={{
                  height: 4, width: n === etape ? 32 : 16, borderRadius: 100,
                  background: n <= etape ? C.primary : '#E8E1D5',
                  transition: 'all 0.3s',
                }} />
              ))}
            </div>
          </div>

          {etape === 1 && <>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: C.text, letterSpacing: '-0.5px', marginBottom: 6 }}>
              Configurez votre programme
            </h2>
            <p style={{ fontSize: 15, color: C.gray, lineHeight: 1.6 }}>
              Définissez vos règles de points et choisissez vos récompenses.
            </p>
          </>}
          {etape === 2 && <>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: C.text, letterSpacing: '-0.5px', marginBottom: 6 }}>
              Votre programme est prêt ! 🎉
            </h2>
            <p style={{ fontSize: 15, color: C.gray, lineHeight: 1.6 }}>
              Imprimez votre QR code depuis l'onglet QR Code et placez-le sur votre comptoir.
            </p>
          </>}
        </div>

        {/* ÉTAPE 1 — Points & Récompenses */}
        {etape === 1 && (
          <div>
            {/* Points par euro */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: 'block', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Règle des points</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F3F0EA', borderRadius: 14, padding: '16px 20px' }}>
                <span style={{ fontSize: 15, color: C.text, fontWeight: 700 }}>1€ dépensé =</span>
                <input
                  type="number" min="1" max="100"
                  value={form.pts_par_euro}
                  onChange={e => setForm({ ...form, pts_par_euro: parseInt(e.target.value) || 1 })}
                  style={{ width: 70, padding: '8px 12px', borderRadius: 8, border: `2px solid ${C.border}`, fontSize: 18, fontWeight: 900, color: C.primary, textAlign: 'center', outline: 'none', fontFamily: 'Lato, sans-serif' }}
                  onFocus={e => e.target.style.borderColor = C.primary}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
                <span style={{ fontSize: 15, color: C.text, fontWeight: 700 }}>points</span>
              </div>
              <p style={{ fontSize: 13, color: C.gray, marginTop: 8 }}>
                Exemple : 20€ dépensés = <strong style={{ color: C.primary }}>{form.pts_par_euro * 20} points</strong>
              </p>
            </div>

            {/* Récompenses */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: 1 }}>Récompenses</label>
                {form.recompenses_selectionnees.length > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.primary, background: 'rgba(181,40,28,0.08)', padding: '3px 10px', borderRadius: 100 }}>
                    {form.recompenses_selectionnees.length} sélectionnée{form.recompenses_selectionnees.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                {RECOMPENSES_EXEMPLES.map((r, i) => {
                  const sel = form.recompenses_selectionnees.find(x => x.label === r.label);
                  return (
                    <button key={i} onClick={() => toggleRecompense(r)} style={{
                      padding: '12px 14px', borderRadius: 12, textAlign: 'left',
                      border: sel ? `2px solid ${C.primary}` : `2px solid ${C.border}`,
                      background: sel ? 'rgba(181,40,28,0.05)' : '#F3F0EA',
                      cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                    }}>
                      {sel && (
                        <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconCheck/>
                        </div>
                      )}
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{r.label}</div>
                      <div style={{ fontSize: 12, color: C.primary, fontWeight: 700, marginTop: 2 }}>{r.seuil} pts</div>
                    </button>
                  );
                })}
              </div>

              {form.recompenses_custom.length > 0 && (
                <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {form.recompenses_custom.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(181,40,28,0.05)', border: `2px solid ${C.primary}`, borderRadius: 12, padding: '10px 14px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{r.label}</div>
                        <div style={{ fontSize: 12, color: C.primary, fontWeight: 700 }}>{r.seuil} pts</div>
                      </div>
                      <button onClick={() => supprimerCustom(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray, fontSize: 20, padding: 4, lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ border: `2px dashed ${C.border}`, borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.gray, marginBottom: 10 }}>+ Récompense personnalisée</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="number" placeholder="Points"
                    value={form.nouveauCustom.seuil}
                    onChange={e => setForm({ ...form, nouveauCustom: { ...form.nouveauCustom, seuil: e.target.value }, erreurCustom: '' })}
                    style={{ width: 90, padding: '9px 12px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, fontFamily: 'Lato, sans-serif', outline: 'none', color: C.text }}
                    onFocus={e => e.target.style.borderColor = C.primary}
                    onBlur={e => e.target.style.borderColor = C.border}
                  />
                  <input
                    type="text" placeholder="Ex: Café offert"
                    value={form.nouveauCustom.desc}
                    onChange={e => setForm({ ...form, nouveauCustom: { ...form.nouveauCustom, desc: e.target.value }, erreurCustom: '' })}
                    style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, fontFamily: 'Lato, sans-serif', outline: 'none', color: C.text }}
                    onFocus={e => e.target.style.borderColor = C.primary}
                    onBlur={e => e.target.style.borderColor = C.border}
                  />
                  <button onClick={ajouterCustom} style={{ padding: '9px 16px', borderRadius: 10, background: C.primary, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'Lato, sans-serif' }}>
                    +
                  </button>
                </div>
                {form.erreurCustom && <p style={{ fontSize: 12, color: C.primary, marginTop: 6, fontWeight: 700 }}>⚠️ {form.erreurCustom}</p>}
              </div>

              {form.recompenses_selectionnees.length === 0 && (
                <p style={{ fontSize: 13, color: C.primary, marginTop: 10, fontWeight: 700 }}>⚠️ Sélectionnez au moins une récompense pour continuer.</p>
              )}
            </div>
          </div>
        )}

        {/* ÉTAPE 2 — Résumé */}
        {etape === 2 && (
          <div>
            <div style={{ background: '#F3F0EA', borderRadius: 16, padding: 20, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="26" height="26" fill="white" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: C.text }}>{restaurant?.nom}</div>
                  <div style={{ fontSize: 13, color: C.gray, marginTop: 2 }}>Programme de fidélité actif</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.gray, fontWeight: 600 }}>1€ dépensé =</span>
                <span style={{ color: C.text, fontWeight: 700 }}>{form.pts_par_euro} points</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                {toutesRecompenses.length} récompense{toutesRecompenses.length > 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {toutesRecompenses.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: 10, padding: '10px 14px' }}>
                    <span style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>{r.label}</span>
                    <span style={{ fontSize: 13, color: C.primary, fontWeight: 700 }}>{r.seuil} pts</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'rgba(181,40,28,0.06)', border: '1px solid rgba(181,40,28,0.2)', borderRadius: 14, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 20, flexShrink: 0 }}>💡</div>
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>
                Votre QR code est disponible dans l'onglet <strong>QR Code</strong> du dashboard. Imprimez-le et placez-le sur votre comptoir !
              </div>
            </div>
          </div>
        )}

        {/* Boutons navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36, gap: 12 }}>
          {etape > 1 ? (
            <button onClick={() => setEtape(etape - 1)} style={{
              padding: '14px 24px', borderRadius: 12, border: `2px solid ${C.border}`,
              background: '#fff', color: C.text, fontWeight: 700, fontSize: 15,
              cursor: 'pointer', fontFamily: 'Lato, sans-serif',
            }}>← Retour</button>
          ) : <div />}

          {etape < 2 ? (
            <button
              onClick={() => peutContinuer && setEtape(etape + 1)}
              disabled={!peutContinuer}
              style={{
                padding: '14px 32px', borderRadius: 12, border: 'none',
                background: peutContinuer ? C.primary : '#E8E1D5',
                color: peutContinuer ? '#fff' : C.gray,
                fontWeight: 900, fontSize: 15,
                cursor: peutContinuer ? 'pointer' : 'not-allowed',
                fontFamily: 'Lato, sans-serif',
                boxShadow: peutContinuer ? '0 8px 20px -6px rgba(181,40,28,0.5)' : 'none',
                transition: 'all 0.2s',
              }}>Continuer →</button>
          ) : (
            <button onClick={handleFinish} disabled={loading} style={{
              padding: '14px 32px', borderRadius: 12, border: 'none',
              background: loading ? C.gray : C.primary,
              color: '#fff', fontWeight: 900, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Lato, sans-serif',
              boxShadow: loading ? 'none' : '0 8px 20px -6px rgba(181,40,28,0.5)',
            }}>
              {loading ? 'Sauvegarde...' : 'Lancer mon programme 🚀'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import API from '../api';

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

export default function Onboarding({ restaurant, onComplete }) {
  const [etape, setEtape] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    couleur: restaurant?.couleur || '#B5281C',
    logo_emoji: restaurant?.logo_emoji || '🥙',
    pts_par_euro: 10,
    recompenses_selectionnees: [],
    recompenses_custom: [],
    nouveauCustom: { seuil: '', desc: '' },
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
    if (!form.nouveauCustom.seuil || !form.nouveauCustom.desc) return;
    const nouvelle = {
      label: form.nouveauCustom.desc,
      seuil: parseInt(form.nouveauCustom.seuil),
      desc: form.nouveauCustom.desc,
    };
    setForm({
      ...form,
      recompenses_custom: [...form.recompenses_custom, nouvelle],
      recompenses_selectionnees: [...form.recompenses_selectionnees, nouvelle],
      nouveauCustom: { seuil: '', desc: '' },
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
  const peutContinuer = etape !== 2 || form.recompenses_selectionnees.length > 0;

  const handleFinish = async () => {
    setLoading(true);
    try {
      const premiereRecompense = toutesRecompenses[0];
      await API.post('/auth/onboarding', {
        couleur: form.couleur,
        logo_emoji: form.logo_emoji,
        pts_par_euro: form.pts_par_euro,
        seuil_recompense: premiereRecompense?.seuil || 500,
        description_recompense: JSON.stringify(toutesRecompenses),
      });
      onComplete({ couleur: form.couleur, logo_emoji: form.logo_emoji });
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
      padding: 24, fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, padding: '40px 44px',
        maxWidth: 580, width: '100%',
        boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#9B8E84', textTransform: 'uppercase', letterSpacing: 2 }}>
              Étape {etape} sur 3
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3].map(n => (
                <div key={n} style={{
                  height: 4, width: n === etape ? 32 : 16, borderRadius: 100,
                  background: n <= etape ? '#B5281C' : '#E8E1D5',
                  transition: 'all 0.3s',
                }} />
              ))}
            </div>
          </div>
          {etape === 1 && <>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#2A1610', letterSpacing: '-0.5px', marginBottom: 6 }}>Personnalisez votre programme</h2>
            <p style={{ fontSize: 15, color: '#9B8E84', lineHeight: 1.6 }}>Choisissez la couleur et l'icône de votre restaurant.</p>
          </>}
          {etape === 2 && <>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#2A1610', letterSpacing: '-0.5px', marginBottom: 6 }}>Définissez vos récompenses</h2>
            <p style={{ fontSize: 15, color: '#9B8E84', lineHeight: 1.6 }}>Choisissez autant de récompenses que vous voulez. Vos clients les débloquent en accumulant des points.</p>
          </>}
          {etape === 3 && <>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#2A1610', letterSpacing: '-0.5px', marginBottom: 6 }}>Votre programme est prêt ! 🎉</h2>
            <p style={{ fontSize: 15, color: '#9B8E84', lineHeight: 1.6 }}>Imprimez votre QR code depuis l'onglet QR Code et placez-le sur votre comptoir.</p>
          </>}
        </div>

        {/* ÉTAPE 1 — Couleur & Emoji */}
        {etape === 1 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              <div style={{
                width: 80, height: 80, borderRadius: 22,
                background: form.couleur, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, boxShadow: `0 12px 30px ${form.couleur}55`,
                transition: 'all 0.2s',
              }}>{form.logo_emoji}</div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#2A1610', display: 'block', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Couleur principale</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {COULEURS.map(c => (
                  <button key={c} onClick={() => setForm({ ...form, couleur: c })} style={{
                    width: 40, height: 40, borderRadius: 12, background: c, border: 'none', cursor: 'pointer',
                    boxShadow: form.couleur === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : 'none',
                    transition: 'all 0.2s', transform: form.couleur === c ? 'scale(1.1)' : 'scale(1)',
                  }} />
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#2A1610', display: 'block', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Icône du restaurant</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setForm({ ...form, logo_emoji: e })} style={{
                    width: 44, height: 44, borderRadius: 12, fontSize: 22,
                    background: form.logo_emoji === e ? form.couleur + '18' : '#F3F0EA',
                    border: form.logo_emoji === e ? `2px solid ${form.couleur}` : '2px solid transparent',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>{e}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 — Points & Récompenses multiples */}
        {etape === 2 && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#2A1610', display: 'block', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Règle des points</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F3F0EA', borderRadius: 14, padding: '16px 20px' }}>
                <span style={{ fontSize: 15, color: '#2A1610', fontWeight: 600 }}>1€ dépensé =</span>
                <input
                  type="number" min="1" max="100"
                  value={form.pts_par_euro}
                  onChange={e => setForm({ ...form, pts_par_euro: parseInt(e.target.value) || 1 })}
                  style={{ width: 70, padding: '8px 12px', borderRadius: 8, border: '2px solid #E8E1D5', fontSize: 18, fontWeight: 900, color: '#B5281C', textAlign: 'center', outline: 'none', fontFamily: "'Outfit', sans-serif" }}
                  onFocus={e => e.target.style.borderColor = '#B5281C'}
                  onBlur={e => e.target.style.borderColor = '#E8E1D5'}
                />
                <span style={{ fontSize: 15, color: '#2A1610', fontWeight: 600 }}>points</span>
              </div>
              <p style={{ fontSize: 13, color: '#9B8E84', marginTop: 8 }}>
                Exemple : 20€ dépensés = <strong style={{ color: '#B5281C' }}>{form.pts_par_euro * 20} points</strong>
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#2A1610', textTransform: 'uppercase', letterSpacing: 1 }}>Récompenses</label>
                {form.recompenses_selectionnees.length > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#B5281C', background: 'rgba(181,40,28,0.08)', padding: '3px 10px', borderRadius: 100 }}>
                    {form.recompenses_selectionnees.length} sélectionnée{form.recompenses_selectionnees.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                {RECOMPENSES_EXEMPLES.map((r, i) => {
                  const selectionne = form.recompenses_selectionnees.find(x => x.label === r.label);
                  return (
                    <button key={i} onClick={() => toggleRecompense(r)} style={{
                      padding: '12px 14px', borderRadius: 12, textAlign: 'left',
                      border: selectionne ? '2px solid #B5281C' : '2px solid #E8E1D5',
                      background: selectionne ? 'rgba(181,40,28,0.05)' : '#fff',
                      cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                    }}>
                      {selectionne && (
                        <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: '#B5281C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="10" height="10" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                        </div>
                      )}
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#2A1610' }}>{r.label}</div>
                      <div style={{ fontSize: 12, color: '#B5281C', fontWeight: 700, marginTop: 2 }}>{r.seuil} pts</div>
                    </button>
                  );
                })}
              </div>

              {form.recompenses_custom.length > 0 && (
                <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {form.recompenses_custom.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(181,40,28,0.05)', border: '2px solid #B5281C', borderRadius: 12, padding: '10px 14px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#2A1610' }}>{r.label}</div>
                        <div style={{ fontSize: 12, color: '#B5281C', fontWeight: 700 }}>{r.seuil} pts</div>
                      </div>
                      <button onClick={() => supprimerCustom(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9B8E84', fontSize: 20, padding: 4, lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ border: '2px dashed #E8E1D5', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#9B8E84', marginBottom: 10 }}>+ Ajouter une récompense personnalisée</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="number" placeholder="Points"
                    value={form.nouveauCustom.seuil}
                    onChange={e => setForm({ ...form, nouveauCustom: { ...form.nouveauCustom, seuil: e.target.value } })}
                    style={{ width: 90, padding: '9px 12px', borderRadius: 10, border: '1px solid #E8E1D5', fontSize: 14, fontFamily: "'Outfit', sans-serif", outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#B5281C'}
                    onBlur={e => e.target.style.borderColor = '#E8E1D5'}
                  />
                  <input
                    type="text" placeholder="Ex: Café offert"
                    value={form.nouveauCustom.desc}
                    onChange={e => setForm({ ...form, nouveauCustom: { ...form.nouveauCustom, desc: e.target.value } })}
                    style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: '1px solid #E8E1D5', fontSize: 14, fontFamily: "'Outfit', sans-serif", outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#B5281C'}
                    onBlur={e => e.target.style.borderColor = '#E8E1D5'}
                  />
                  <button onClick={ajouterCustom} style={{ padding: '9px 16px', borderRadius: 10, background: '#B5281C', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: "'Outfit', sans-serif" }}>
                    Ajouter
                  </button>
                </div>
              </div>

              {form.recompenses_selectionnees.length === 0 && (
                <p style={{ fontSize: 13, color: '#B5281C', marginTop: 10, fontWeight: 600 }}>⚠️ Sélectionnez au moins une récompense pour continuer.</p>
              )}
            </div>
          </div>
        )}

        {/* ÉTAPE 3 — Résumé */}
        {etape === 3 && (
          <div>
            <div style={{ background: '#F3F0EA', borderRadius: 16, padding: 20, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: form.couleur, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                  {form.logo_emoji}
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: '#2A1610' }}>{restaurant?.nom}</div>
                  <div style={{ fontSize: 13, color: '#9B8E84', marginTop: 2 }}>Programme de fidélité actif</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #E8E1D5' }}>
                <span style={{ color: '#9B8E84', fontWeight: 600 }}>1€ dépensé =</span>
                <span style={{ color: '#2A1610', fontWeight: 700 }}>{form.pts_par_euro} points</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2A1610', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                {toutesRecompenses.length} récompense{toutesRecompenses.length > 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {toutesRecompenses.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: 10, padding: '10px 14px' }}>
                    <span style={{ fontSize: 14, color: '#2A1610', fontWeight: 600 }}>{r.label}</span>
                    <span style={{ fontSize: 13, color: '#B5281C', fontWeight: 700 }}>{r.seuil} pts</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'rgba(181,40,28,0.06)', border: '1px solid rgba(181,40,28,0.2)', borderRadius: 14, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 20, flexShrink: 0 }}>💡</div>
              <div style={{ fontSize: 14, color: '#2A1610', lineHeight: 1.6 }}>
                Votre QR code est disponible dans l'onglet <strong>QR Code</strong> du dashboard. Imprimez-le et placez-le sur votre comptoir !
              </div>
            </div>
          </div>
        )}

        {/* Boutons navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36, gap: 12 }}>
          {etape > 1 ? (
            <button onClick={() => setEtape(etape - 1)} style={{
              padding: '14px 24px', borderRadius: 12, border: '2px solid #E8E1D5',
              background: '#fff', color: '#2A1610', fontWeight: 700, fontSize: 15,
              cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
            }}>← Retour</button>
          ) : <div />}

          {etape < 3 ? (
            <button
              onClick={() => peutContinuer && setEtape(etape + 1)}
              disabled={!peutContinuer}
              style={{
                padding: '14px 32px', borderRadius: 12, border: 'none',
                background: peutContinuer ? form.couleur : '#E8E1D5',
                color: peutContinuer ? '#fff' : '#9B8E84',
                fontWeight: 900, fontSize: 15,
                cursor: peutContinuer ? 'pointer' : 'not-allowed',
                fontFamily: "'Outfit', sans-serif",
                boxShadow: peutContinuer ? `0 8px 20px -6px ${form.couleur}88` : 'none',
                transition: 'all 0.2s',
              }}>Continuer →</button>
          ) : (
            <button onClick={handleFinish} disabled={loading} style={{
              padding: '14px 32px', borderRadius: 12, border: 'none',
              background: loading ? '#9B8E84' : '#B5281C', color: '#fff', fontWeight: 900, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Outfit', sans-serif",
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
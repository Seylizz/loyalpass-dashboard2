import { useState } from 'react';
import API from '../api/axios';

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
    recompense_choisie: RECOMPENSES_EXEMPLES[2],
    seuil_custom: '',
    desc_custom: '',
    mode: 'exemple', // 'exemple' ou 'custom'
  });

  const handleFinish = async () => {
    setLoading(true);
    try {
      const seuil = form.mode === 'custom' ? parseInt(form.seuil_custom) : form.recompense_choisie.seuil;
      const desc = form.mode === 'custom' ? form.desc_custom : form.recompense_choisie.desc;
      await API.post('/auth/onboarding', {
        couleur: form.couleur,
        logo_emoji: form.logo_emoji,
        pts_par_euro: form.pts_par_euro,
        seuil_recompense: seuil,
        description_recompense: desc,
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
        maxWidth: 560, width: '100%',
        boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
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
            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#2A1610', letterSpacing: '-0.5px', marginBottom: 6 }}>
              Personnalisez votre programme
            </h2>
            <p style={{ fontSize: 15, color: '#9B8E84', lineHeight: 1.6 }}>
              Choisissez la couleur et l'icône qui représentent le mieux votre restaurant.
            </p>
          </>}
          {etape === 2 && <>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#2A1610', letterSpacing: '-0.5px', marginBottom: 6 }}>
              Définissez vos règles de points
            </h2>
            <p style={{ fontSize: 15, color: '#9B8E84', lineHeight: 1.6 }}>
              Combien de points vos clients gagnent-ils et quelle est la récompense ?
            </p>
          </>}
          {etape === 3 && <>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#2A1610', letterSpacing: '-0.5px', marginBottom: 6 }}>
              Votre programme est prêt ! 🎉
            </h2>
            <p style={{ fontSize: 15, color: '#9B8E84', lineHeight: 1.6 }}>
              Imprimez votre QR code et placez-le sur votre comptoir. Vos clients peuvent s'inscrire immédiatement.
            </p>
          </>}
        </div>

        {/* ÉTAPE 1 — Couleur & Emoji */}
        {etape === 1 && (
          <div>
            {/* Prévisualisation */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              <div style={{
                width: 80, height: 80, borderRadius: 22,
                background: form.couleur, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, boxShadow: `0 12px 30px ${form.couleur}55`,
                transition: 'all 0.2s',
              }}>{form.logo_emoji}</div>
            </div>

            {/* Couleurs */}
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

            {/* Emojis */}
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

        {/* ÉTAPE 2 — Points & Récompense */}
        {etape === 2 && (
          <div>
            {/* Points par euro */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#2A1610', display: 'block', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                Règle des points
              </label>
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
                Exemple : un client qui dépense 20€ gagne <strong style={{ color: '#B5281C' }}>{form.pts_par_euro * 20} points</strong>
              </p>
            </div>

            {/* Récompense */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#2A1610', display: 'block', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                Récompense débloquée à
              </label>

              {/* Exemples */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                {RECOMPENSES_EXEMPLES.map((r, i) => (
                  <button key={i} onClick={() => setForm({ ...form, recompense_choisie: r, mode: 'exemple' })} style={{
                    padding: '12px 14px', borderRadius: 12, textAlign: 'left',
                    border: form.mode === 'exemple' && form.recompense_choisie.label === r.label ? '2px solid #B5281C' : '2px solid #E8E1D5',
                    background: form.mode === 'exemple' && form.recompense_choisie.label === r.label ? 'rgba(181,40,28,0.05)' : '#fff',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#2A1610' }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: '#B5281C', fontWeight: 700, marginTop: 2 }}>{r.seuil} pts</div>
                  </button>
                ))}
              </div>

              {/* Custom */}
              <button onClick={() => setForm({ ...form, mode: 'custom' })} style={{
                width: '100%', padding: '12px 16px', borderRadius: 12, textAlign: 'left',
                border: form.mode === 'custom' ? '2px solid #B5281C' : '2px solid #E8E1D5',
                background: form.mode === 'custom' ? 'rgba(181,40,28,0.05)' : '#fff',
                cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#2A1610',
                fontFamily: "'Outfit', sans-serif",
              }}>
                + Créer une récompense personnalisée
              </button>

              {form.mode === 'custom' && (
                <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                  <input
                    type="number" placeholder="Seuil (pts)" value={form.seuil_custom}
                    onChange={e => setForm({ ...form, seuil_custom: e.target.value })}
                    style={{ width: 110, padding: '10px 12px', borderRadius: 10, border: '1px solid #E8E1D5', fontSize: 14, fontFamily: "'Outfit', sans-serif", outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#B5281C'}
                    onBlur={e => e.target.style.borderColor = '#E8E1D5'}
                  />
                  <input
                    type="text" placeholder="Description de la récompense" value={form.desc_custom}
                    onChange={e => setForm({ ...form, desc_custom: e.target.value })}
                    style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid #E8E1D5', fontSize: 14, fontFamily: "'Outfit', sans-serif", outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#B5281C'}
                    onBlur={e => e.target.style.borderColor = '#E8E1D5'}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ÉTAPE 3 — Résumé + QR */}
        {etape === 3 && (
          <div>
            {/* Résumé */}
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
              {[
                { label: '1€ dépensé =', val: `${form.pts_par_euro} points` },
                { label: 'Récompense à', val: `${form.mode === 'custom' ? form.seuil_custom : form.recompense_choisie.seuil} pts` },
                { label: 'Récompense', val: form.mode === 'custom' ? form.desc_custom : form.recompense_choisie.desc },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid #E8E1D5' }}>
                  <span style={{ color: '#9B8E84', fontWeight: 600 }}>{label}</span>
                  <span style={{ color: '#2A1610', fontWeight: 700 }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Message QR */}
            <div style={{ background: 'rgba(181,40,28,0.06)', border: '1px solid rgba(181,40,28,0.2)', borderRadius: 14, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 20, flexShrink: 0 }}>💡</div>
              <div style={{ fontSize: 14, color: '#2A1610', lineHeight: 1.6 }}>
                Votre QR code d'inscription est disponible dans l'onglet <strong>QR Code</strong> du dashboard. Imprimez-le et placez-le sur votre comptoir !
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
            <button onClick={() => setEtape(etape + 1)} style={{
              padding: '14px 32px', borderRadius: 12, border: 'none',
              background: form.couleur, color: '#fff', fontWeight: 900, fontSize: 15,
              cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
              boxShadow: `0 8px 20px -6px ${form.couleur}88`,
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
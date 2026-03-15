import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';

const C = { bg: '#FCFBF8', text: '#2A1610', primary: '#B5281C', border: '#E8E1D5', gray: '#9B8E84' };

const INDICATIFS = [
  { code: '+33', pays: 'France' }, { code: '+32', pays: 'Belgique' }, { code: '+41', pays: 'Suisse' },
  { code: '+352', pays: 'Luxembourg' }, { code: '+1', pays: 'USA/Canada' }, { code: '+44', pays: 'Royaume-Uni' },
  { code: '+49', pays: 'Allemagne' }, { code: '+34', pays: 'Espagne' }, { code: '+39', pays: 'Italie' },
  { code: '+351', pays: 'Portugal' }, { code: '+31', pays: 'Pays-Bas' }, { code: '+212', pays: 'Maroc' },
  { code: '+213', pays: 'Algérie' }, { code: '+216', pays: 'Tunisie' }, { code: '+221', pays: 'Sénégal' },
  { code: '+225', pays: "Côte d'Ivoire" }, { code: '+237', pays: 'Cameroun' }, { code: '+243', pays: 'Congo RDC' },
  { code: '+20', pays: 'Égypte' }, { code: '+27', pays: 'Afrique du Sud' }, { code: '+55', pays: 'Brésil' },
  { code: '+52', pays: 'Mexique' }, { code: '+54', pays: 'Argentine' }, { code: '+57', pays: 'Colombie' },
  { code: '+86', pays: 'Chine' }, { code: '+81', pays: 'Japon' }, { code: '+82', pays: 'Corée du Sud' },
  { code: '+91', pays: 'Inde' }, { code: '+971', pays: 'Émirats Arabes Unis' }, { code: '+966', pays: 'Arabie Saoudite' },
  { code: '+90', pays: 'Turquie' }, { code: '+7', pays: 'Russie' }, { code: '+61', pays: 'Australie' },
];

const validerEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validerMdp = (m) => ({ longueur: m.length >= 8, majuscule: /[A-Z]/.test(m), chiffre: /[0-9]/.test(m) });

export default function Login() {
  const [mode, setMode] = useState('connexion');
  const [form, setForm] = useState({ nom: '', adresse: '', indicatif: '+33', telephone: '', email: '', mot_de_passe: '' });
  const [loading, setLoading] = useState(false);
  const [showMdp, setShowMdp] = useState(false);
  const [resterConnecte, setResterConnecte] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [erreurs, setErreurs] = useState({});
  const navigate = useNavigate();

  const valider = () => {
    const e = {};
    if (mode === 'inscription') {
      if (!form.nom) e.nom = 'Nom requis';
      if (!form.telephone) e.telephone = 'Téléphone requis';
      if (!validerEmail(form.email)) e.email = 'Adresse email invalide';
      const c = validerMdp(form.mot_de_passe);
      if (!c.longueur || !c.majuscule || !c.chiffre) e.mot_de_passe = 'Mot de passe trop faible';
    } else {
      if (!form.email) e.email = 'Email requis';
      if (!form.mot_de_passe) e.mot_de_passe = 'Mot de passe requis';
    }
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!valider()) return;
    setLoading(true);
    try {
      const endpoint = mode === 'connexion' ? '/auth/connexion' : '/auth/inscription';
      const payload = mode === 'inscription' ? { ...form, telephone: `${form.indicatif}${form.telephone}` } : form;
      const { data } = await API.post(endpoint, payload);
      // Rester connecté : localStorage (persiste) ou sessionStorage (expire à la fermeture)
      const storage = resterConnecte ? localStorage : sessionStorage;
      storage.setItem('token', data.token);
      storage.setItem('restaurant', JSON.stringify(data.restaurant));
      if (mode === 'inscription') {
        localStorage.removeItem('onboarding_done');
        localStorage.setItem('nouvelle_inscription', 'true');
      } else {
        localStorage.setItem('onboarding_done', 'true');
        localStorage.removeItem('nouvelle_inscription');
      }
      toast.success(mode === 'connexion' ? 'Connexion réussie !' : 'Compte créé !');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de connexion');
    }
    setLoading(false);
  };

  const handleForgot = async () => {
    if (!validerEmail(forgotEmail)) { toast.error('Email invalide'); return; }
    setForgotLoading(true);
    try {
      await API.post('/auth/mot-de-passe-oublie', { email: forgotEmail });
      setForgotSent(true);
    } catch { toast.error("Erreur lors de l'envoi"); }
    setForgotLoading(false);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit(); };
  const mdpCheck = validerMdp(form.mot_de_passe);

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', fontFamily: 'Lato, sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap');@media(max-width:768px){.login-grid{grid-template-columns:1fr!important}.login-left{display:none!important}.login-right{padding:40px 28px!important}}`}</style>
      <Toaster position="top-right" />

      {/* Gauche */}
      <div className="login-left" style={{ background: `linear-gradient(160deg, #2A1610 0%, #1A0D08 60%, #3D1F17 100%)`, padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(181,40,28,0.12)', top: -100, right: -100, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'rgba(217,119,6,0.07)', bottom: 80, left: -60, pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div style={{ width: 44, height: 44, background: C.primary, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 8px 24px rgba(181,40,28,0.4)' }}>🥙</div>
          <span style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>LoyalPass</span>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: C.primary, marginBottom: 20 }}>Espace restaurateur</div>
          <h1 style={{ fontSize: 48, fontWeight: 900, color: 'white', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20 }}>
            Fidélisez vos<br/><span style={{ color: C.primary }}>clients.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, lineHeight: 1.7, maxWidth: 380 }}>
            Gérez votre programme de fidélité, suivez vos clients et boostez vos revenus — tout depuis un seul dashboard.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 32, position: 'relative' }}>
          {[['500+','Points / client actif'],['30%','De clients en plus'],['2min','Pour démarrer']].map(([v,l]) => (
            <div key={l}>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>{v}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Droite */}
      <div className="login-right" style={{ background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 80px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Modal mot de passe oublié */}
          {showForgot && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,16,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }}>
              <div style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(42,22,16,0.2)', border: `1px solid ${C.border}` }}>
                {!forgotSent ? <>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: C.text, marginBottom: 8 }}>Mot de passe oublié</h3>
                  <p style={{ fontSize: 14, color: C.gray, marginBottom: 20, lineHeight: 1.6 }}>Entrez votre email pour recevoir un lien de réinitialisation.</p>
                  <input type="email" placeholder="Votre adresse email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} onKeyDown={e => e.key==='Enter'&&handleForgot()}
                    style={{ width: '100%', padding: '13px 16px', borderRadius: 11, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', fontFamily: 'Lato, sans-serif', marginBottom: 14, color: C.text, background: '#FAFAF8' }}
                    onFocus={e => e.target.style.borderColor = C.primary}
                    onBlur={e => e.target.style.borderColor = C.border}
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={handleForgot} disabled={forgotLoading} style={{ flex: 1, background: C.primary, color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Lato, sans-serif', boxShadow: '0 4px 12px rgba(181,40,28,0.3)' }}>
                      {forgotLoading ? 'Envoi...' : 'Envoyer le lien'}
                    </button>
                    <button onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }} style={{ flex: 1, background: '#F3F0EA', color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Lato, sans-serif' }}>Annuler</button>
                  </div>
                </> : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <svg width="22" height="22" fill="none" stroke="#059669" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: C.text, marginBottom: 8 }}>Email envoyé !</h3>
                    <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.6, marginBottom: 18 }}>Vérifiez votre boîte mail à <strong>{forgotEmail}</strong>. Le lien est valable 1 heure.</p>
                    <button onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 10, padding: '11px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Lato, sans-serif' }}>Fermer</button>
                  </div>
                )}
              </div>
            </div>
          )}

          <h2 style={{ fontSize: 26, fontWeight: 900, color: C.text, marginBottom: 6, letterSpacing: '-0.5px' }}>
            {mode === 'connexion' ? 'Bon retour' : 'Créer un compte'}
          </h2>
          <p style={{ color: C.gray, fontSize: 14, marginBottom: 28 }}>
            {mode === 'connexion' ? 'Connectez-vous à votre espace restaurateur' : 'Démarrez votre programme de fidélité'}
          </p>

          {/* Toggle */}
          <div style={{ display: 'flex', background: '#fff', borderRadius: 12, padding: 4, marginBottom: 24, border: `1px solid ${C.border}` }}>
            {['connexion','inscription'].map(m => (
              <button key={m} onClick={() => { setMode(m); setErreurs({}); }} style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', background: mode===m ? C.primary : 'transparent', color: mode===m ? '#fff' : C.gray, fontWeight: 700, fontSize: 13.5, transition: 'all 0.25s', boxShadow: mode===m ? '0 4px 12px rgba(181,40,28,0.3)' : 'none', fontFamily: 'Lato, sans-serif', cursor: 'pointer' }}>
                {m === 'connexion' ? 'Se connecter' : "S'inscrire"}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mode === 'inscription' && <>
              <div>
                <input placeholder="Nom du restaurant" value={form.nom} onChange={e => setForm({...form,nom:e.target.value})} onKeyDown={handleKeyDown}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: 11, border: `1.5px solid ${erreurs.nom?'#E74C3C':C.border}`, fontSize: 14, outline: 'none', background: '#fff', color: C.text, fontFamily: 'Lato, sans-serif' }}
                  onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = erreurs.nom?'#E74C3C':C.border}/>
                {erreurs.nom && <p style={{ fontSize: 12, color: '#E74C3C', marginTop: 4, fontWeight: 700 }}>{erreurs.nom}</p>}
              </div>
              <input placeholder="Adresse complète" value={form.adresse} onChange={e => setForm({...form,adresse:e.target.value})} onKeyDown={handleKeyDown}
                style={{ width: '100%', padding: '13px 16px', borderRadius: 11, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#fff', color: C.text, fontFamily: 'Lato, sans-serif' }}
                onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = C.border}/>
              <div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={form.indicatif} onChange={e => setForm({...form,indicatif:e.target.value})}
                    style={{ width: 140, padding: '13px 10px', borderRadius: 11, border: `1.5px solid ${C.border}`, fontSize: 13, outline: 'none', background: '#fff', color: C.text, fontFamily: 'Lato, sans-serif', cursor: 'pointer', flexShrink: 0 }}>
                    {INDICATIFS.map(i => <option key={i.code} value={i.code}>{i.code} — {i.pays}</option>)}
                  </select>
                  <input placeholder="Numéro" value={form.telephone} onChange={e => setForm({...form,telephone:e.target.value.replace(/[^0-9]/g,'')})} onKeyDown={handleKeyDown}
                    style={{ flex: 1, padding: '13px 16px', borderRadius: 11, border: `1.5px solid ${erreurs.telephone?'#E74C3C':C.border}`, fontSize: 14, outline: 'none', background: '#fff', color: C.text, fontFamily: 'Lato, sans-serif' }}
                    onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = erreurs.telephone?'#E74C3C':C.border}/>
                </div>
                {erreurs.telephone && <p style={{ fontSize: 12, color: '#E74C3C', marginTop: 4, fontWeight: 700 }}>{erreurs.telephone}</p>}
              </div>
            </>}

            <div>
              <input placeholder="Adresse email" type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} onKeyDown={handleKeyDown}
                style={{ width: '100%', padding: '13px 16px', borderRadius: 11, border: `1.5px solid ${erreurs.email?'#E74C3C':C.border}`, fontSize: 14, outline: 'none', background: '#fff', color: C.text, fontFamily: 'Lato, sans-serif' }}
                onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = erreurs.email?'#E74C3C':C.border}/>
              {erreurs.email && <p style={{ fontSize: 12, color: '#E74C3C', marginTop: 4, fontWeight: 700 }}>{erreurs.email}</p>}
            </div>

            <div>
              <div style={{ position: 'relative' }}>
                <input placeholder="Mot de passe" type={showMdp?'text':'password'} value={form.mot_de_passe} onChange={e => setForm({...form,mot_de_passe:e.target.value})} onKeyDown={handleKeyDown}
                  style={{ width: '100%', padding: '13px 46px 13px 16px', borderRadius: 11, border: `1.5px solid ${erreurs.mot_de_passe?'#E74C3C':C.border}`, fontSize: 14, outline: 'none', background: '#fff', color: C.text, fontFamily: 'Lato, sans-serif' }}
                  onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = erreurs.mot_de_passe?'#E74C3C':C.border}/>
                <button onClick={() => setShowMdp(!showMdp)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: C.gray, padding: 0 }}>
                  {showMdp ? '🙈' : '👁️'}
                </button>
              </div>
              {mode === 'inscription' && form.mot_de_passe.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[{ok:mdpCheck.longueur,label:'8 caractères minimum'},{ok:mdpCheck.majuscule,label:'Une lettre majuscule'},{ok:mdpCheck.chiffre,label:'Un chiffre'}].map(({ok,label}) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: ok?'#059669':'#E74C3C', fontWeight: 700, transition: 'color 0.2s' }}>
                      <span style={{ fontSize: 14 }}>{ok?'✓':'✕'}</span> {label}
                    </div>
                  ))}
                </div>
              )}
              {erreurs.mot_de_passe && <p style={{ fontSize: 12, color: '#E74C3C', marginTop: 4, fontWeight: 700 }}>{erreurs.mot_de_passe}</p>}
            </div>

            {/* Rester connecté + mot de passe oublié */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: -4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <div onClick={() => setResterConnecte(!resterConnecte)} style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${resterConnecte ? C.primary : C.border}`, background: resterConnecte ? C.primary : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0, cursor: 'pointer' }}>
                  {resterConnecte && <svg width="10" height="10" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                </div>
                <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>Rester connecté</span>
              </label>
              {mode === 'connexion' && (
                <button onClick={() => setShowForgot(true)} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato, sans-serif', padding: 0 }}>
                  Mot de passe oublié ?
                </button>
              )}
            </div>

            <button onClick={handleSubmit} disabled={loading} style={{ marginTop: 4, background: loading?'#ccc':C.primary, color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 900, boxShadow: loading?'none':'0 8px 20px -6px rgba(181,40,28,0.5)', transition: 'all 0.3s', fontFamily: 'Lato, sans-serif', cursor: loading?'not-allowed':'pointer', width: '100%' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              {loading ? 'Connexion...' : mode==='connexion' ? '→ Se connecter' : '→ Créer mon compte'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
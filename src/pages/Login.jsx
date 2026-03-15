import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';

const INDICATIFS = [
  { code: '+33', pays: 'France' },
  { code: '+32', pays: 'Belgique' },
  { code: '+41', pays: 'Suisse' },
  { code: '+352', pays: 'Luxembourg' },
  { code: '+1', pays: 'USA/Canada' },
  { code: '+44', pays: 'Royaume-Uni' },
  { code: '+49', pays: 'Allemagne' },
  { code: '+34', pays: 'Espagne' },
  { code: '+39', pays: 'Italie' },
  { code: '+351', pays: 'Portugal' },
  { code: '+31', pays: 'Pays-Bas' },
  { code: '+212', pays: 'Maroc' },
  { code: '+213', pays: 'Algérie' },
  { code: '+216', pays: 'Tunisie' },
  { code: '+221', pays: 'Sénégal' },
  { code: '+225', pays: "Côte d'Ivoire" },
  { code: '+237', pays: 'Cameroun' },
  { code: '+243', pays: 'Congo RDC' },
  { code: '+20', pays: 'Égypte' },
  { code: '+27', pays: 'Afrique du Sud' },
  { code: '+55', pays: 'Brésil' },
  { code: '+52', pays: 'Mexique' },
  { code: '+54', pays: 'Argentine' },
  { code: '+57', pays: 'Colombie' },
  { code: '+86', pays: 'Chine' },
  { code: '+81', pays: 'Japon' },
  { code: '+82', pays: 'Corée du Sud' },
  { code: '+91', pays: 'Inde' },
  { code: '+971', pays: 'Émirats Arabes Unis' },
  { code: '+966', pays: 'Arabie Saoudite' },
  { code: '+90', pays: 'Turquie' },
  { code: '+7', pays: 'Russie' },
  { code: '+61', pays: 'Australie' },
];

const validerEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validerMotDePasse = (mdp) => ({
  longueur: mdp.length >= 8,
  majuscule: /[A-Z]/.test(mdp),
  chiffre: /[0-9]/.test(mdp),
});

export default function Login() {
  const [mode, setMode] = useState('connexion');
  const [form, setForm] = useState({ nom: '', adresse: '', indicatif: '+33', telephone: '', email: '', mot_de_passe: '' });
  const [loading, setLoading] = useState(false);
  const [showMdp, setShowMdp] = useState(false);
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
      const mdpCheck = validerMotDePasse(form.mot_de_passe);
      if (!mdpCheck.longueur || !mdpCheck.majuscule || !mdpCheck.chiffre) e.mot_de_passe = 'Mot de passe trop faible';
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
      const payload = mode === 'inscription'
        ? { ...form, telephone: `${form.indicatif}${form.telephone}` }
        : form;
      const { data } = await API.post(endpoint, payload);
      localStorage.setItem('token', data.token);
      localStorage.setItem('restaurant', JSON.stringify(data.restaurant));
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
    if (!validerEmail(forgotEmail)) {
      toast.error('Adresse email invalide');
      return;
    }
    setForgotLoading(true);
    try {
      await API.post('/auth/mot-de-passe-oublie', { email: forgotEmail });
      setForgotSent(true);
    } catch (err) {
      toast.error('Erreur lors de l\'envoi');
    }
    setForgotLoading(false);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit(); };
  const mdpCheck = validerMotDePasse(form.mot_de_passe);
  const mdpTouche = form.mot_de_passe.length > 0;

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', fontFamily: 'Outfit, sans-serif' }}>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Outfit, sans-serif', fontWeight: '600' } }} />

      {/* Gauche */}
      <div style={{ background: 'linear-gradient(160deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(192,57,43,0.12)', top: '-100px', right: '-100px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(192,57,43,0.07)', bottom: '80px', left: '-60px', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #C0392B, #E74C3C)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 8px 24px rgba(192,57,43,0.4)' }}>🥙</div>
          <span style={{ fontSize: '22px', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>LoyalPass</span>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#E74C3C', marginBottom: '20px' }}>Espace restaurateur</div>
          <h1 style={{ fontSize: '48px', fontWeight: '900', color: 'white', lineHeight: '1.1', letterSpacing: '-1.5px', marginBottom: '20px' }}>
            Fidélisez vos<br />
            <span style={{ background: 'linear-gradient(90deg, #E74C3C, #F39C12)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>clients.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', lineHeight: '1.7', maxWidth: '380px' }}>
            Gérez votre programme de fidélité, suivez vos clients et boostez vos revenus — tout depuis un seul dashboard.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '32px', position: 'relative' }}>
          {[['500+', 'Points / client actif'], ['30%', 'De clients en plus'], ['2min', 'Pour démarrer']].map(([val, lbl]) => (
            <div key={lbl}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>{val}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Droite */}
      <div style={{ background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 80px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Modal mot de passe oublié */}
          {showForgot && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <div style={{ background: 'white', borderRadius: 20, padding: 36, maxWidth: 400, width: '100%', margin: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                {!forgotSent ? <>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: '#1A1A2E', marginBottom: 8 }}>Mot de passe oublié</h3>
                  <p style={{ fontSize: 14, color: '#9B9BB4', marginBottom: 24, lineHeight: 1.6 }}>Entrez votre adresse email. Vous recevrez un lien pour réinitialiser votre mot de passe.</p>
                  <input type="email" placeholder="Votre adresse email" value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleForgot()}
                    style={{ width: '100%', padding: '13px 16px', borderRadius: 11, border: '1.5px solid #EAEAF0', fontSize: 14, outline: 'none', fontFamily: 'Outfit, sans-serif', marginBottom: 16 }}
                    onFocus={e => e.target.style.borderColor = '#C0392B'}
                    onBlur={e => e.target.style.borderColor = '#EAEAF0'}
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={handleForgot} disabled={forgotLoading} style={{ flex: 1, background: 'linear-gradient(135deg, #C0392B, #E74C3C)', color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                      {forgotLoading ? '⏳...' : 'Envoyer le lien'}
                    </button>
                    <button onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }} style={{ flex: 1, background: '#F8F9FA', color: '#1A1A2E', border: '1px solid #EAEAF0', borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                      Annuler
                    </button>
                  </div>
                </> : <>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <svg width="24" height="24" fill="none" stroke="#059669" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1A1A2E', marginBottom: 8 }}>Email envoyé !</h3>
                    <p style={{ fontSize: 14, color: '#9B9BB4', lineHeight: 1.6, marginBottom: 20 }}>
                      Vérifiez votre boîte mail à <strong>{forgotEmail}</strong>. Le lien est valable 1 heure.
                    </p>
                    <button onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }} style={{ background: 'linear-gradient(135deg, #C0392B, #E74C3C)', color: 'white', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                      Fermer
                    </button>
                  </div>
                </>}
              </div>
            </div>
          )}

          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1A1A2E', marginBottom: '6px', letterSpacing: '-0.5px' }}>
            {mode === 'connexion' ? 'Bon retour 👋' : 'Créer un compte'}
          </h2>
          <p style={{ color: '#9B9BB4', fontSize: '14px', marginBottom: '32px' }}>
            {mode === 'connexion' ? 'Connectez-vous à votre espace restaurateur' : 'Démarrez votre programme de fidélité'}
          </p>

          <div style={{ display: 'flex', background: 'white', borderRadius: '12px', padding: '4px', marginBottom: '28px', border: '1px solid #EAEAF0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {['connexion', 'inscription'].map(m => (
              <button key={m} onClick={() => { setMode(m); setErreurs({}); }} style={{
                flex: 1, padding: '10px', borderRadius: '9px', border: 'none',
                background: mode === m ? 'linear-gradient(135deg, #C0392B, #E74C3C)' : 'transparent',
                color: mode === m ? 'white' : '#9B9BB4',
                fontWeight: '700', fontSize: '13.5px', transition: 'all 0.25s ease',
                boxShadow: mode === m ? '0 4px 12px rgba(192,57,43,0.3)' : 'none',
                fontFamily: 'Outfit, sans-serif', cursor: 'pointer',
              }}>
                {m === 'connexion' ? 'Se connecter' : "S'inscrire"}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {mode === 'inscription' && <>
              <div>
                <input placeholder="Nom du restaurant" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} onKeyDown={handleKeyDown}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: '11px', border: `1.5px solid ${erreurs.nom ? '#E74C3C' : '#EAEAF0'}`, fontSize: '14px', outline: 'none', background: 'white', color: '#1A1A2E', fontFamily: 'Outfit, sans-serif' }}
                  onFocus={e => e.target.style.borderColor = '#C0392B'}
                  onBlur={e => e.target.style.borderColor = erreurs.nom ? '#E74C3C' : '#EAEAF0'}
                />
                {erreurs.nom && <p style={{ fontSize: 12, color: '#E74C3C', marginTop: 4, fontWeight: 600 }}>{erreurs.nom}</p>}
              </div>

              <input placeholder="Adresse complète" value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} onKeyDown={handleKeyDown}
                style={{ width: '100%', padding: '13px 16px', borderRadius: '11px', border: '1.5px solid #EAEAF0', fontSize: '14px', outline: 'none', background: 'white', color: '#1A1A2E', fontFamily: 'Outfit, sans-serif' }}
                onFocus={e => e.target.style.borderColor = '#C0392B'}
                onBlur={e => e.target.style.borderColor = '#EAEAF0'}
              />

              <div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={form.indicatif} onChange={e => setForm({...form, indicatif: e.target.value})}
                    style={{ width: '140px', padding: '13px 10px', borderRadius: '11px', border: '1.5px solid #EAEAF0', fontSize: '13px', outline: 'none', background: 'white', color: '#1A1A2E', fontFamily: 'Outfit, sans-serif', cursor: 'pointer', flexShrink: 0 }}>
                    {INDICATIFS.map(i => (
                      <option key={i.code} value={i.code}>{i.code} — {i.pays}</option>
                    ))}
                  </select>
                  <input placeholder="Numéro" value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value.replace(/[^0-9]/g, '')})} onKeyDown={handleKeyDown}
                    style={{ flex: 1, padding: '13px 16px', borderRadius: '11px', border: `1.5px solid ${erreurs.telephone ? '#E74C3C' : '#EAEAF0'}`, fontSize: '14px', outline: 'none', background: 'white', color: '#1A1A2E', fontFamily: 'Outfit, sans-serif' }}
                    onFocus={e => e.target.style.borderColor = '#C0392B'}
                    onBlur={e => e.target.style.borderColor = erreurs.telephone ? '#E74C3C' : '#EAEAF0'}
                  />
                </div>
                {erreurs.telephone && <p style={{ fontSize: 12, color: '#E74C3C', marginTop: 4, fontWeight: 600 }}>{erreurs.telephone}</p>}
              </div>
            </>}

            <div>
              <input placeholder="Adresse email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} onKeyDown={handleKeyDown}
                style={{ width: '100%', padding: '13px 16px', borderRadius: '11px', border: `1.5px solid ${erreurs.email ? '#E74C3C' : '#EAEAF0'}`, fontSize: '14px', outline: 'none', background: 'white', color: '#1A1A2E', fontFamily: 'Outfit, sans-serif' }}
                onFocus={e => e.target.style.borderColor = '#C0392B'}
                onBlur={e => e.target.style.borderColor = erreurs.email ? '#E74C3C' : '#EAEAF0'}
              />
              {erreurs.email && <p style={{ fontSize: 12, color: '#E74C3C', marginTop: 4, fontWeight: 600 }}>{erreurs.email}</p>}
            </div>

            <div>
              <div style={{ position: 'relative' }}>
                <input placeholder="Mot de passe" type={showMdp ? 'text' : 'password'}
                  value={form.mot_de_passe} onChange={e => setForm({...form, mot_de_passe: e.target.value})}
                  onKeyDown={handleKeyDown}
                  style={{ width: '100%', padding: '13px 46px 13px 16px', borderRadius: '11px', border: `1.5px solid ${erreurs.mot_de_passe ? '#E74C3C' : '#EAEAF0'}`, fontSize: '14px', outline: 'none', background: 'white', color: '#1A1A2E', fontFamily: 'Outfit, sans-serif' }}
                  onFocus={e => e.target.style.borderColor = '#C0392B'}
                  onBlur={e => e.target.style.borderColor = erreurs.mot_de_passe ? '#E74C3C' : '#EAEAF0'}
                />
                <button onClick={() => setShowMdp(!showMdp)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9B9BB4', padding: 0, lineHeight: 1 }}>
                  {showMdp ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Critères en rouge/vert */}
              {mode === 'inscription' && mdpTouche && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { ok: mdpCheck.longueur, label: '8 caractères minimum' },
                    { ok: mdpCheck.majuscule, label: 'Une lettre majuscule' },
                    { ok: mdpCheck.chiffre, label: 'Un chiffre' },
                  ].map(({ ok, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: ok ? '#059669' : '#E74C3C', fontWeight: 600, transition: 'color 0.2s' }}>
                      <span style={{ fontSize: 14 }}>{ok ? '✓' : '✕'}</span> {label}
                    </div>
                  ))}
                </div>
              )}
              {erreurs.mot_de_passe && <p style={{ fontSize: 12, color: '#E74C3C', marginTop: 4, fontWeight: 600 }}>{erreurs.mot_de_passe}</p>}
            </div>

            {mode === 'connexion' && (
              <button onClick={() => setShowForgot(true)} style={{ background: 'none', border: 'none', color: '#C0392B', fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'right', fontFamily: 'Outfit, sans-serif', padding: 0, marginTop: -4 }}>
                Mot de passe oublié ?
              </button>
            )}

            <button onClick={handleSubmit} disabled={loading} style={{
              marginTop: '4px', background: loading ? '#ccc' : 'linear-gradient(135deg, #C0392B, #E74C3C)',
              color: 'white', border: 'none', borderRadius: '12px', padding: '15px', fontSize: '15px', fontWeight: '700',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(192,57,43,0.35)', transition: 'all 0.3s ease',
              fontFamily: 'Outfit, sans-serif', cursor: loading ? 'not-allowed' : 'pointer', width: '100%',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              {loading ? '⏳ Connexion...' : mode === 'connexion' ? '→ Se connecter' : '→ Créer mon compte'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
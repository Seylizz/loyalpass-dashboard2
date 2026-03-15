import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';

const validerMotDePasse = (mdp) => ({
  longueur: mdp.length >= 8,
  majuscule: /[A-Z]/.test(mdp),
  chiffre: /[0-9]/.test(mdp),
});

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [mdp, setMdp] = useState('');
  const [mdpConfirm, setMdpConfirm] = useState('');
  const [showMdp, setShowMdp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValide, setTokenValide] = useState(true);
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) setTokenValide(false);
  }, [token]);

  const mdpCheck = validerMotDePasse(mdp);
  const mdpValide = mdpCheck.longueur && mdpCheck.majuscule && mdpCheck.chiffre;

  const handleSubmit = async () => {
    if (!mdpValide) {
      toast.error('Le mot de passe ne respecte pas les critères');
      return;
    }
    if (mdp !== mdpConfirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await API.post('/auth/reset-password', {
        token,
        nouveau_mot_de_passe: mdp,
      });
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur';
      if (msg.includes('invalide') || msg.includes('expiré')) {
        setTokenValide(false);
      } else {
        toast.error(msg);
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', padding: 24 }}>
      <Toaster position="top-right" />

      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #C0392B, #E74C3C)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 8px 24px rgba(192,57,43,0.4)' }}>🥙</div>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E', letterSpacing: '-0.5px' }}>LoyalPass</span>
        </div>

        <div style={{ background: 'white', borderRadius: 24, padding: '40px 36px', boxShadow: '0 4px 30px rgba(0,0,0,0.08)', border: '1px solid #EAEAF0' }}>

          {/* Token invalide */}
          {!tokenValide && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⛔</div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1A1A2E', marginBottom: 10 }}>Lien invalide ou expiré</h2>
              <p style={{ fontSize: 14, color: '#9B9BB4', lineHeight: 1.7, marginBottom: 24 }}>
                Ce lien de réinitialisation n'est plus valide. Les liens expirent après 1 heure.
              </p>
              <button onClick={() => navigate('/')} style={{ background: 'linear-gradient(135deg, #C0392B, #E74C3C)', color: 'white', border: 'none', borderRadius: 12, padding: '13px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                Retour à la connexion
              </button>
            </div>
          )}

          {/* Succès */}
          {tokenValide && success && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ECFDF5', border: '2px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="28" height="28" fill="none" stroke="#059669" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1A1A2E', marginBottom: 10 }}>Mot de passe modifié !</h2>
              <p style={{ fontSize: 14, color: '#9B9BB4', lineHeight: 1.7, marginBottom: 28 }}>
                Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
              </p>
              <button onClick={() => navigate('/')} style={{ background: 'linear-gradient(135deg, #C0392B, #E74C3C)', color: 'white', border: 'none', borderRadius: 12, padding: '13px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', boxShadow: '0 8px 24px rgba(192,57,43,0.35)' }}>
                → Se connecter
              </button>
            </div>
          )}

          {/* Formulaire */}
          {tokenValide && !success && (
            <>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1A1A2E', marginBottom: 8, letterSpacing: '-0.5px' }}>
                Nouveau mot de passe
              </h2>
              <p style={{ fontSize: 14, color: '#9B9BB4', marginBottom: 28, lineHeight: 1.6 }}>
                Choisissez un mot de passe sécurisé pour votre compte.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Nouveau mot de passe */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E', display: 'block', marginBottom: 8 }}>Nouveau mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showMdp ? 'text' : 'password'}
                      placeholder="Minimum 8 caractères"
                      value={mdp}
                      onChange={e => setMdp(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      style={{ width: '100%', padding: '13px 46px 13px 16px', borderRadius: 11, border: '1.5px solid #EAEAF0', fontSize: 14, outline: 'none', background: '#F8F9FA', color: '#1A1A2E', fontFamily: 'Outfit, sans-serif' }}
                      onFocus={e => e.target.style.borderColor = '#C0392B'}
                      onBlur={e => e.target.style.borderColor = '#EAEAF0'}
                    />
                    <button onClick={() => setShowMdp(!showMdp)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9B9BB4', padding: 0 }}>
                      {showMdp ? '🙈' : '👁️'}
                    </button>
                  </div>

                  {/* Critères */}
                  {mdp.length > 0 && (
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
                </div>

                {/* Confirmation */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E', display: 'block', marginBottom: 8 }}>Confirmer le mot de passe</label>
                  <input
                    type="password"
                    placeholder="Retapez votre mot de passe"
                    value={mdpConfirm}
                    onChange={e => setMdpConfirm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    style={{ width: '100%', padding: '13px 16px', borderRadius: 11, border: `1.5px solid ${mdpConfirm && mdp !== mdpConfirm ? '#E74C3C' : '#EAEAF0'}`, fontSize: 14, outline: 'none', background: '#F8F9FA', color: '#1A1A2E', fontFamily: 'Outfit, sans-serif' }}
                    onFocus={e => e.target.style.borderColor = '#C0392B'}
                    onBlur={e => e.target.style.borderColor = mdpConfirm && mdp !== mdpConfirm ? '#E74C3C' : '#EAEAF0'}
                  />
                  {mdpConfirm && mdp !== mdpConfirm && (
                    <p style={{ fontSize: 12, color: '#E74C3C', marginTop: 4, fontWeight: 600 }}>✕ Les mots de passe ne correspondent pas</p>
                  )}
                  {mdpConfirm && mdp === mdpConfirm && mdpValide && (
                    <p style={{ fontSize: 12, color: '#059669', marginTop: 4, fontWeight: 600 }}>✓ Les mots de passe correspondent</p>
                  )}
                </div>

                <button onClick={handleSubmit} disabled={loading} style={{
                  marginTop: 8, background: loading ? '#ccc' : 'linear-gradient(135deg, #C0392B, #E74C3C)',
                  color: 'white', border: 'none', borderRadius: 12,
                  padding: '15px', fontSize: 15, fontWeight: 700,
                  boxShadow: loading ? 'none' : '0 8px 24px rgba(192,57,43,0.35)',
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif',
                  transition: 'all 0.2s',
                }}>
                  {loading ? '⏳ Modification...' : '→ Changer mon mot de passe'}
                </button>

                <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#9B9BB4', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', textAlign: 'center' }}>
                  ← Retour à la connexion
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
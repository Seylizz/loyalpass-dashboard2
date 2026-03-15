import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';

const C = { bg: '#FCFBF8', text: '#2A1610', primary: '#B5281C', border: '#E8E1D5', gray: '#9B8E84' };

export default function VerifierEmail() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [renvoi, setRenvoi] = useState(false);
  const [compteur, setCompteur] = useState(60);
  const [succes, setSucces] = useState(false);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const email = localStorage.getItem('email_a_verifier') || '';

  useEffect(() => {
    if (!email) { navigate('/'); return; }
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (compteur <= 0) return;
    const timer = setInterval(() => setCompteur(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [compteur]);

  const handleChange = (val, index) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);
    // Avancer automatiquement au champ suivant
    if (val && index < 5) inputs.current[index + 1]?.focus();
    // Soumettre automatiquement si tous les champs sont remplis
    if (val && index === 5) {
      const codeComplet = [...newCode].join('');
      if (codeComplet.length === 6) verifier(codeComplet);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setCode(paste.split(''));
      verifier(paste);
    }
  };

  const verifier = async (codeStr) => {
    setLoading(true);
    try {
      await API.post('/auth/verifier-email', { email, code: codeStr });
      setSucces(true);
      localStorage.removeItem('email_a_verifier');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Code invalide');
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    }
    setLoading(false);
  };

  const handleSubmit = () => {
    const codeStr = code.join('');
    if (codeStr.length !== 6) { toast.error('Entrez les 6 chiffres'); return; }
    verifier(codeStr);
  };

  const renvoyer = async () => {
    setRenvoi(true);
    try {
      await API.post('/auth/renvoyer-code', { email });
      toast.success('Nouveau code envoyé !');
      setCompteur(60);
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch { toast.error('Erreur lors du renvoi'); }
    setRenvoi(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Lato, sans-serif', padding: 24 }}>
      <Toaster position="top-right" />

      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, background: C.primary, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(181,40,28,0.4)' }}>
            <svg width="22" height="22" fill="white" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          </div>
          <span style={{ fontSize: 22, fontWeight: 900, color: C.text, letterSpacing: '-0.5px' }}>LoyalPass</span>
        </div>

        <div style={{ background: '#fff', borderRadius: 24, padding: '40px 36px', boxShadow: '0 4px 30px rgba(42,22,16,0.08)', border: `1px solid ${C.border}` }}>

          {succes ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ECFDF5', border: '2px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="28" height="28" fill="none" stroke="#059669" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 10 }}>Email vérifié !</h2>
              <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.7 }}>Votre compte est activé. Redirection vers le dashboard...</p>
            </div>
          ) : (
            <>
              {/* Icône email */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(181,40,28,0.08)', border: `2px solid rgba(181,40,28,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" fill="none" stroke={C.primary} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 8, textAlign: 'center' }}>Vérifiez votre email</h2>
              <p style={{ fontSize: 14, color: C.gray, marginBottom: 28, lineHeight: 1.6, textAlign: 'center' }}>
                Nous avons envoyé un code à 6 chiffres à<br/>
                <strong style={{ color: C.text }}>{email}</strong>
              </p>

              {/* 6 cases de code */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }} onPaste={handlePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1}
                    value={digit}
                    onChange={e => handleChange(e.target.value, i)}
                    onKeyDown={e => handleKeyDown(e, i)}
                    style={{
                      width: 52, height: 60, textAlign: 'center',
                      fontSize: 24, fontWeight: 900, color: C.text,
                      border: `2px solid ${digit ? C.primary : C.border}`,
                      borderRadius: 12, outline: 'none',
                      background: digit ? 'rgba(181,40,28,0.04)' : '#FAFAF8',
                      transition: 'all 0.2s', fontFamily: 'Lato, sans-serif',
                    }}
                    onFocus={e => e.target.style.borderColor = C.primary}
                    onBlur={e => e.target.style.borderColor = digit ? C.primary : C.border}
                  />
                ))}
              </div>

              <button onClick={handleSubmit} disabled={loading || code.join('').length !== 6} style={{
                width: '100%', background: loading || code.join('').length !== 6 ? '#E8E1D5' : C.primary,
                color: loading || code.join('').length !== 6 ? C.gray : '#fff',
                border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 900,
                cursor: loading || code.join('').length !== 6 ? 'not-allowed' : 'pointer',
                fontFamily: 'Lato, sans-serif',
                boxShadow: code.join('').length === 6 && !loading ? '0 8px 20px -6px rgba(181,40,28,0.5)' : 'none',
                transition: 'all 0.2s', marginBottom: 20,
              }}>
                {loading ? 'Vérification...' : 'Confirmer mon email →'}
              </button>

              {/* Renvoyer le code */}
              <div style={{ textAlign: 'center' }}>
                {compteur > 0 ? (
                  <p style={{ fontSize: 13, color: C.gray }}>
                    Renvoyer un code dans <strong style={{ color: C.text }}>{compteur}s</strong>
                  </p>
                ) : (
                  <button onClick={renvoyer} disabled={renvoi} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato, sans-serif' }}>
                    {renvoi ? 'Envoi...' : 'Renvoyer le code'}
                  </button>
                )}
              </div>

              <button onClick={() => navigate('/')} style={{ display: 'block', margin: '16px auto 0', background: 'none', border: 'none', color: C.gray, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Lato, sans-serif' }}>
                ← Retour à la connexion
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
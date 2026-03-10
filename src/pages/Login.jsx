import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';

export default function Login() {
  const [mode, setMode] = useState('connexion');
  const [form, setForm] = useState({ nom: '', adresse: '', telephone: '', email: '', mot_de_passe: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const endpoint = mode === 'connexion' ? '/auth/connexion' : '/auth/inscription';
      const { data } = await API.post(endpoint, form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('restaurant', JSON.stringify(data.restaurant));
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de connexion');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      fontFamily: 'Outfit, sans-serif',
    }}>
      <Toaster position="top-right" toastOptions={{
        style: { fontFamily: 'Outfit, sans-serif', fontWeight: '600' }
      }} />

      {/* Gauche — Branding */}
      <div style={{
        background: 'linear-gradient(160deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Cercles décoratifs */}
        <div style={{
          position: 'absolute', width: '400px', height: '400px',
          borderRadius: '50%', background: 'rgba(192,57,43,0.12)',
          top: '-100px', right: '-100px', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', width: '250px', height: '250px',
          borderRadius: '50%', background: 'rgba(192,57,43,0.07)',
          bottom: '80px', left: '-60px', pointerEvents: 'none'
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <div style={{
            width: '44px', height: '44px',
            background: 'linear-gradient(135deg, #C0392B, #E74C3C)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px',
            boxShadow: '0 8px 24px rgba(192,57,43,0.4)'
          }}>🥙</div>
          <span style={{ fontSize: '22px', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>
            LoyalPass
          </span>
        </div>

        {/* Texte central */}
        <div style={{ position: 'relative' }}>
          <div style={{
            fontSize: '11px', fontWeight: '700', letterSpacing: '3px',
            textTransform: 'uppercase', color: '#E74C3C', marginBottom: '20px'
          }}>
            Espace restaurateur
          </div>
          <h1 style={{
            fontSize: '48px', fontWeight: '900', color: 'white',
            lineHeight: '1.1', letterSpacing: '-1.5px', marginBottom: '20px'
          }}>
            Fidélisez vos<br />
            <span style={{
              background: 'linear-gradient(90deg, #E74C3C, #F39C12)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>clients.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', lineHeight: '1.7', maxWidth: '380px' }}>
            Gérez votre programme de fidélité, suivez vos clients et boostez vos revenus — tout depuis un seul dashboard.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '32px', position: 'relative' }}>
          {[['500+', 'Points / client actif'], ['30%', 'De clients en plus'], ['2min', 'Pour démarrer']].map(([val, lbl]) => (
            <div key={lbl}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>{val}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Droite — Formulaire */}
      <div style={{
        background: '#F8F9FA',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '60px 80px',
      }}>
        <div style={{ width: '100%', maxWidth: '400px', animation: 'fadeUp 0.6s ease' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1A1A2E', marginBottom: '6px', letterSpacing: '-0.5px' }}>
            {mode === 'connexion' ? 'Bon retour 👋' : 'Créer un compte'}
          </h2>
          <p style={{ color: '#9B9BB4', fontSize: '14px', marginBottom: '32px' }}>
            {mode === 'connexion' ? 'Connectez-vous à votre espace restaurateur' : 'Démarrez votre programme de fidélité'}
          </p>

          {/* Toggle */}
          <div style={{
            display: 'flex', background: 'white', borderRadius: '12px',
            padding: '4px', marginBottom: '28px',
            border: '1px solid #EAEAF0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}>
            {['connexion', 'inscription'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '10px', borderRadius: '9px', border: 'none',
                background: mode === m ? 'linear-gradient(135deg, #C0392B, #E74C3C)' : 'transparent',
                color: mode === m ? 'white' : '#9B9BB4',
                fontWeight: '700', fontSize: '13.5px',
                transition: 'all 0.25s ease',
                boxShadow: mode === m ? '0 4px 12px rgba(192,57,43,0.3)' : 'none',
                fontFamily: 'Outfit, sans-serif',
              }}>
                {m === 'connexion' ? 'Se connecter' : "S'inscrire"}
              </button>
            ))}
          </div>

          {/* Champs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mode === 'inscription' && <>
              <Input placeholder="Nom du restaurant" value={form.nom} onChange={v => setForm({...form, nom: v})} />
              <Input placeholder="Adresse complète" value={form.adresse} onChange={v => setForm({...form, adresse: v})} />
              <Input placeholder="Téléphone" value={form.telephone} onChange={v => setForm({...form, telephone: v})} />
            </>}
            <Input placeholder="Adresse email" type="email" value={form.email} onChange={v => setForm({...form, email: v})} />
            <Input placeholder="Mot de passe" type="password" value={form.mot_de_passe} onChange={v => setForm({...form, mot_de_passe: v})} />

            <button onClick={handleSubmit} disabled={loading} style={{
              marginTop: '8px',
              background: loading ? '#ccc' : 'linear-gradient(135deg, #C0392B, #E74C3C)',
              color: 'white', border: 'none', borderRadius: '12px',
              padding: '15px', fontSize: '15px', fontWeight: '700',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(192,57,43,0.35)',
              transition: 'all 0.3s ease',
              transform: loading ? 'none' : undefined,
              fontFamily: 'Outfit, sans-serif',
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

function Input({ placeholder, type = 'text', value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        padding: '13px 16px',
        borderRadius: '11px',
        border: `1.5px solid ${focused ? '#C0392B' : '#EAEAF0'}`,
        fontSize: '14px',
        outline: 'none',
        width: '100%',
        background: 'white',
        color: '#1A1A2E',
        transition: 'all 0.2s ease',
        boxShadow: focused ? '0 0 0 3px rgba(192,57,43,0.1)' : 'none',
        fontFamily: 'Outfit, sans-serif',
      }}
    />
  );
}
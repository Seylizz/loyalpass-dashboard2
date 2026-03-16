import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';

const C = { bg: '#FCFBF8', text: '#2A1610', primary: '#B5281C', amber: '#D97706', border: '#E8E1D5', gray: '#9B8E84' };

const IconCheck = () => <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>;
const IconSettings = () => <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;

const PLANS = [
  { id: 'starter', nom: 'Starter', prix: '29', desc: 'Pour démarrer', features: ["Jusqu'à 200 clients", 'QR code comptoir', 'Dashboard web', 'Google Wallet', 'Support email'], populaire: false },
  { id: 'pro', nom: 'Pro', prix: '59', desc: 'Pour les restaurants actifs', features: ['Clients illimités', 'Apple + Google Wallet', 'Scanner QR caisse', 'Notifications push', 'Stats avancées', 'Support prioritaire'], populaire: true },
  { id: 'premium', nom: 'Premium', prix: '99', desc: 'Pour les chaînes', features: ['Multi-établissements', 'API complète', 'App mobile caissier', 'Intégration caisse', 'Manager dédié', 'SLA 99.9%'], populaire: false },
];

export default function Abonnement() {
  const [abonnement, setAbonnement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(null);

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    try {
      const { data } = await API.get('/stripe/abonnement');
      setAbonnement(data.abonnement);
    } catch { toast.error('Erreur chargement abonnement'); }
    setLoading(false);
  };

  const souscrire = async (planId) => {
    setLoadingPlan(planId);
    try {
      const { data } = await API.post('/stripe/creer-session', { plan: planId });
      window.location.href = data.url;
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur Stripe'); setLoadingPlan(null); }
  };

  const ouvrirPortail = async () => {
    try {
      const { data } = await API.post('/stripe/portail');
      window.open(data.url, '_blank');
    } catch { toast.error('Erreur ouverture portail'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Lato, sans-serif' }}>
      <Toaster position="top-right" />
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #2A1610 0%, #3D1F17 60%, #2A1610 100%)', padding: '36px 32px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(181,40,28,0.15)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(217,119,6,0.1)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Facturation</div>
          <h1 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.8px', marginBottom: 6 }}>Mon abonnement</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>Choisissez le plan adapté à votre restaurant</p>
        </div>
      </div>

      <div className="page-content" style={{ maxWidth: 1100, margin: '-44px auto 0', padding: '0 32px 48px', position: 'relative', zIndex: 10 }}>

        {!loading && abonnement && (
          <div style={{ background: '#fff', borderRadius: 20, padding: '22px 26px', border: `1px solid ${C.border}`, marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, boxShadow: '0 15px 40px -15px rgba(181,40,28,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(181,40,28,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 17, color: C.text }}>Plan {abonnement.plan === 'trial' ? 'Essai gratuit' : abonnement.plan}</div>
                <div style={{ fontSize: 13, color: C.gray, marginTop: 3 }}>
                  {abonnement.plan === 'trial' ? `Essai jusqu'au ${abonnement.expire_le ? new Date(abonnement.expire_le).toLocaleDateString('fr-FR') : '—'}` : 'Abonnement actif'}
                </div>
              </div>
            </div>
            {abonnement.plan !== 'trial' && (
              <button onClick={ouvrirPortail} style={{ background: '#F3F0EA', border: `1px solid ${C.border}`, color: C.text, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato, sans-serif', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(181,40,28,0.08)'; e.currentTarget.style.color = C.primary; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F3F0EA'; e.currentTarget.style.color = C.text; }}>
                <IconSettings/> Gérer la facturation
              </button>
            )}
          </div>
        )}

        <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {PLANS.map((plan, i) => {
            const estActif = abonnement?.plan === plan.id;
            return (
              <div key={i} style={{ background: plan.populaire ? C.primary : '#fff', borderRadius: 24, padding: '32px 28px', border: estActif ? `2px solid ${C.primary}` : plan.populaire ? 'none' : `1px solid ${C.border}`, boxShadow: plan.populaire ? '0 20px 50px -15px rgba(181,40,28,0.35)' : '0 15px 40px -15px rgba(181,40,28,0.08)', transform: plan.populaire ? 'scale(1.03)' : 'scale(1)', position: 'relative', transition: 'all 0.3s' }}>
                {estActif && <div style={{ position: 'absolute', top: 14, left: 14, background: C.primary, color: '#fff', fontSize: 10, fontWeight: 900, padding: '3px 10px', borderRadius: 99, letterSpacing: 0.5 }}>PLAN ACTUEL</div>}
                {plan.populaire && !estActif && <div style={{ position: 'absolute', top: 14, right: 14, background: C.amber, color: '#fff', fontSize: 10, fontWeight: 900, padding: '3px 10px', borderRadius: 99 }}>POPULAIRE</div>}
                <div style={{ marginTop: estActif ? 20 : 0, marginBottom: 22 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: plan.populaire ? 'rgba(255,255,255,0.55)' : C.gray, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{plan.nom}</div>
                  <div style={{ fontSize: 46, fontWeight: 900, color: plan.populaire ? '#fff' : C.text, letterSpacing: '-2px', lineHeight: 1, marginBottom: 4 }}>
                    {plan.prix}€<span style={{ fontSize: 14, fontWeight: 500, color: plan.populaire ? 'rgba(255,255,255,0.4)' : C.gray, marginLeft: 4 }}>/mois</span>
                  </div>
                  <div style={{ fontSize: 14, color: plan.populaire ? 'rgba(255,255,255,0.55)' : C.gray }}>{plan.desc}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 18, height: 18, borderRadius: 5, background: plan.populaire ? 'rgba(255,255,255,0.18)' : 'rgba(181,40,28,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: plan.populaire ? '#fff' : C.primary, flexShrink: 0 }}><IconCheck/></div>
                      <span style={{ fontSize: 13, color: plan.populaire ? 'rgba(255,255,255,0.8)' : C.text, fontWeight: 500 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => !estActif && souscrire(plan.id)} disabled={estActif||loadingPlan===plan.id} style={{ width: '100%', background: estActif ? 'rgba(255,255,255,0.1)' : plan.populaire ? '#fff' : C.primary, color: estActif ? 'rgba(255,255,255,0.5)' : plan.populaire ? C.primary : '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 900, boxShadow: !estActif && !plan.populaire ? '0 8px 20px -6px rgba(181,40,28,0.4)' : 'none', cursor: estActif ? 'default' : 'pointer', fontFamily: 'Lato, sans-serif', transition: 'all 0.2s' }}>
                  {loadingPlan===plan.id ? 'Redirection...' : estActif ? 'Plan actuel' : `Choisir ${plan.nom} →`}
                </button>
              </div>
            );
          })}
        </div>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: C.gray }}>30 jours gratuits · Sans engagement · Annulation en 1 clic</p>
      </div>
    </div>
  );
}
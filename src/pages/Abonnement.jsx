import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';

const PLANS = [
  {
    id: 'starter', nom: 'Starter', prix: '29', desc: 'Parfait pour démarrer',
    features: ["Jusqu'à 200 clients", 'QR code comptoir', 'Dashboard web', 'Google Wallet', 'Support email'],
    couleur: '#4A4A6A', populaire: false,
  },
  {
    id: 'pro', nom: 'Pro', prix: '59', desc: 'Pour les restaurants actifs',
    features: ['Clients illimités', 'Apple + Google Wallet', 'Scanner QR caisse', 'Notifications push', 'Stats avancées', 'Support prioritaire'],
    couleur: '#C0392B', populaire: true,
  },
  {
    id: 'premium', nom: 'Premium', prix: '99', desc: 'Pour les chaînes',
    features: ['Multi-établissements', 'API complète', 'App mobile caissier', 'Intégration caisse', 'Manager dédié', 'SLA 99.9%'],
    couleur: '#F39C12', populaire: false,
  },
];

export default function Abonnement() {
  const [abonnement, setAbonnement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(null);

  useEffect(() => { chargerAbonnement(); }, []);

  const chargerAbonnement = async () => {
    try {
      const { data } = await API.get('/stripe/abonnement');
      setAbonnement(data.abonnement);
    } catch (err) {
      toast.error('Erreur chargement abonnement');
    }
    setLoading(false);
  };

  const souscrire = async (planId) => {
    setLoadingPlan(planId);
    try {
      const { data } = await API.post('/stripe/creer-session', { plan: planId });
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur Stripe');
      setLoadingPlan(null);
    }
  };

  const ouvrirPortail = async () => {
    try {
      const { data } = await API.post('/stripe/portail');
      window.open(data.url, '_blank');
    } catch (err) {
      toast.error('Erreur ouverture portail');
    }
  };

  const getBadgePlan = (plan) => {
    const badges = { trial: { label: '🆓 Essai gratuit', bg: '#EAF4FB', color: '#2980B9' }, starter: { label: '⭐ Starter', bg: '#F8F9FA', color: '#4A4A6A' }, pro: { label: '🔥 Pro', bg: '#FDEDEC', color: '#C0392B' }, premium: { label: '👑 Premium', bg: '#FEF9E7', color: '#F39C12' }, expired: { label: '❌ Expiré', bg: '#FEF0F0', color: '#E74C3C' } };
    return badges[plan] || badges.trial;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', fontFamily: 'Outfit, sans-serif' }}>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Outfit, sans-serif', fontWeight: '600' } }} />
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px', animation: 'fadeUp 0.5s ease' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#C0392B', marginBottom: '8px' }}>
            Facturation
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#1A1A2E', letterSpacing: '-0.8px' }}>
            Mon abonnement
          </h1>
        </div>

        {/* Statut actuel */}
        {!loading && abonnement && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '1px solid #EAEAF0', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeUp 0.5s ease 0.1s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: getBadgePlan(abonnement.plan).bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                {abonnement.plan === 'trial' ? '🆓' : abonnement.plan === 'pro' ? '🔥' : abonnement.plan === 'premium' ? '👑' : '⭐'}
              </div>
              <div>
                <div style={{ fontWeight: '900', fontSize: '18px', color: '#1A1A2E' }}>
                  Plan {abonnement.plan === 'trial' ? 'Essai gratuit' : abonnement.plan}
                </div>
                <div style={{ fontSize: '13px', color: '#9B9BB4', marginTop: '3px' }}>
                  {abonnement.plan === 'trial' ? `Essai gratuit jusqu'au ${new Date(abonnement.expire_le).toLocaleDateString('fr-FR')}` : abonnement.details?.periode_fin ? `Renouvellement le ${abonnement.details.periode_fin}` : 'Abonnement actif'}
                </div>
              </div>
            </div>
            {abonnement.plan !== 'trial' && (
              <button onClick={ouvrirPortail} style={{
                background: '#F8F9FA', border: '1px solid #EAEAF0',
                color: '#4A4A6A', padding: '10px 20px', borderRadius: '10px',
                fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FDEDEC'; e.currentTarget.style.color = '#C0392B'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F8F9FA'; e.currentTarget.style.color = '#4A4A6A'; }}>
                ⚙️ Gérer la facturation
              </button>
            )}
          </div>
        )}

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {PLANS.map((plan, i) => {
            const estActif = abonnement?.plan === plan.id;
            return (
              <div key={i} style={{
                background: plan.populaire ? 'linear-gradient(160deg, #1A1A2E, #16213E)' : 'white',
                borderRadius: '24px', padding: '36px',
                border: estActif ? `2px solid ${plan.couleur}` : plan.populaire ? 'none' : '1px solid #EAEAF0',
                boxShadow: plan.populaire ? '0 20px 60px rgba(26,26,46,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
                transform: plan.populaire ? 'scale(1.03)' : 'scale(1)',
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.3s ease',
                animation: `fadeUp 0.5s ease ${0.1 + i * 0.1}s both`,
              }}>
                {estActif && (
                  <div style={{ position: 'absolute', top: '16px', left: '16px', background: plan.couleur, color: 'white', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '99px', letterSpacing: '0.5px' }}>
                    PLAN ACTUEL
                  </div>
                )}
                {plan.populaire && !estActif && (
                  <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'linear-gradient(135deg, #C0392B, #E74C3C)', color: 'white', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '99px' }}>
                    POPULAIRE
                  </div>
                )}

                <div style={{ marginTop: estActif ? '24px' : '0', marginBottom: '24px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: plan.populaire ? 'rgba(255,255,255,0.5)' : '#9B9BB4', marginBottom: '8px' }}>{plan.nom}</div>
                  <div style={{ fontSize: '48px', fontWeight: '900', color: plan.populaire ? 'white' : '#1A1A2E', letterSpacing: '-2px', lineHeight: 1, marginBottom: '4px' }}>
                    {plan.prix}€
                    <span style={{ fontSize: '14px', fontWeight: '500', color: plan.populaire ? 'rgba(255,255,255,0.4)' : '#9B9BB4', marginLeft: '4px' }}>/mois</span>
                  </div>
                  <div style={{ fontSize: '14px', color: plan.populaire ? 'rgba(255,255,255,0.5)' : '#9B9BB4' }}>{plan.desc}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '5px', background: plan.populaire ? 'rgba(192,57,43,0.3)' : '#FDEDEC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#C0392B', flexShrink: 0, fontWeight: '800' }}>✓</div>
                      <span style={{ fontSize: '13px', color: plan.populaire ? 'rgba(255,255,255,0.75)' : '#4A4A6A', fontWeight: '500' }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => !estActif && souscrire(plan.id)} disabled={estActif || loadingPlan === plan.id} style={{
                  width: '100%',
                  background: estActif ? 'rgba(255,255,255,0.1)' : plan.populaire ? 'linear-gradient(135deg, #C0392B, #E74C3C)' : '#F8F9FA',
                  color: estActif ? 'rgba(255,255,255,0.5)' : plan.populaire ? 'white' : '#1A1A2E',
                  border: plan.populaire || estActif ? 'none' : '1px solid #EAEAF0',
                  borderRadius: '12px', padding: '14px',
                  fontSize: '14px', fontWeight: '800',
                  boxShadow: !estActif && plan.populaire ? '0 8px 24px rgba(192,57,43,0.35)' : 'none',
                  cursor: estActif ? 'default' : 'pointer',
                  fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s',
                }}>
                  {loadingPlan === plan.id ? '⏳ Redirection...' : estActif ? '✓ Plan actuel' : `Choisir ${plan.nom} →`}
                </button>
              </div>
            );
          })}
        </div>

        <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '13px', color: '#9B9BB4' }}>
          ✓ 30 jours gratuits &nbsp;&nbsp; ✓ Sans engagement &nbsp;&nbsp; ✓ Annulation en 1 clic &nbsp;&nbsp; ✓ Mode test Stripe activé
        </p>
      </div>
    </div>
  );
}
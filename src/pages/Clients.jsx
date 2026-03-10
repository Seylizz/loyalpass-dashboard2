import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import toast, { Toaster } from 'react-hot-toast';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState('');

  useEffect(() => { chargerClients(); }, []);

  const chargerClients = async () => {
    try {
      const { data } = await API.get('/clients');
      setClients(data.clients);
    } catch (err) {
      toast.error('Erreur chargement clients');
    }
    setLoading(false);
  };

  const clientsFiltres = clients.filter(c =>
    c.prenom?.toLowerCase().includes(recherche.toLowerCase()) ||
    c.telephone?.includes(recherche) ||
    c.code_unique?.includes(recherche.toUpperCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', fontFamily: 'Outfit, sans-serif' }}>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Outfit, sans-serif', fontWeight: '600' } }} />
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', animation: 'fadeUp 0.5s ease' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#C0392B', marginBottom: '8px' }}>
              Base clients
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#1A1A2E', letterSpacing: '-0.8px', marginBottom: '6px' }}>
              Mes clients
            </h1>
            <p style={{ color: '#9B9BB4', fontSize: '15px' }}>
              {clients.length} membre{clients.length > 1 ? 's' : ''} inscrit{clients.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Recherche */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px' }}>🔍</span>
            <input
              placeholder="Nom, téléphone ou code..."
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              style={{
                padding: '11px 16px 11px 40px',
                borderRadius: '12px',
                border: '1.5px solid #EAEAF0',
                fontSize: '14px', width: '260px',
                background: 'white', outline: 'none',
                transition: 'border 0.2s',
                fontFamily: 'Outfit, sans-serif', color: '#1A1A2E',
              }}
              onFocus={e => e.target.style.border = '1.5px solid #C0392B'}
              onBlur={e => e.target.style.border = '1.5px solid #EAEAF0'}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ height: '300px', background: 'white', borderRadius: '20px', border: '1px solid #EAEAF0', animation: 'pulse 1.5s ease infinite' }} />
        ) : clientsFiltres.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '20px', border: '1px solid #EAEAF0' }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>👥</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#1A1A2E', marginBottom: '8px' }}>
              {recherche ? 'Aucun résultat' : 'Aucun client encore'}
            </div>
            <div style={{ fontSize: '14px', color: '#9B9BB4' }}>
              {recherche ? 'Essayez un autre terme de recherche' : 'Partagez votre QR code pour que vos clients s\'inscrivent !'}
            </div>
          </div>
        ) : (
          <div style={{
            background: 'white', borderRadius: '20px',
            border: '1px solid #EAEAF0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            animation: 'fadeUp 0.5s ease 0.1s both',
          }}>
            {/* Header tableau */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1.2fr',
              padding: '14px 24px',
              background: '#F8F9FA',
              borderBottom: '1px solid #EAEAF0',
            }}>
              {['Client', 'Téléphone', 'Code', 'Points', 'Visites', 'Inscrit le'].map(h => (
                <div key={h} style={{ fontSize: '11px', fontWeight: '700', color: '#9B9BB4', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</div>
              ))}
            </div>

            {/* Lignes */}
            {clientsFiltres.map((c, i) => (
              <div key={c.id} style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1.2fr',
                padding: '16px 24px',
                borderBottom: i < clientsFiltres.length - 1 ? '1px solid #F8F8FC' : 'none',
                alignItems: 'center',
                transition: 'background 0.2s',
                animation: `fadeUp 0.4s ease ${0.1 + i * 0.04}s both`,
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                {/* Nom */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: `hsl(${(c.prenom?.charCodeAt(0) || 0) * 7 % 360}, 60%, 90%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: '800',
                    color: `hsl(${(c.prenom?.charCodeAt(0) || 0) * 7 % 360}, 60%, 35%)`,
                    flexShrink: 0,
                  }}>
                    {c.prenom?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#1A1A2E' }}>{c.prenom || 'Anonyme'}</div>
                    <div style={{ fontSize: '12px', color: '#9B9BB4' }}>{c.email || '—'}</div>
                  </div>
                </div>

                {/* Téléphone */}
                <div style={{ fontSize: '14px', color: '#4A4A6A', fontWeight: '500' }}>{c.telephone || '—'}</div>

                {/* Code */}
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  background: '#F8F9FA', border: '1px solid #EAEAF0',
                  padding: '4px 8px', borderRadius: '6px',
                  fontSize: '12px', color: '#4A4A6A',
                  display: 'inline-block', letterSpacing: '1px',
                }}>
                  {c.code_unique}
                </div>

                {/* Points */}
                <div>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: '#C0392B', letterSpacing: '-0.5px' }}>{c.points}</span>
                  <span style={{ fontSize: '11px', color: '#9B9BB4', marginLeft: '3px' }}>pts</span>
                </div>

                {/* Visites */}
                <div style={{ fontSize: '14px', color: '#4A4A6A', fontWeight: '600' }}>{c.visites}</div>

                {/* Date */}
                <div style={{ fontSize: '13px', color: '#9B9BB4' }}>
                  {new Date(c.inscrit_le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
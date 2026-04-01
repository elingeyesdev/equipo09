import { useCampaigns } from '../hooks/useCampaigns';
import { CampaignList } from '../components/CampaignList';
import { CampaignForm } from '../components/CampaignForm';
import { Navbar } from '../components/Navbar';
import { useState } from 'react';

export function MyCampaignsPage() {
  const [showForm, setShowForm] = useState(false);
  const { 
    campaigns, 
    loading, 
    error, 
    adding, 
    addError, 
    fetchCampaigns, 
    addCampaign 
  } = useCampaigns();

  return (
    <div className="app-container">
      <Navbar />

      <main className="page-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 className="page-title">Mes de Campañas</h1>
            <p className="page-subtitle">Gestiona y monitorea tus proyectos de recaudación.</p>
          </div>
          {!showForm && campaigns.length > 0 && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Nueva Campaña
            </button>
          )}
        </header>

        {showForm ? (
          <div className="fade-in">
            <CampaignForm 
              onSuccess={addCampaign} 
              onCancel={() => setShowForm(false)} 
              saving={adding}
              saveError={addError}
            />
          </div>
        ) : (
          <div className="fade-in">
            <CampaignList 
              campaigns={campaigns}
              loading={loading}
              error={error}
              onRetry={fetchCampaigns}
              onOpenForm={() => setShowForm(true)}
            />
          </div>
        )}
      </main>
    </div>
  );
}

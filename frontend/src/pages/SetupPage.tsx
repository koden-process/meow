import { CurrencyCanvas } from '../components/setup/currency/CurrencyCanvas';
import { LanesSchema } from '../components/setup/lane/LaneSchema';
import { CardSchema } from '../components/setup/card/CardSchema';
import { AccountSchema } from '../components/setup/account/AccountSchema';
import { Switch, Button, Heading, Divider } from '@adobe/react-spectrum';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { TeamConfigHelper } from '../helpers/TeamConfigHelper';
import { selectToken, selectTeam, selectTeamId } from '../store/Store';
import { IconDownload } from '../components/setup/IconDownload';
import { Translations } from '../Translations';
import { DEFAULT_LANGUAGE } from '../Constants';

export const SetupPage = () => {
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appliedConfigId, setAppliedConfigId] = useState<string | undefined>(undefined);
  const token = useSelector(selectToken);
  const team = useSelector(selectTeam);
  const teamId = useSelector(selectTeamId);

  useEffect(() => {
    if (team && (team as any).appliedConfigId) {
      setAppliedConfigId((team as any).appliedConfigId);
    } else {
      setAppliedConfigId(undefined);
    }
  }, [team]);

  const fetchConfigs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const result = await TeamConfigHelper.listConfigs(token);
      setConfigs(result);
    } catch (e) {
      setError('Erreur lors du chargement des configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [token]);

  const handleExport = async () => {
    if (!token || !teamId) return;
    
    setLoading(true);
    try {
      await TeamConfigHelper.exportConfig(teamId, token);
      await fetchConfigs();
    } catch (e: any) {
      console.error('Erreur détaillée lors de l\'export:', e);
      setError(`Erreur lors de l'export: ${e.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (configId: string) => {
    if (!token || !teamId) return;
    setLoading(true);
    try {
      await TeamConfigHelper.applyConfig(configId, teamId, token);
      setAppliedConfigId(configId);
      await fetchConfigs();
    } catch (e: any) {
      console.error('Erreur détaillée lors de l\'application:', e);
      setError(`Erreur lors de l'application: ${e.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (configId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!token) return;
    if (!confirm('Etes-vous sur de vouloir supprimer cette configuration ?')) return;
    
    setLoading(true);
    try {
      await TeamConfigHelper.deleteConfig(configId, token);
      await fetchConfigs();
    } catch (e: any) {
      console.error('Erreur lors de la suppression:', e);
      setError(`Erreur lors de la suppression: ${e.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="canvas">
      <div className="developer-mode">
        <div className="switch">
          <Switch isSelected={isDeveloperMode} onChange={setIsDeveloperMode}>
            {Translations.DeveloperModeLabel[DEFAULT_LANGUAGE]}
          </Switch>
        </div>
        {isDeveloperMode ? (
          <div className="link">
            <a href="https://github.com/nash-md/meow" target="_blank">
              <div style={{}}>
                <IconDownload />
              </div>
              <span>{Translations.DownloadApiDefinitionLabel[DEFAULT_LANGUAGE]}</span>
            </a>
          </div>
        ) : null}
      </div>

      <Divider marginY="size-200" />
      <Heading level={3}>Configuration équipe</Heading>
      {appliedConfigId ? (
        <div style={{ color: 'red', marginBottom: 8, marginTop: 16 }}>
          Cette équipe est verrouillée par la configuration {appliedConfigId}.<br />
          Pour modifier, appliquez une autre configuration.
        </div>
      ) : null}
      <Button variant="primary" onPress={handleExport} isDisabled={loading || !!appliedConfigId} marginTop="size-200" marginBottom="size-200">
        Exporter la configuration de l'équipe
      </Button>
      <div style={{ marginBottom: '16px' }}>
        {configs.map((config) => (
          <div 
            key={config._id} 
            className="team-config-card"
            style={{ 
              opacity: appliedConfigId === config._id ? 0.5 : 1,
              cursor: 'default' // Ne plus permettre le clic sur toute la carte
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {config.name}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>
                  {config.description || 'Aucune description'}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.5, marginBottom: '8px' }}>
                  Créé le : {new Date(config.createdAt).toLocaleDateString()}
                </div>
                {/* Bouton Appliquer */}
                <button
                  onClick={() => handleApply(config._id)}
                  disabled={loading || appliedConfigId === config._id || config.sourceTeamId === teamId}
                  style={{
                    backgroundColor: config.sourceTeamId === teamId ? '#cccccc' : '#007acc',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: (loading || appliedConfigId === config._id || config.sourceTeamId === teamId) ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    opacity: (loading || appliedConfigId === config._id || config.sourceTeamId === teamId) ? 0.5 : 1
                  }}
                  title={config.sourceTeamId === teamId ? "Vous ne pouvez pas appliquer votre propre configuration" : "Appliquer cette configuration"}
                >
                  {appliedConfigId === config._id ? 'Configuration appliquée' : 
                   config.sourceTeamId === teamId ? 'Votre configuration' : 
                   'Appliquer cette configuration'}
                </button>
              </div>
              {config.sourceTeamId === teamId && (
                <button
                  onClick={(e) => handleDelete(config._id, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff4444',
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    marginLeft: '8px'
                  }}
                  title="Supprimer cette configuration"
                  disabled={loading}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {/* Masquer les blocs de configuration si une config est appliquée */}
      {!appliedConfigId && (
        <>
          <CurrencyCanvas />
          <LanesSchema isDeveloperMode={isDeveloperMode} />
          <CardSchema isDeveloperMode={isDeveloperMode} />
          <AccountSchema isDeveloperMode={isDeveloperMode} />
        </>
      )}
    </div>
  );
};

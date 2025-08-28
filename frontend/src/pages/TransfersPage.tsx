import { TransferRequests } from '../components/card/TransferRequests';
import { Translations } from '../Translations';
import { DEFAULT_LANGUAGE } from '../Constants';

export const TransfersPage = () => {
  return (
    <div className="canvas">
      <div style={{ marginBottom: '20px' }}>
        <h1>{Translations.TransfersPageTitle[DEFAULT_LANGUAGE]}</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          {Translations.TransfersPageDescription[DEFAULT_LANGUAGE]}
        </p>
      </div>
      <TransferRequests />
    </div>
  );
};

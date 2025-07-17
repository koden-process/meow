import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { ActionType, showModalError } from './actions/Actions';
import './App.css';
import { ErrorModal } from './components/ErrorModal';
import { Layout } from './components/Layout';
import { SuccessModal } from './components/SuccessModal';
import { AccountsPage } from './pages/AccountsPage';
import { ForecastPage } from './pages/ForecastPage';
import { HirePage } from './pages/HirePage';
import { HomePage } from './pages/HomePage';
import { SetupPage } from './pages/SetupPage';
import { UserSetupPage } from './pages/UserSetupPage';
import { selectTeam, selectToken, store, selectAccounts } from './store/Store';
import { getErrorMessage } from './helpers/ErrorHelper';
import { useSelector } from 'react-redux';
import { getRequestClient } from './helpers/RequestHelper';
import { AllowTeamRegistrationModal } from './components/modal/AllowTeamRegistrationModal';
import { ActivityPage } from './pages/ActivityPage';
import { SelectMappingContext, SelectMappings } from './helpers/SelectMappingContext';
import MobileMain from './MobileMain';
import AddOpportunityMobile from './AddOpportunityMobile';
import AddCommentMobile from './AddCommentMobile';

const MOBILE_SCREEN_THRESHOLD = 900;

function Application() {
  // Mobile screen detection (less than 9 inches, ~900px width as a proxy)
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < MOBILE_SCREEN_THRESHOLD && window.innerHeight < MOBILE_SCREEN_THRESHOLD
  );

  const token = useSelector(selectToken);
  const team = useSelector(selectTeam);
  const accounts = useSelector(selectAccounts);

  // Construction du mapping : { uuidAttribut: { idAccount: nomAccount } }
  const selectMappings: SelectMappings = {};
  accounts.forEach(account => {
    account.references?.forEach(ref => {
      if (!selectMappings[ref.schemaAttributeKey]) {
        selectMappings[ref.schemaAttributeKey] = {};
      }
      selectMappings[ref.schemaAttributeKey][account._id] = account.name;
    });
  });

  const client = getRequestClient(token);

  useEffect(() => {
    const execute = async () => {
      try {
        let users = await client.getUsers();

        store.dispatch({
          type: ActionType.USERS,
          payload: [...users],
        });

        let schemas = await client.fetchSchemas();

        store.dispatch({
          type: ActionType.SCHEMAS,
          payload: [...schemas],
        });

        let accounts = await client.getAccounts();

        store.dispatch({
          type: ActionType.ACCOUNTS,
          payload: [...accounts],
        });

        let lanes = await client.getLanes();

        store.dispatch({
          type: ActionType.LANES,
          payload: [...lanes],
        });
      } catch (error) {
        console.error(error);

        const message = await getErrorMessage(error);

        store.dispatch(showModalError(message));
      }
    };

    if (token) {
      execute();
    }

    return () => {
      client.destroy();
    };
  }, [token]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900 && window.innerHeight < 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/ajouter-opportunite" element={<AddOpportunityMobile />} />
          <Route path="/ajouter-commentaire" element={<AddCommentMobile />} />
          <Route path="*" element={<MobileMain />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    
      <BrowserRouter>
        {team!.isFirstTeam === true ? <AllowTeamRegistrationModal /> : null}
        <Layout>
          <Routes>
            <Route path="/forecast/*" element={<ForecastPage />}></Route>
            <Route path="/setup" element={<SetupPage />}></Route>
            <Route path="/activity" element={<ActivityPage />}></Route>
            <Route path="/user-setup" element={<UserSetupPage />}></Route>
            <Route path="/hire" element={<HirePage />}></Route>
            <Route path="/accounts" element={<AccountsPage />}></Route>
            <Route path="*" element={<HomePage />}></Route>
          </Routes>
        </Layout>
        <SuccessModal />
        <ErrorModal />
      </BrowserRouter>
    
  );
}

export default Application;

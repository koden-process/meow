import { Button, TextField } from '@adobe/react-spectrum';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { showModalError, showModalSuccess } from '../../actions/Actions';
import { selectToken, selectUserId, store } from '../../store/Store';
import { Translations } from '../../Translations';
import { DEFAULT_LANGUAGE } from '../../Constants';
import { getRequestClient } from '../../helpers/RequestHelper';

export const PasswordCanvas = () => {
  const id = useSelector(selectUserId);
  const token = useSelector(selectToken);

  const client = getRequestClient(token);

  const [existing, setExisting] = useState<string>('');
  const [updated, setUpdated] = useState<string>('');
  const [error, setError] = useState<string>('');

  let isValid = useMemo(() => {
    setError('');

    if (existing.length >= 3 && updated.length >= 3) {
      return true;
    }

    return false;
  }, [existing, updated]);

  const save = async () => {
    setExisting('');
    setUpdated('');

    try {
      await client.updatePassword(id!, existing, updated);

      store.dispatch(showModalSuccess(Translations.PasswordChangedConfirmation[DEFAULT_LANGUAGE]));
    } catch (error: any) {
      if (error?.response.status === 401) {
        setError('Current Password is invalid');
      } else {
        store.dispatch(showModalError(error?.toString()));
      }
    }
  };

  return (
    <div className="content-box">
      <h2>Change Your Password</h2>

      <div style={{ marginTop: '10px', width: '200px' }}>
        <TextField
          onChange={setExisting}
          value={existing}
          aria-label="Current Password"
          width="100%"
          type="password"
          key="name"
          label="Current Password"
        />
      </div>

      <div style={{ marginTop: '10px', width: '200px' }}>
        <TextField
          onChange={setUpdated}
          value={updated}
          type="password"
          aria-label="New Password"
          width="100%"
          key="name"
          label="New Password"
        />
      </div>

      <div style={{ marginTop: '10px' }}>
        <Button variant="primary" onPress={save} isDisabled={!isValid}>
          Save
        </Button>
      </div>
      <div style={{ paddingTop: '10px' }}>{error}</div>
    </div>
  );
};

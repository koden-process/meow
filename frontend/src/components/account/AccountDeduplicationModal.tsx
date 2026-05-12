import {
  Button,
  ButtonGroup,
  Content,
  Dialog,
  DialogContainer,
  Heading,
  Item,
} from '@adobe/react-spectrum';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { ActionType, showModalSuccess } from '../../actions/Actions';
import { getErrorMessage } from '../../helpers/ErrorHelper';
import { getRequestClient } from '../../helpers/RequestHelper';
import { Account } from '../../interfaces/Account';
import { DEFAULT_LANGUAGE } from '../../Constants';
import { selectToken, store } from '../../store/Store';
import { Translations } from '../../Translations';
import { SafeComboBox } from '../common/SafeSpectrumFields';

export interface AccountDeduplicationModalProps {
  accounts: Account[];
  isOpen: boolean;
  onClose: () => void;
}

const normalizeName = (name: string): string => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
};

const getDuplicateGroups = (accounts: Account[]) => {
  const groups = new Map<string, Account[]>();

  accounts.forEach((account) => {
    const key = normalizeName(account.name);

    if (!key) {
      return;
    }

    groups.set(key, [...(groups.get(key) ?? []), account]);
  });

  return Array.from(groups.values())
    .filter((group) => group.length > 1)
    .map((group) => group.sort((left, right) => left.name.localeCompare(right.name)));
};

export const AccountDeduplicationModal = ({
  accounts,
  isOpen,
  onClose,
}: AccountDeduplicationModalProps) => {
  const token = useSelector(selectToken);
  const client = getRequestClient(token);
  const activeAccounts = useMemo(
    () =>
      accounts
        .filter((account) => account.status !== 'deleted')
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name)),
    [accounts]
  );
  const duplicateGroups = useMemo(() => getDuplicateGroups(activeAccounts), [activeAccounts]);
  const [targetAccountId, setTargetAccountId] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [error, setError] = useState('');
  const [isMerging, setIsMerging] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const firstGroup = duplicateGroups[0];
    setTargetAccountId(firstGroup?.[0]?._id ?? '');
    setSourceAccountId(firstGroup?.[1]?._id ?? '');
    setError('');
    setIsMerging(false);
  }, [isOpen, duplicateGroups]);

  const targetAccount = activeAccounts.find((account) => account._id === targetAccountId);
  const sourceAccount = activeAccounts.find((account) => account._id === sourceAccountId);
  const canMerge =
    !!targetAccountId && !!sourceAccountId && targetAccountId !== sourceAccountId && !isMerging;

  const selectDuplicateGroup = (group: Account[]) => {
    setTargetAccountId(group[0]?._id ?? '');
    setSourceAccountId(group[1]?._id ?? '');
    setError('');
  };

  const merge = async () => {
    if (!canMerge) {
      setError(Translations.AccountMergeInvalidSelection[DEFAULT_LANGUAGE]);
      return;
    }

    setIsMerging(true);
    setError('');

    try {
      await client.mergeAccounts(targetAccountId, sourceAccountId);

      const [updatedAccounts, updatedCards, updatedUsers] = await Promise.all([
        client.getAccounts(),
        client.getCards(),
        client.getUsers(),
      ]);

      store.dispatch({ type: ActionType.ACCOUNTS, payload: updatedAccounts });
      store.dispatch({ type: ActionType.CARDS, payload: updatedCards });
      store.dispatch({ type: ActionType.USERS, payload: updatedUsers });
      store.dispatch(
        showModalSuccess(
          Translations.AccountMergeSuccess[DEFAULT_LANGUAGE]
            .replace('{source}', sourceAccount?.name ?? '')
            .replace('{target}', targetAccount?.name ?? '')
        )
      );
      onClose();
    } catch (error) {
      setError(await getErrorMessage(error));
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <DialogContainer onDismiss={onClose}>
      {isOpen && (
        <Dialog>
          <Heading>{Translations.AccountDeduplicationTitle[DEFAULT_LANGUAGE]}</Heading>
          <Content>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {duplicateGroups.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <strong>{Translations.AccountDuplicateCandidatesLabel[DEFAULT_LANGUAGE]}</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {duplicateGroups.slice(0, 5).map((group) => (
                      <button
                        key={group.map((account) => account._id).join('-')}
                        onClick={() => selectDuplicateGroup(group)}
                        style={{
                          background: 'transparent',
                          border: '1px solid #d0d0d0',
                          borderRadius: 4,
                          cursor: 'pointer',
                          padding: '8px 10px',
                          textAlign: 'left',
                        }}
                        type="button"
                      >
                        {group.map((account) => account.name).join(' / ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <SafeComboBox
                aria-label={Translations.AccountMergeTargetLabel[DEFAULT_LANGUAGE]}
                items={activeAccounts}
                label={Translations.AccountMergeTargetLabel[DEFAULT_LANGUAGE]}
                selectedKey={targetAccountId}
                onSelectionChange={(key) => setTargetAccountId(key ? key.toString() : '')}
              >
                {(account: Account) => (
                  <Item key={account._id} textValue={account.name}>
                    {account.name}
                  </Item>
                )}
              </SafeComboBox>

              <SafeComboBox
                aria-label={Translations.AccountMergeSourceLabel[DEFAULT_LANGUAGE]}
                items={activeAccounts}
                label={Translations.AccountMergeSourceLabel[DEFAULT_LANGUAGE]}
                selectedKey={sourceAccountId}
                onSelectionChange={(key) => setSourceAccountId(key ? key.toString() : '')}
              >
                {(account: Account) => (
                  <Item key={account._id} textValue={account.name}>
                    {account.name}
                  </Item>
                )}
              </SafeComboBox>

              <div style={{ color: '#555', fontSize: 13 }}>
                {Translations.AccountMergeImpactNotice[DEFAULT_LANGUAGE]}
              </div>

              {error && <div style={{ color: '#dc2626', fontSize: 14 }}>{error}</div>}
            </div>
          </Content>
          <ButtonGroup>
            <Button variant="secondary" onPress={onClose}>
              {Translations.CancelButton[DEFAULT_LANGUAGE]}
            </Button>
            <Button variant="cta" onPress={merge} isDisabled={!canMerge}>
              {isMerging
                ? Translations.AccountMergeInProgress[DEFAULT_LANGUAGE]
                : Translations.AccountMergeButton[DEFAULT_LANGUAGE]}
            </Button>
          </ButtonGroup>
        </Dialog>
      )}
    </DialogContainer>
  );
};

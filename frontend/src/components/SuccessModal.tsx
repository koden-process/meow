import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { hideModal } from '../actions/Actions';
import { selectModal, selectModalText, store } from '../store/Store';

type Timeout = ReturnType<typeof setTimeout>;

export const SuccessModal = () => {
  const modal = useSelector(selectModal);
  const text = useSelector(selectModalText);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timer: Timeout | undefined = undefined;

    if (modal === 'success') {
      setIsVisible(true);

      // Si le message contient "supprimée" ou "deleted", on garde le modal ouvert plus longtemps
      const isDeleteMessage = text?.includes('supprimée') || text?.includes('deleted');
      const timeoutDuration = isDeleteMessage ? 4000 : 2000;

      timer = setTimeout(() => {
        setIsVisible(false);

        store.dispatch(hideModal());
      }, timeoutDuration);
    }

    return () => clearTimeout(timer);
  }, [modal, text]);

  return (
    <div
      id="success-modal"
      onClick={() => setIsVisible(false)}
      className={`${isVisible ? 'show' : ''}`}
    >
      <div>{text}</div>
    </div>
  );
};

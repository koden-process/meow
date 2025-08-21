import React from 'react';
import { Button } from '@adobe/react-spectrum';
import { Translations } from '../../Translations';
import { DEFAULT_LANGUAGE } from '../../Constants';
import './DeleteCardModal.css';

export interface DeleteAccountModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  accountName?: string;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  accountName
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content delete-modal">
        <div className="modal-header">
          <h3>⚠️ {Translations.DeleteButton[DEFAULT_LANGUAGE]}</h3>
        </div>
        
        <div className="modal-body">
          <p>{Translations.DeleteAccountConfirmation[DEFAULT_LANGUAGE]}</p>
          {accountName && (
            <p><strong>{accountName}</strong></p>
          )}
        </div>
        
        <div className="modal-footer">
          <Button 
            variant="primary" 
            onPress={onConfirm}
            UNSAFE_className="delete-confirm-button"
          >
            {Translations.ConfirmButton[DEFAULT_LANGUAGE]}
          </Button>
          <Button 
            variant="secondary" 
            onPress={onCancel}
          >
            {Translations.CancelButton[DEFAULT_LANGUAGE]}
          </Button>
        </div>
      </div>
    </div>
  );
};
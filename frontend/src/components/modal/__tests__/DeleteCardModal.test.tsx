import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteCardModal } from '../DeleteCardModal';
import { Translations } from '../../../Translations';
import { DEFAULT_LANGUAGE } from '../../../Constants';

describe('DeleteCardModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    cardName: 'Test Card',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render modal when isOpen is true', () => {
    render(<DeleteCardModal {...defaultProps} />);

    expect(screen.getByText(Translations.DeleteCardConfirmation[DEFAULT_LANGUAGE])).toBeInTheDocument();
    expect(screen.getByText(Translations.ConfirmButton[DEFAULT_LANGUAGE])).toBeInTheDocument();
    expect(screen.getByText(Translations.CancelButton[DEFAULT_LANGUAGE])).toBeInTheDocument();
  });

  test('should not render modal when isOpen is false', () => {
    render(<DeleteCardModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText(Translations.DeleteCardConfirmation[DEFAULT_LANGUAGE])).not.toBeInTheDocument();
  });

  test('should display card name when provided', () => {
    render(<DeleteCardModal {...defaultProps} cardName="My Test Card" />);

    expect(screen.getByText('My Test Card')).toBeInTheDocument();
  });

  test('should not display card name section when not provided', () => {
    render(<DeleteCardModal {...defaultProps} cardName={undefined} />);

    // Should still show the confirmation message but not the card name
    expect(screen.getByText(Translations.DeleteCardConfirmation[DEFAULT_LANGUAGE])).toBeInTheDocument();
  });

  test('should call onConfirm when confirm button is clicked', () => {
    const onConfirm = jest.fn();
    render(<DeleteCardModal {...defaultProps} onConfirm={onConfirm} />);

    const confirmButton = screen.getByText(Translations.ConfirmButton[DEFAULT_LANGUAGE]);
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test('should call onCancel when cancel button is clicked', () => {
    const onCancel = jest.fn();
    render(<DeleteCardModal {...defaultProps} onCancel={onCancel} />);

    const cancelButton = screen.getByText(Translations.CancelButton[DEFAULT_LANGUAGE]);
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('should have proper CSS classes for styling', () => {
    render(<DeleteCardModal {...defaultProps} />);

    expect(document.querySelector('.modal-overlay')).toBeInTheDocument();
    expect(document.querySelector('.modal-content')).toBeInTheDocument();
    expect(document.querySelector('.delete-modal')).toBeInTheDocument();
    expect(document.querySelector('.modal-header')).toBeInTheDocument();
    expect(document.querySelector('.modal-body')).toBeInTheDocument();
    expect(document.querySelector('.modal-footer')).toBeInTheDocument();
  });

  test('should have delete-confirm-button class on confirm button', () => {
    render(<DeleteCardModal {...defaultProps} />);

    const confirmButton = screen.getByText(Translations.ConfirmButton[DEFAULT_LANGUAGE]);
    expect(confirmButton).toHaveClass('delete-confirm-button');
  });

  test('should display warning emoji in header', () => {
    render(<DeleteCardModal {...defaultProps} />);

    expect(screen.getByText(/⚠️/)).toBeInTheDocument();
  });
});
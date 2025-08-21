import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Layer } from '../Layer';
import { ApplicationStore } from '../../../store/ApplicationStore';
import { Card, CardStatus } from '../../../interfaces/Card';
import { User } from '../../../interfaces/User';
import { Lane } from '../../../interfaces/Lane';
import { Translations } from '../../../Translations';
import { DEFAULT_LANGUAGE } from '../../../Constants';
import { cardDeleteListener } from '../../../store/CardDeleteListener';

// Mock the RequestHelper
const mockUpdateCard = jest.fn();
const mockUpdateBoard = jest.fn();
const mockGetCard = jest.fn();

jest.mock('../../../helpers/RequestHelper', () => ({
  getRequestClient: () => ({
    updateCard: mockUpdateCard,
    updateBoard: mockUpdateBoard,
    getCard: mockGetCard,
  }),
}));

// Mock other components
jest.mock('../Form', () => ({
  Form: ({ id, update, onPreviewChange }: any) => (
    <div data-testid="form">Form Component</div>
  ),
}));

jest.mock('../Events', () => ({
  Events: ({ entity, id }: any) => <div data-testid="events">Events Component</div>,
}));

jest.mock('../../Avatar', () => ({
  Avatar: ({ id, width, onClick }: any) => (
    <div data-testid="avatar" onClick={onClick}>
      Avatar
    </div>
  ),
}));

describe('Card Delete Integration Tests', () => {
  let store: any;
  const mockCard: Card = {
    _id: 'card1',
    name: 'Test Card',
    amount: 1000,
    status: CardStatus.Active,
    userId: 'user1',
    laneId: 'lane1',
    teamId: 'team1',
    createdAt: new Date(),
    updatedAt: new Date(),
    inLaneSince: new Date(),
  };

  const mockUser: User = {
    _id: 'user1',
    name: 'Test User',
    teamId: 'team1',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLane: Lane = {
    _id: 'lane1',
    name: 'Test Lane',
    boardId: 'board1',
    teamId: 'team1',
    index: 0,
    tags: { type: 'normal' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGetCard.mockResolvedValue(mockCard);
    mockUpdateCard.mockResolvedValue(mockCard);
    mockUpdateBoard.mockResolvedValue({});

    // Create store with middleware
    store = configureStore({
      reducer: {
        session: () => ({
          token: 'test-token',
          user: mockUser,
        }),
        ui: () => ({
          state: 'card-detail',
          _id: 'card1',
          modal: undefined,
        }),
        cards: () => [mockCard],
        lanes: () => [mockLane],
        users: () => [mockUser],
        schemas: () => [],
        board: () => ({}),
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(cardDeleteListener.middleware),
    });
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(<Provider store={store}>{component}</Provider>);
  };

  test('should complete full delete flow successfully', async () => {
    renderWithProvider(<Layer />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(Translations.DeleteButton[DEFAULT_LANGUAGE])).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByText(Translations.DeleteButton[DEFAULT_LANGUAGE]);
    fireEvent.click(deleteButton);

    // Confirm deletion in modal
    await waitFor(() => {
      expect(screen.getByText(Translations.DeleteCardConfirmation[DEFAULT_LANGUAGE])).toBeInTheDocument();
    });

    const confirmButton = screen.getByText(Translations.ConfirmButton[DEFAULT_LANGUAGE]);
    fireEvent.click(confirmButton);

    // Wait for API calls to complete
    await waitFor(() => {
      expect(mockUpdateCard).toHaveBeenCalledWith({
        ...mockCard,
        status: CardStatus.Deleted,
      });
    });

    expect(mockUpdateBoard).toHaveBeenCalled();
  });

  test('should handle API error during deletion', async () => {
    // Mock API to throw error
    mockUpdateCard.mockRejectedValue(new Error('API Error'));

    renderWithProvider(<Layer />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(Translations.DeleteButton[DEFAULT_LANGUAGE])).toBeInTheDocument();
    });

    // Click delete button and confirm
    const deleteButton = screen.getByText(Translations.DeleteButton[DEFAULT_LANGUAGE]);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      const confirmButton = screen.getByText(Translations.ConfirmButton[DEFAULT_LANGUAGE]);
      fireEvent.click(confirmButton);
    });

    // Wait for error handling
    await waitFor(() => {
      expect(mockUpdateCard).toHaveBeenCalled();
    });

    // Error should be handled by the listener (logged to console)
    expect(mockUpdateCard).toHaveBeenCalledWith({
      ...mockCard,
      status: CardStatus.Deleted,
    });
  });

  test('should not call API when deletion is cancelled', async () => {
    renderWithProvider(<Layer />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(Translations.DeleteButton[DEFAULT_LANGUAGE])).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByText(Translations.DeleteButton[DEFAULT_LANGUAGE]);
    fireEvent.click(deleteButton);

    // Cancel deletion in modal
    await waitFor(() => {
      expect(screen.getByText(Translations.DeleteCardConfirmation[DEFAULT_LANGUAGE])).toBeInTheDocument();
    });

    const cancelButton = screen.getByText(Translations.CancelButton[DEFAULT_LANGUAGE]);
    fireEvent.click(cancelButton);

    // Wait a bit to ensure no API calls are made
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockUpdateCard).not.toHaveBeenCalled();
    expect(mockUpdateBoard).not.toHaveBeenCalled();
  });

  test('should close modal after successful deletion', async () => {
    renderWithProvider(<Layer />);

    // Wait for component to load and click delete
    await waitFor(() => {
      const deleteButton = screen.getByText(Translations.DeleteButton[DEFAULT_LANGUAGE]);
      fireEvent.click(deleteButton);
    });

    // Confirm deletion
    await waitFor(() => {
      const confirmButton = screen.getByText(Translations.ConfirmButton[DEFAULT_LANGUAGE]);
      fireEvent.click(confirmButton);
    });

    // Modal should be closed after deletion
    await waitFor(() => {
      expect(screen.queryByText(Translations.DeleteCardConfirmation[DEFAULT_LANGUAGE])).not.toBeInTheDocument();
    });
  });

  test('should dispatch correct action with card payload', async () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    
    renderWithProvider(<Layer />);

    // Wait for component to load and click delete
    await waitFor(() => {
      const deleteButton = screen.getByText(Translations.DeleteButton[DEFAULT_LANGUAGE]);
      fireEvent.click(deleteButton);
    });

    // Confirm deletion
    await waitFor(() => {
      const confirmButton = screen.getByText(Translations.ConfirmButton[DEFAULT_LANGUAGE]);
      fireEvent.click(confirmButton);
    });

    // Check if correct action was dispatched
    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'CARD_DELETE',
          payload: expect.objectContaining({
            _id: 'card1',
            name: 'Test Card',
            status: CardStatus.Active,
          }),
        })
      );
    });
  });
});
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

// Mock the store
const mockStore = configureStore({
  reducer: {
    session: () => ({
      token: 'test-token',
      user: { _id: 'user1', name: 'Test User' } as User,
    }),
    ui: () => ({
      state: 'card-detail',
      _id: 'card1',
    }),
    cards: () => [
      {
        _id: 'card1',
        name: 'Test Card',
        amount: 1000,
        status: CardStatus.Active,
        userId: 'user1',
        laneId: 'lane1',
      } as Card,
    ],
    lanes: () => [
      {
        _id: 'lane1',
        name: 'Test Lane',
        tags: { type: 'normal' },
      } as Lane,
    ],
    users: () => [{ _id: 'user1', name: 'Test User' } as User],
    schemas: () => [],
  },
});

// Mock components
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

jest.mock('../../../helpers/RequestHelper', () => ({
  getRequestClient: () => ({
    getCard: jest.fn().mockResolvedValue({
      _id: 'card1',
      name: 'Test Card',
      amount: 1000,
      status: CardStatus.Active,
    }),
    createCard: jest.fn(),
    updateCard: jest.fn(),
  }),
}));

describe('Layer Component - Delete Functionality', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(<Provider store={mockStore}>{component}</Provider>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show delete button for existing cards', async () => {
    renderWithProvider(<Layer />);

    await waitFor(() => {
      expect(screen.getByText(Translations.DeleteButton[DEFAULT_LANGUAGE])).toBeInTheDocument();
    });
  });

  test('should not show delete button for new cards (no id)', async () => {
    // Mock store with no card id
    const storeWithoutId = configureStore({
      reducer: {
        session: () => ({
          token: 'test-token',
          user: { _id: 'user1', name: 'Test User' } as User,
        }),
        ui: () => ({
          state: 'card-detail',
          _id: undefined, // No card id = new card
        }),
        cards: () => [],
        lanes: () => [
          {
            _id: 'lane1',
            name: 'Test Lane',
            tags: { type: 'normal' },
          } as Lane,
        ],
        users: () => [{ _id: 'user1', name: 'Test User' } as User],
        schemas: () => [],
      },
    });

    render(
      <Provider store={storeWithoutId}>
        <Layer />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByText(Translations.DeleteButton[DEFAULT_LANGUAGE])).not.toBeInTheDocument();
    });
  });

  test('should not show delete button when card is disabled', async () => {
    // Mock store with disabled lane
    const storeWithDisabledLane = configureStore({
      reducer: {
        session: () => ({
          token: 'test-token',
          user: { _id: 'user1', name: 'Test User' } as User,
        }),
        ui: () => ({
          state: 'card-detail',
          _id: 'card1',
        }),
        cards: () => [
          {
            _id: 'card1',
            name: 'Test Card',
            amount: 1000,
            status: CardStatus.Active,
            userId: 'user1',
            laneId: 'lane1',
          } as Card,
        ],
        lanes: () => [
          {
            _id: 'lane1',
            name: 'Test Lane',
            tags: { type: 'closed-won' }, // Non-normal type = disabled
          } as Lane,
        ],
        users: () => [{ _id: 'user1', name: 'Test User' } as User],
        schemas: () => [],
      },
    });

    render(
      <Provider store={storeWithDisabledLane}>
        <Layer />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByText(Translations.DeleteButton[DEFAULT_LANGUAGE])).not.toBeInTheDocument();
    });
  });

  test('should open delete modal when delete button is clicked', async () => {
    renderWithProvider(<Layer />);

    await waitFor(() => {
      const deleteButton = screen.getByText(Translations.DeleteButton[DEFAULT_LANGUAGE]);
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(screen.getByText(Translations.DeleteCardConfirmation[DEFAULT_LANGUAGE])).toBeInTheDocument();
      expect(screen.getByText(Translations.ConfirmButton[DEFAULT_LANGUAGE])).toBeInTheDocument();
      expect(screen.getByText(Translations.CancelButton[DEFAULT_LANGUAGE])).toBeInTheDocument();
    });
  });

  test('should close modal when cancel is clicked', async () => {
    renderWithProvider(<Layer />);

    // Open modal
    await waitFor(() => {
      const deleteButton = screen.getByText(Translations.DeleteButton[DEFAULT_LANGUAGE]);
      fireEvent.click(deleteButton);
    });

    // Click cancel
    await waitFor(() => {
      const cancelButton = screen.getByText(Translations.CancelButton[DEFAULT_LANGUAGE]);
      fireEvent.click(cancelButton);
    });

    // Modal should be closed
    await waitFor(() => {
      expect(screen.queryByText(Translations.DeleteCardConfirmation[DEFAULT_LANGUAGE])).not.toBeInTheDocument();
    });
  });

  test('should dispatch delete action when confirm is clicked', async () => {
    const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
    
    renderWithProvider(<Layer />);

    // Open modal
    await waitFor(() => {
      const deleteButton = screen.getByText(Translations.DeleteButton[DEFAULT_LANGUAGE]);
      fireEvent.click(deleteButton);
    });

    // Click confirm
    await waitFor(() => {
      const confirmButton = screen.getByText(Translations.ConfirmButton[DEFAULT_LANGUAGE]);
      fireEvent.click(confirmButton);
    });

    // Check if delete action was dispatched
    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'CARD_DELETE',
          payload: expect.objectContaining({
            _id: 'card1',
            name: 'Test Card',
          }),
        })
      );
    });
  });

  test('should have tooltip on delete button', async () => {
    renderWithProvider(<Layer />);

    await waitFor(() => {
      const deleteButton = screen.getByText(Translations.DeleteButton[DEFAULT_LANGUAGE]);
      expect(deleteButton).toHaveAttribute('title');
      expect(deleteButton.getAttribute('title')).toContain(Translations.DeleteCardConfirmation[DEFAULT_LANGUAGE]);
    });
  });
});
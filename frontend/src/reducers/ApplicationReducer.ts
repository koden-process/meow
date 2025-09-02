import { DateTime } from 'luxon';
import { ActionType, ApplicationAction } from '../actions/Actions';
import { BoardHelper } from '../helpers/BoardHelper';
import { isValidId } from '../helpers/Helper';
import { Account } from '../interfaces/Account';
import { ApplicationState } from '../interfaces/ApplicationState';
import { Card } from '../interfaces/Card';
import { Lane } from '../interfaces/Lane';
import { ListViewSortDirection } from '../interfaces/ListView';
import { User } from '../interfaces/User';
import { InterfaceState } from '../store/ApplicationStore';
import { Default } from '../store/Default';
import { FILTER_BY_NONE } from '../Constants';

export const application = (state = Default, action: ApplicationAction) => {
  switch (action.type) {
    case ActionType.PAGE_LOAD:
      return {
        ...state,
        session: {
          ...state.session,
          token: action.payload.token,
        },
        browser: {
          ...state.browser,
        },
        application: {
          state: <ApplicationState>'uninitialized',
        },
        ui: {
          ...state.ui,
          modal: action.payload.modal,
          text: action.payload.text,
        },
      };

    case ActionType.PAGE_LOAD_VALIDATE_TOKEN:
      return {
        ...state,
        session: {
          ...state.session,
        },
        application: {
          state: <ApplicationState>'validating',
        },
      };

    case ActionType.LOGIN:
      return {
        ...state,
        session: {
          token: action.payload.token,
          alerts: 0,
          user: {
            ...action.payload.user,
          },
          team: {
            ...action.payload.team,
          },
        },
        application: {
          state: <ApplicationState>'authenticated',
        },
        board: { ...action.payload.board },
      };

    case ActionType.LOGOUT:
      return {
        ...state,
        session: {
          token: undefined,
          alerts: 0,
          user: undefined,
          team: undefined,
        },
        application: {
          state: <ApplicationState>'logout',
        },
        cards: [],
        lanes: [],
        users: [],
        board: {},
        schemas: [],
        ui: {
          state: <InterfaceState>'default',
          _id: undefined,
          modal: undefined,
          text: undefined,
          filters: {
            text: '',
            userId: 'all',
            mode: [],
          },
          accounts: {
            sortBy: {
              direction: <ListViewSortDirection>'desc',
              column: undefined,
            },
            filterBy: {},
            columns: [],
          },
          users: {
            sortBy: {
              direction: <ListViewSortDirection>'desc',
              column: undefined,
            },
            filterBy: {},
            columns: [],
          },
          forecast: {
            sortBy: {
              direction: <ListViewSortDirection>'desc',
              column: undefined,
            },
            filterBy: {},
            columns: [],
          },
          date: {
            start: DateTime.now().startOf('month').toISODate(),
            end: DateTime.now().endOf('month').toISODate(),
            userId: FILTER_BY_NONE.key,
          },
        },
      };

    case ActionType.USERS:
      return {
        ...state,
        users: [...action.payload],
      };
    case ActionType.USER_ADD:
      return {
        ...state,
        users: [...state.users, action.payload],
      };

    case ActionType.USER_SETTINGS_UPDATE:
      return {
        ...state,
        session: {
          ...state.session,
          user: { ...action.payload },
        },
        users: [
          ...state.users.map((item: User) => {
            if (item._id === action.payload._id) {
              return { ...action.payload };
            } else {
              return { ...item };
            }
          }),
        ],
      };

    case ActionType.CARDS:
      state.board = BoardHelper.cleanUp(action.payload, state.board);

      action.payload.map((card) => {
        if (!BoardHelper.isOnBoard(card, state.board) && isValidId(card.laneId)) {
          BoardHelper.add(card, state.board);
        }

        if (!BoardHelper.isInCorrectLane(card, state.board)) {
          const position = BoardHelper.getPosition(card, state.board);
          if (position) {
            BoardHelper.move(card, state.board[position.laneId], state.board[card.laneId]);
          }
        }
      });

      return {
        ...state,
        cards: [...action.payload],
        board: {
          ...state.board,
        },
      };

    case ActionType.CARD_ADD:
      if (state.board[action.payload.laneId]) {
        state.board[action.payload.laneId].push(action.payload._id);
      } else {
        state.board[action.payload.laneId] = [action.payload._id];
      }

      return {
        ...state,
        cards: [...state.cards, action.payload],

        ui: {
          ...state.ui,
          state: Default.ui.state,
          id: undefined,
          modal: undefined,
          text: undefined,
        },
        board: {
          ...state.board,
        },
      };

    case ActionType.CARD_MOVE:
      const updated = {
        ...state.board,
      };

      const [from, to] = BoardHelper.move(
        action.payload.card,
        updated[action.payload.from],
        updated[action.payload.to],
        action.payload.index
      );

      updated[action.payload.from] = from;
      updated[action.payload.to] = to;

      return {
        ...state,
        board: updated,
      };

    case ActionType.CARD_UPDATE:
      return {
        ...state,
        cards: [
          ...state.cards.map((item: Card) => {
            if (item._id === action.payload._id) {
              return { ...action.payload };
            } else {
              return { ...item };
            }
          }),
        ],
      };
    case ActionType.CARD_UPDATE_ON_SERVER:
      return {
        ...state,
        cards: [
          ...state.cards.map((item: Card) => {
            if (item._id === action.payload._id) {
              return { ...action.payload };
            } else {
              return { ...item };
            }
          }),
        ],
      };

    case ActionType.CARD_DELETE:
      const board = BoardHelper.remove(action.payload, state.board);

      return {
        ...state,
        cards: [
          ...state.cards.filter((item: Card) => {
            if (item._id !== action.payload._id) {
              return { ...item };
            }
          }),
        ],
        board: {
          ...board,
        },
      };

    case ActionType.ACCOUNTS:
      return {
        ...state,
        accounts: [...action.payload],
      };

    case ActionType.ACCOUNT_UPDATE:
      return {
        ...state,
        accounts: [
          ...state.accounts.map((item: Account) => {
            if (item._id === action.payload._id) {
              return { ...action.payload };
            } else {
              return { ...item };
            }
          }),
        ],
      };

    case ActionType.ACCOUNT_ADD:
      return {
        ...state,
        accounts: [...state.accounts, action.payload],
      };

    case ActionType.TEAM_UPDATE:
      return {
        ...state,
        session: {
          ...state.session,
          team: {
            ...action.payload,
          },
        },
      };

    case ActionType.SCHEMAS:
      return {
        ...state,
        schemas: [...action.payload],
      };

    case ActionType.LANES:
      const lanes = action.payload.sort((a, b) => a.index - b.index);

      return {
        ...state,
        lanes: [...lanes],
      };

    case ActionType.LANE_UPDATE:
      return {
        ...state,
        lanes: [
          ...state.lanes.map((item: Lane) => {
            if (item._id === action.payload._id) {
              return { ...action.payload };
            } else {
              return { ...item };
            }
          }),
        ],
      };

    case ActionType.BROWSER_STATE:
      return {
        ...state,
        browser: { ...state.browser, state: action.payload },
      };
    case ActionType.USER_INTERFACE_STATE:
      // If we're showing the account layer and coming from card-detail, store the previous state
      if (action.payload.state === 'account-detail' && state.ui.state === 'card-detail') {
        return {
          ...state,
          ui: {
            ...state.ui,
            previousState: state.ui.state,
            previousId: state.ui._id,
            state: action.payload.state,
            _id: action.payload._id,
            modal: state.ui.modal,
            text: state.ui.text, // Keep the current text instead of resetting to undefined
          },
        };
      } else if (action.payload.state === 'default' && state.ui.state === 'account-detail' && state.ui.previousState) {
        // If we're hiding the account layer and have a previous state, return to it
        return {
          ...state,
          ui: {
            ...state.ui,
            state: state.ui.previousState,
            _id: state.ui.previousId,
            previousState: undefined,
            previousId: undefined,
            modal: state.ui.modal,
            text: state.ui.text, // Keep the current text instead of resetting to undefined
          },
        };
      } else {
        // Otherwise, just update the state normally
        return {
          ...state,
          ui: {
            ...state.ui,
            state: action.payload.state,
            _id: action.payload._id,
            modal: state.ui.modal,
            text: state.ui.text, // Keep the current text instead of resetting to undefined
          },
        };
      }

    case ActionType.USER_INTERFACE_MODAL:
      return {
        ...state,
        ui: {
          ...state.ui,
          modal: action.payload.modal,
          text: action.payload.text,
        },
      };

    case ActionType.FILTER_UPDATE:
      return {
        ...state,
        ui: {
          ...state.ui,
          filters: {
            mode: [...action.payload.mode],
            text: action.payload.text,
            userId: action.payload.userId,
          },
        },
      };

    case ActionType.LIST_VIEW_SORT_BY:
      return {
        ...state,
        ui: {
          ...state.ui,
          [action.payload.name]: {
            ...state.ui[action.payload.name],
            sortBy: { column: action.payload.column, direction: action.payload.direction },
          },
        },
      };

    case ActionType.LIST_VIEW_FILTER_BY:
      return {
        ...state,
        ui: {
          ...state.ui,
          [action.payload.name]: {
            ...state.ui[action.payload.name],
            filterBy: { text: action.payload.text },
          },
        },
      };

    case ActionType.LIST_VIEW_COLUMNS:
      return {
        ...state,
        ui: {
          ...state.ui,
          [action.payload.name]: {
            ...state.ui[action.payload.name],
            columns: [...action.payload.columns],
          },
        },
      };

    case ActionType.DATE:
      return {
        ...state,
        ui: {
          ...state.ui,
          date: {
            ...action.payload,
          },
        },
      };

    default:
      return state;
  }
};

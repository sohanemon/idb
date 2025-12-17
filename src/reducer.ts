export type IDBState<T> = {
  value: T;
  error: Error | null;
  lastUpdated: Date | null;
};

export type IDBAction<T> =
  | { type: 'UPDATE_VALUE'; value: T }
  | { type: 'SET_ERROR'; error: Error | null }
  | { type: 'LOAD_VALUE'; value: T }
  | { type: 'RESET'; defaultValue: T }
  | { type: 'REFRESH_SUCCESS'; value: T }
  | { type: 'REFRESH_ERROR'; error: Error };

/**
 * Reducer function for managing IDBStorage hook state.
 * Handles state updates, error management, and persistence tracking.
 *
 * @param state - Current state
 * @param action - Action to apply
 * @returns New state after applying the action
 */
export const idbReducer = <T>(
  state: IDBState<T>,
  action: IDBAction<T>,
): IDBState<T> => {
  switch (action.type) {
    case 'UPDATE_VALUE':
      return {
        ...state,
        value: action.value,
        lastUpdated: new Date(),
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'LOAD_VALUE':
      return {
        ...state,
        value: action.value,
        lastUpdated: new Date(),
        error: null,
      };
    case 'RESET':
      return {
        ...state,
        value: action.defaultValue,
        lastUpdated: null,
        error: null,
      };
    case 'REFRESH_SUCCESS':
      return {
        ...state,
        value: action.value,
        lastUpdated: new Date(),
        error: null,
      };
    case 'REFRESH_ERROR':
      return { ...state, error: action.error };
    default:
      return state;
  }
};

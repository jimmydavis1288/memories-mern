import {
  AUTH_ANONYMOUS,
  AUTH_ERROR,
  AUTH_LOADING,
  AUTH_SUCCESS,
} from '../constants/actionTypes';

const initialState = { user: null, status: 'loading', error: '' };

export default (state = initialState, action) => {
  switch (action.type) {
    case AUTH_LOADING:
      return { ...state, status: 'loading', error: '' };
    case AUTH_SUCCESS:
      return { user: action.payload, status: 'authenticated', error: '' };
    case AUTH_ANONYMOUS:
      return { user: null, status: 'anonymous', error: '' };
    case AUTH_ERROR:
      return { ...state, status: state.user ? 'authenticated' : 'anonymous', error: action.payload };
    default:
      return state;
  }
};

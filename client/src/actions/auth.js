import {
  AUTH_ANONYMOUS,
  AUTH_ERROR,
  AUTH_LOADING,
  AUTH_SUCCESS,
} from '../constants/actionTypes';
import * as api from '../api';

const errorMessage = (error) => (
  error.response && error.response.data && error.response.data.message
    ? error.response.data.message
    : 'Unable to reach the server. Please try again.'
);

export const restoreSession = () => async (dispatch) => {
  dispatch({ type: AUTH_LOADING });
  try {
    await api.fetchCsrfToken();
    const { data } = await api.fetchSession();
    dispatch({ type: AUTH_SUCCESS, payload: data.user });
    return data.user;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      dispatch({ type: AUTH_ANONYMOUS });
      return null;
    }

    dispatch({ type: AUTH_ERROR, payload: errorMessage(error) });
    return null;
  }
};

const authenticate = (request) => async (dispatch) => {
  dispatch({ type: AUTH_LOADING });
  try {
    await api.fetchCsrfToken();
    const { data } = await request();
    dispatch({ type: AUTH_SUCCESS, payload: data.user });
    return data.user;
  } catch (error) {
    dispatch({ type: AUTH_ERROR, payload: errorMessage(error) });
    throw error;
  }
};

export const register = (user) => authenticate(() => api.register(user));
export const login = (credentials) => authenticate(() => api.login(credentials));

export const logout = () => async (dispatch) => {
  dispatch({ type: AUTH_LOADING });
  try {
    await api.logout();
    dispatch({ type: AUTH_ANONYMOUS });
  } catch (error) {
    dispatch({ type: AUTH_ERROR, payload: errorMessage(error) });
    throw error;
  }
};

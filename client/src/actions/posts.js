import { FETCH_ALL, CREATE, UPDATE, DELETE, LIKE, UNLIKE } from '../constants/actionTypes';

import * as api from '../api/index.js';

export const getPosts = () => async (dispatch) => {
  const { data } = await api.fetchPosts();

  if (!Array.isArray(data)) {
    throw new Error('The posts API returned an invalid response. Check the configured API URL.');
  }

  dispatch({ type: FETCH_ALL, payload: data });
  return data;
};

export const createPost = (post) => async (dispatch) => {
  const { data } = await api.createPost(post);

  dispatch({ type: CREATE, payload: data });
  return data;
};

export const updatePost = (id, post) => async (dispatch) => {
  const { data } = await api.updatePost(id, post);

  dispatch({ type: UPDATE, payload: data });
  return data;
};

export const likePost = (id) => async (dispatch) => {
  const { data } = await api.likePost(id);

  dispatch({ type: LIKE, payload: data });
  return data;
};

export const unlikePost = (id) => async (dispatch) => {
  const { data } = await api.unlikePost(id);

  dispatch({ type: UNLIKE, payload: data });
  return data;
};

export const deletePost = (id) => async (dispatch) => {
  await api.deletePost(id);

  dispatch({ type: DELETE, payload: id });
  return id;
};

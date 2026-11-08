import axios from 'axios';

const configuredPostsUrl = process.env.REACT_APP_POSTS_API_URL;
const apiRoot = configuredPostsUrl
  ? configuredPostsUrl.replace(/\/posts\/?$/, '')
  : process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : '';

const client = axios.create({
  baseURL: apiRoot,
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  if (!['get', 'head', 'options'].includes((config.method || 'get').toLowerCase())) {
    const csrfCookie = document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith('memories_csrf='));

    if (csrfCookie) {
      config.headers['X-CSRF-Token'] = decodeURIComponent(csrfCookie.slice('memories_csrf='.length));
    }
  }

  return config;
});

const postsUrl = configuredPostsUrl ? '/posts' : '/posts';

export const fetchCsrfToken = () => client.get('/auth/csrf');
export const register = (user) => client.post('/auth/register', user);
export const login = (credentials) => client.post('/auth/login', credentials);
export const fetchSession = () => client.get('/auth/session');
export const logout = () => client.post('/auth/logout');
export const fetchPosts = () => client.get(postsUrl);
export const createPost = (newPost) => client.post(postsUrl, newPost);
export const likePost = (id) => client.patch(`${postsUrl}/${id}/likePost`);
export const unlikePost = (id) => client.delete(`${postsUrl}/${id}/likePost`);
export const updatePost = (id, updatedPost) => client.patch(`${postsUrl}/${id}`, updatedPost);
export const deletePost = (id) => client.delete(`${postsUrl}/${id}`);

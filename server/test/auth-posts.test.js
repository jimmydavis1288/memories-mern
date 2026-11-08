import 'dotenv/config';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { once } from 'node:events';
import { SignJWT } from 'jose';

import app from '../app.js';
import { prisma } from '../lib/prisma.js';

let server;
let baseUrl;
let csrfCookie;
let csrfToken;
const createdUserIds = [];
const createdPostIds = [];

const request = (path, {
  method = 'GET',
  body,
  cookie = csrfCookie,
  token = csrfToken,
  origin = 'http://localhost:3000',
} = {}) => {
  const headers = { Origin: origin };

  if (cookie) {
    headers.Cookie = cookie;
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    headers['X-CSRF-Token'] = token;
  }

  return fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
};

const sessionCookieFrom = (response) => {
  const sessionCookie = response.headers.getSetCookie()
    .find((cookie) => cookie.startsWith('memories_session='));

  assert.ok(sessionCookie, 'authentication response should set an HTTP-only session cookie');
  assert.match(sessionCookie, /HttpOnly/i);
  assert.match(sessionCookie, /SameSite=Lax/i);
  return `${csrfCookie}; ${sessionCookie.split(';')[0]}`;
};

const registerAccount = async (email, fullName) => {
  const response = await request('/auth/register', {
    method: 'POST',
    body: {
      fullName,
      email,
      password: 'StrongPassphrase!2026',
      confirmPassword: 'StrongPassphrase!2026',
    },
  });
  const result = await response.json();

  if (response.status === 201) {
    createdUserIds.push(result.user.id);
  }

  return { response, result };
};

before(async () => {
  await prisma.$connect();
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  const csrfResponse = await fetch(`${baseUrl}/auth/csrf`);
  assert.equal(csrfResponse.status, 200);
  csrfToken = (await csrfResponse.json()).csrfToken;
  const csrfSetCookie = csrfResponse.headers.getSetCookie()
    .find((cookie) => cookie.startsWith('memories_csrf='));
  assert.ok(csrfSetCookie);
  csrfCookie = csrfSetCookie.split(';')[0];
});

after(async () => {
  if (createdPostIds.length) {
    await prisma.post.deleteMany({ where: { id: { in: createdPostIds } } });
  }

  if (createdUserIds.length) {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  }

  if (server) {
    server.close();
    await once(server, 'close');
  }

  await prisma.$disconnect();
});

test('authentication, validation, ownership, likes, and persistence work through the API', async () => {
  for (const origin of [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ]) {
    const originResponse = await request('/auth/csrf', { origin });
    assert.equal(originResponse.status, 200, `${origin} should be trusted in development`);
    assert.equal(originResponse.headers.get('access-control-allow-origin'), origin);
    assert.equal(originResponse.headers.get('access-control-allow-credentials'), 'true');
  }

  const missingCsrf = await request('/auth/register', {
    method: 'POST',
    token: '',
    body: {
      fullName: 'Test User',
      email: 'csrf@example.test',
      password: 'StrongPassphrase!2026',
      confirmPassword: 'StrongPassphrase!2026',
    },
  });
  assert.equal(missingCsrf.status, 403);

  const foreignOrigin = await request('/auth/register', {
    method: 'POST',
    origin: 'https://untrusted.example',
    body: {
      fullName: 'Foreign Origin',
      email: 'foreign@example.test',
      password: 'StrongPassphrase!2026',
      confirmPassword: 'StrongPassphrase!2026',
    },
  });
  assert.equal(foreignOrigin.status, 403);

  const invalidEmail = await registerAccount('not-an-email', 'Invalid Email');
  assert.equal(invalidEmail.response.status, 400);
  assert.match(invalidEmail.result.message, /email/i);

  const weakPassword = await request('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Weak Password',
      email: 'weak@example.test',
      password: 'short',
      confirmPassword: 'short',
    },
  });
  assert.equal(weakPassword.status, 400);

  const mismatchedPassword = await request('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Mismatch User',
      email: 'mismatch@example.test',
      password: 'StrongPassphrase!2026',
      confirmPassword: 'DifferentPassphrase!2026',
    },
  });
  assert.equal(mismatchedPassword.status, 400);

  const noSessionPost = await request('/posts', {
    method: 'POST',
    body: { title: 'Private write', message: 'Requires login' },
  });
  assert.equal(noSessionPost.status, 401);

  const first = await registerAccount('owner@example.test', 'Owner Account');
  assert.equal(first.response.status, 201);
  assert.equal(Object.hasOwn(first.result.user, 'passwordHash'), false);
  const ownerCookie = sessionCookieFrom(first.response);
  const ownerId = first.result.user.id;
  const ownerRecord = await prisma.user.findUnique({ where: { id: ownerId } });
  assert.ok(ownerRecord.passwordHash);
  assert.notEqual(ownerRecord.passwordHash, 'StrongPassphrase!2026');

  const duplicate = await registerAccount('OWNER@example.test', 'Duplicate Account');
  assert.equal(duplicate.response.status, 409);

  const badLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'owner@example.test', password: 'WrongPassphrase!2026' },
  });
  assert.equal(badLogin.status, 401);

  const login = await request('/auth/login', {
    method: 'POST',
    body: { email: 'owner@example.test', password: 'StrongPassphrase!2026' },
  });
  assert.equal(login.status, 200);
  assert.equal(Object.hasOwn((await login.json()).user, 'passwordHash'), false);
  const loggedInCookie = sessionCookieFrom(login);

  const restoredSession = await request('/auth/me', { cookie: loggedInCookie });
  assert.equal(restoredSession.status, 200);
  assert.equal((await restoredSession.json()).user.id, ownerId);

  const invalidJwt = await request('/auth/me', { cookie: `${csrfCookie}; memories_session=invalid` });
  assert.equal(invalidJwt.status, 401);

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const expiredJwt = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(ownerId)
    .setIssuer('memories-api')
    .setAudience('memories-client')
    .setIssuedAt()
    .setExpirationTime('0s')
    .sign(secret);
  const expiredSession = await request('/auth/me', {
    cookie: `${csrfCookie}; memories_session=${expiredJwt}`,
  });
  assert.equal(expiredSession.status, 401);

  const forbiddenBodyFields = await request('/posts', {
    method: 'POST',
    cookie: ownerCookie,
    body: {
      title: 'Spoofed author',
      message: 'Should be rejected',
      authorId: 'somebody-else',
    },
  });
  assert.equal(forbiddenBodyFields.status, 400, JSON.stringify(await forbiddenBodyFields.clone().json()));

  const oversizedImage = await request('/posts', {
    method: 'POST',
    cookie: ownerCookie,
    body: {
      title: 'Oversized image',
      message: 'The image must be rejected.',
      selectedFile: `data:image/png;base64,${'A'.repeat(7_000_004)}`,
    },
  });
  assert.equal(oversizedImage.status, 400);

  const invalidImage = await request('/posts', {
    method: 'POST',
    cookie: ownerCookie,
    body: {
      title: 'Invalid image',
      message: 'Data is not an image.',
      selectedFile: 'data:image/png;base64,dGVzdA==',
    },
  });
  assert.equal(invalidImage.status, 400);

  const create = await request('/posts', {
    method: 'POST',
    cookie: ownerCookie,
    body: {
      title: 'Owner memory',
      message: 'Owned by the authenticated account.',
      tags: ['auth', 'testing'],
      creator: 'A spoofed creator',
    },
  });
  assert.equal(create.status, 400);

  const created = await request('/posts', {
    method: 'POST',
    cookie: ownerCookie,
    body: {
      title: 'Owner memory',
      message: 'Owned by the authenticated account.',
      tags: ['auth', 'testing'],
      selectedFile: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l24AAAAASUVORK5CYII=',
    },
  });
  assert.equal(created.status, 201);
  const post = await created.json();
  createdPostIds.push(post._id);
  assert.equal(post.creator, 'Owner Account');
  assert.equal(post.user.id, ownerId);
  assert.equal(post.likedByMe, false);
  assert.ok(post.selectedFile.startsWith('data:image/png;base64,'));

  const invalidId = await request('/posts/invalid%20id', { cookie: ownerCookie });
  assert.equal(invalidId.status, 400);

  const second = await registerAccount('reader@example.test', 'Reader Account');
  assert.equal(second.response.status, 201);
  const readerCookie = sessionCookieFrom(second.response);

  const readerEdit = await request(`/posts/${post._id}`, {
    method: 'PATCH',
    cookie: readerCookie,
    body: { title: 'Unauthorized edit' },
  });
  assert.equal(readerEdit.status, 403);

  const readerDelete = await request(`/posts/${post._id}`, {
    method: 'DELETE',
    cookie: readerCookie,
  });
  assert.equal(readerDelete.status, 403);

  const readerLike = await request(`/posts/${post._id}/likePost`, {
    method: 'PATCH',
    cookie: readerCookie,
  });
  assert.equal(readerLike.status, 200);
  assert.equal((await readerLike.json()).likeCount, 1);

  const duplicateLike = await request(`/posts/${post._id}/likePost`, {
    method: 'PATCH',
    cookie: readerCookie,
  });
  assert.equal((await duplicateLike.json()).likeCount, 1);

  const readerUnlike = await request(`/posts/${post._id}/likePost`, {
    method: 'DELETE',
    cookie: readerCookie,
  });
  assert.equal((await readerUnlike.json()).likeCount, 0);

  const ownerUpdate = await request(`/posts/${post._id}`, {
    method: 'PATCH',
    cookie: ownerCookie,
    body: { title: 'Updated owner memory' },
  });
  assert.equal(ownerUpdate.status, 200);
  const updatedPost = await ownerUpdate.json();
  assert.equal(updatedPost.title, 'Updated owner memory');
  assert.deepEqual(updatedPost.tags, ['auth', 'testing']);

  const persistedPost = await prisma.post.findUnique({
    where: { id: post._id },
    include: { user: true },
  });
  assert.equal(persistedPost.user.id, ownerId);

  const legacyPost = await prisma.post.create({
    data: { title: 'Unowned legacy post', message: 'Preserved without assigning an owner.' },
  });
  createdPostIds.push(legacyPost.id);
  const legacyEdit = await request(`/posts/${legacyPost.id}`, {
    method: 'PATCH',
    cookie: ownerCookie,
    body: { title: 'Claimed legacy post' },
  });
  assert.equal(legacyEdit.status, 403);

  const logoutResponse = await request('/auth/logout', {
    method: 'POST',
    cookie: ownerCookie,
  });
  assert.equal(logoutResponse.status, 200);
  assert.ok(logoutResponse.headers.getSetCookie().some((cookie) => (
    cookie.startsWith('memories_session=') && /Expires=Thu, 01 Jan 1970/i.test(cookie)
  )));

  const afterLogout = await request('/auth/me', { cookie: csrfCookie });
  assert.equal(afterLogout.status, 401);

  const deleteOwnerPost = await request(`/posts/${post._id}`, {
    method: 'DELETE',
    cookie: ownerCookie,
  });
  assert.equal(deleteOwnerPost.status, 200);
  createdPostIds.splice(createdPostIds.indexOf(post._id), 1);

  const missingPost = await request(`/posts/${post._id}`, { cookie: readerCookie });
  assert.equal(missingPost.status, 404);

  const firstRateLimitedAttempt = await request('/auth/login', {
    method: 'POST',
    body: { email: 'absent@example.test', password: 'IncorrectPassphrase!2026' },
  });
  const secondRateLimitedAttempt = await request('/auth/login', {
    method: 'POST',
    body: { email: 'absent@example.test', password: 'IncorrectPassphrase!2026' },
  });
  const blockedAttempt = await request('/auth/login', {
    method: 'POST',
    body: { email: 'absent@example.test', password: 'IncorrectPassphrase!2026' },
  });
  assert.equal(firstRateLimitedAttempt.status, 401);
  assert.equal(secondRateLimitedAttempt.status, 401);
  assert.equal(blockedAttempt.status, 429);
});

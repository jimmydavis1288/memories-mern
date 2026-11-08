# Memories — authenticated social memories

A full-stack social-memory application with account registration, secure sessions, public posts, and owner-enforced post management.

## What this project demonstrates

- React UI composed from reusable `Form`, `Posts`, and `Post` components.
- Redux + redux-thunk for asynchronous API requests and predictable state updates.
- Express REST API with controller, route, and Prisma layers.
- Neon PostgreSQL persistence through Prisma 7 and the Neon driver adapter.
- bcrypt password hashing, signed JWT sessions in HTTP-only cookies, and CSRF protection.
- Zod request validation, per-user likes, and owner-only post edits/deletes.

## Architecture

```text
React components
  -> Redux thunk actions
  -> Axios API client
  -> Express routes
  -> Controller functions
  -> Prisma Client (Neon adapter)
  -> Neon PostgreSQL
```

See [docs/architecture.md](docs/architecture.md) for the request flow and folder guide. See [docs/interview-guide.md](docs/interview-guide.md) for short study prompts, and [docs/interview-questions.md](docs/interview-questions.md) for a beginner-friendly question bank.

## Project structure

```text
client/                         React application
  src/components/               UI components
  src/actions/                  Redux thunk actions
  src/reducers/                 Redux state updates
  src/api/                      Axios API calls
server/                         Express API
  app.js                        Express application and middleware
  lib/                          Prisma Client setup
  prisma/                       PostgreSQL schema and migrations
  routes/                       Endpoint definitions
  controllers/                  Request handlers and business logic
  middleware/                   Authentication, CSRF, validation, errors
  services/                     Account and password operations
  validators/                   Zod request schemas
  utils/                        JWT and HTTP error utilities
  test/                         Neon-backed API integration tests
docs/                           Architecture and interview notes
```

## Run locally

Prerequisites: Node.js 20+ and a Neon PostgreSQL database.

1. Configure `server/.env` with:

   - `DATABASE_URL`: Neon PostgreSQL connection string.
   - `JWT_SECRET`: a private random secret of at least 32 bytes. Keep it out of source control and logs.
   - `CLIENT_ORIGINS`: comma-separated, exact frontend origins in production.
   - `NODE_ENV=production` in production (enables secure, cross-site cookies).
   - `TRUST_PROXY_HOPS`: only set this to the known number of trusted reverse proxies.

   In development, the API trusts the explicit local origins `http://localhost:3000`,
   `http://localhost:3001`, `http://127.0.0.1:3000`, and `http://127.0.0.1:3001`,
   in addition to any origins configured with `CLIENT_ORIGINS`. Production does not
   add these local origins; configure only the exact deployed frontend origins.

   The local API requires `JWT_SECRET` and does not provide an insecure default.

2. Install backend dependencies and apply database migrations.

   ```powershell
   cd server
   npm install
   npm run db:generate
   npm run db:deploy
   ```

3. Start the API in one terminal.

   ```powershell
   npm start
   ```

   API: `http://localhost:5000/posts`

4. Start React in another terminal.

   ```powershell
   cd client
   npm install
   npm start
   ```

   App: `http://localhost:3000`

In local development, the frontend calls `http://localhost:5000` directly by default so the API receives the browser's exact origin for CORS and CSRF validation. If the API uses a different origin, set `REACT_APP_POSTS_API_URL` to that origin plus `/posts` (for example, `https://api.example.com/posts`) before building; Create React App embeds this value at build time. In production, configure this variable or use a same-origin reverse proxy for `/posts` and `/auth`.

If port 5000 is already occupied, stop the existing server process before running `npm start`.

Run backend API integration tests against the configured Neon database with `npm test`.
Tests create uniquely named accounts and posts and clean up their own records.

## API reference

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/health` | Health check |
| GET | `/auth/csrf` | Issue a CSRF cookie/token before mutations |
| POST | `/auth/register` | Register `{ fullName, email, password, confirmPassword }` |
| POST | `/auth/login` | Sign in with `{ email, password }` |
| GET | `/auth/session` | Restore a browser session (`user` is `null` when signed out) |
| GET | `/auth/me` | Return the authenticated user's public profile |
| POST | `/auth/logout` | Clear the session and CSRF cookies |
| GET | `/posts` | List public posts; includes `likedByMe` for a signed-in user |
| GET | `/posts/:id` | Get one public post |
| POST | `/posts` | Create a post (authenticated; owner comes from the session) |
| PATCH | `/posts/:id` | Edit an owned post |
| DELETE | `/posts/:id` | Delete an owned post |
| PATCH | `/posts/:id/likePost` | Like a post (idempotent per user) |
| DELETE | `/posts/:id/likePost` | Unlike a post |

All unsafe requests require the `memories_csrf` cookie and matching `X-CSRF-Token` header. The browser client sends this header automatically. Authenticated requests use the HTTP-only `memories_session` cookie. Errors use `{ "message": "..." }`; common status codes are 400 (validation), 401 (unauthenticated), 403 (not owner/CSRF), 404 (missing post), 409 (duplicate email), and 429 (authentication rate limit).

## Legacy posts and migrations

The ownership migration adds a nullable `posts.userId` because historic posts have no trustworthy owner. Such posts remain publicly visible but are not editable/deletable by users. New posts always get the authenticated owner. No account is silently assigned to legacy content. The migration is additive and preserves existing post rows and like counts; new likes are tracked in `post_likes`.

For deployments with multiple API instances, replace the in-memory login rate-limit store with a shared store before scaling out. Configure `TRUST_PROXY_HOPS` only when the API is behind a known proxy chain.

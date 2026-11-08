# Architecture walkthrough

## Frontend

| Area | Responsibility |
| --- | --- |
| `components/` | Displays the form and post cards. User events begin here. |
| `components/Auth/` | Registration and login experience. |
| `actions/posts.js` | Redux thunks that call the API and dispatch results. |
| `actions/auth.js` | Redux thunks for session restoration, login, registration, and logout. |
| `api/index.js` | One Axios function per REST endpoint. |
| `reducers/posts.js` | Applies `FETCH_ALL`, `CREATE`, `UPDATE`, `LIKE`, and `DELETE` to the posts array. |
| `App.js` | Fetches posts on load and tracks the post being edited. |

## Backend

| Area | Responsibility |
| --- | --- |
| `app.js` | Configures Express middleware and mounts API routes. |
| `index.js` | Connects Prisma to Neon and starts the API. |
| `routes/` and `controllers/` | Map REST routes to authentication and post operations. |
| `middleware/` | Validates sessions and CSRF, validates request schemas, and maps errors. |
| `validators/` | Defines Zod schemas for auth, posts, IDs, images, and queries. |
| `services/` | Hashes passwords and performs account operations. |
| `lib/prisma.js` | Creates Prisma Client with the Neon driver adapter. |
| `utils/jwt.js` | Signs and verifies expiring JWT sessions. |
| `prisma/schema.prisma` | Defines users, owned posts, and unique per-user likes. |

## Example: liking a post

```text
Post component click
  -> dispatch(likePost(id))
  -> PATCH /posts/:id/likePost (or DELETE to unlike)
  -> controller records a unique user/post like and atomically updates likeCount
  -> updated post returns to Redux
  -> LIKE reducer replaces that single post in state
  -> React re-renders the new count
```

## Why atomic increments matter

Reading a count in application code, adding one, and saving it can lose updates when two users like simultaneously. Prisma's `increment` operation performs the increment in PostgreSQL as one operation.

## Persistence

Posts are stored in Neon PostgreSQL. Prisma migrations in `server/prisma/migrations` manage the schema. `DATABASE_URL` is loaded from `server/.env` and must not be committed.

## Authentication and ownership

Passwords are hashed with bcrypt. Sessions are signed JWTs in HTTP-only cookies; mutating requests additionally require a signed double-submit CSRF token and an allowed browser origin. Public post reads optionally resolve the session so responses can include `likedByMe`. New posts are tied to the authenticated user, and edits/deletes compare that user ID in the database operation. The ownership migration leaves legacy posts ownerless rather than assigning them to an arbitrary account.

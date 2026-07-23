# Memories — MERN CRUD application

A small full-stack social-memory application for creating, editing, liking, and deleting posts. It is intentionally compact so each part of a MERN application can be studied end to end.

## What this project demonstrates

- React UI composed from reusable `Form`, `Posts`, and `Post` components.
- Redux + redux-thunk for asynchronous API requests and predictable state updates.
- Express REST API with controller, route, and Mongoose-model layers.
- MongoDB Atlas persistence, with a local JSON fallback if MongoDB is unavailable.
- Full CRUD operations plus an atomic MongoDB like-counter increment.

## Architecture

```text
React components
  -> Redux thunk actions
  -> Axios API client
  -> Express routes
  -> Controller functions
  -> Mongoose model
  -> MongoDB Atlas
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
  routes/                       Endpoint definitions
  controllers/                  Request handlers and business logic
  models/                       Mongoose schemas/models
  data/                         Local fallback data (not committed)
docs/                           Architecture and interview notes
```

## Run locally

Prerequisites: Node.js 20+ and a MongoDB Atlas cluster (optional when using the fallback store).

1. Set up the API environment.

   ```powershell
   Copy-Item server\.env.example server\.env
   ```

   Update `server/.env` with your Atlas URI. Never commit this file.

2. Start the API in one terminal.

   ```powershell
   cd server
   npm install
   npm start
   ```

   API: `http://localhost:5000/posts`

3. Start React in another terminal.

   ```powershell
   cd client
   npm install
   npm start
   ```

   App: `http://localhost:3000`

If port 5000 is already occupied, stop the existing server process before running `npm start`.

## API reference

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/posts` | Get all posts |
| GET | `/posts/:id` | Get one post |
| POST | `/posts` | Create a post |
| PATCH | `/posts/:id` | Update a post |
| PATCH | `/posts/:id/likePost` | Increment its like count |
| DELETE | `/posts/:id` | Delete a post |

## Notes for production

This is a learning project. Before production, add authentication/authorization, request validation, centralized error handling, tests, pagination, image storage, and environment-specific CORS rules.

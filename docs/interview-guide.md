# Interview study guide

## 60-second project explanation

“Memories is a MERN CRUD application. The React client renders post cards and a form, Redux thunks manage asynchronous Axios calls, and an Express REST API persists posts in Neon PostgreSQL through Prisma 7. The API supports CRUD operations, an atomic like counter, tags, and image uploads.”

## Questions to practise

### Why Redux thunk?

Redux reducers must be synchronous and pure. Thunk lets an action creator perform an asynchronous Axios request first, then dispatch a normal action with the server response.

### Why return the updated document from the API?

The client should show the database's final version of a resource. Returning the updated document lets the reducer replace one post without refetching the full collection.

### How does React update one liked post?

The `LIKE` reducer maps over the array and replaces only the post whose `_id` matches the response. This keeps the update immutable, which makes Redux state changes predictable.

### Why use REST routes and controllers separately?

Routes describe the API surface; controllers contain the behavior. The split makes endpoints easier to scan, test, and extend.

### What would you improve for production?

Add JWT authentication and ownership checks, validate request bodies, store images in object storage, add pagination and indexes, centralize error handling, add integration tests, and deploy client/API separately with restricted CORS.

## Common debugging checklist

1. Frontend cannot load data: verify `http://localhost:5000/posts` returns JSON.
2. `EADDRINUSE`: another process has port 5000; stop it before restarting the server.
3. Database connection fails: verify `DATABASE_URL` in `server/.env` and check Neon connectivity without exposing the URL.
4. A schema change is missing: run `npm run db:deploy` from `server` and check `npx prisma migrate status`.

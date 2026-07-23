# Architecture walkthrough

## Frontend

| Area | Responsibility |
| --- | --- |
| `components/` | Displays the form and post cards. User events begin here. |
| `actions/posts.js` | Redux thunks that call the API and dispatch results. |
| `api/index.js` | One Axios function per REST endpoint. |
| `reducers/posts.js` | Applies `FETCH_ALL`, `CREATE`, `UPDATE`, `LIKE`, and `DELETE` to the posts array. |
| `App.js` | Fetches posts on load and tracks the post being edited. |

## Backend

| Area | Responsibility |
| --- | --- |
| `index.js` | Configures Express middleware, starts the API, and connects to MongoDB. |
| `routes/posts.js` | Maps HTTP verbs and paths to controller functions. |
| `controllers/posts.js` | Validates IDs, coordinates persistence, and sends HTTP responses. |
| `models/postMessage.js` | Defines the MongoDB post document shape. |

## Example: liking a post

```text
Post component click
  -> dispatch(likePost(id))
  -> PATCH /posts/:id/likePost
  -> controller uses $inc to update likeCount atomically
  -> updated post returns to Redux
  -> LIKE reducer replaces that single post in state
  -> React re-renders the new count
```

## Why `$inc` matters

Reading a count in application code, adding one, and saving it can lose updates when two users like simultaneously. MongoDB's `$inc` performs the increment in the database as one operation.

## Persistence modes

When Mongoose is connected, data is stored in MongoDB Atlas. If Atlas is unavailable, the controller uses `server/data/posts.json` so the UI can still be demonstrated locally. This fallback is for development only; it should not be used as a production persistence strategy.

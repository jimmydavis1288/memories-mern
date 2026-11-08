# MERN Memories: beginner interview question bank

Use this document as a study checklist. You do not need to memorize every sentence. First understand the **short answer**, then practise explaining it in your own words with an example from this project.

## 1. Explain the project

### 1. What did you build?

**Short answer:** Memories is a full-stack MERN application where users can create, read, update, like, and delete memory posts.

### 2. What does MERN mean?

**Short answer:** MongoDB stores data, Express provides the backend web framework, React builds the user interface, and Node.js runs JavaScript on the server.

### 3. What happens when a user creates a post?

**Short answer:** The React form dispatches a Redux action, Axios sends a `POST /posts` request, Express routes it to a controller, Mongoose saves it in MongoDB, and Redux updates the screen with the returned post.

### 4. What is CRUD?

**Short answer:** Create, Read, Update, and Delete—the four common operations for stored data.

### 5. Which CRUD operations exist in this project?

**Short answer:** `POST` creates a post, `GET` reads posts, `PATCH` updates and likes posts, and `DELETE` removes a post.

### 6. What is the difference between frontend and backend?

**Short answer:** The frontend is what users see and interact with in the browser. The backend receives requests, applies rules, and reads/writes data.

### 7. Why keep client and server in separate folders?

**Short answer:** They have separate responsibilities, dependencies, and deployment processes. This separation also makes the codebase easier to understand.

## 2. JavaScript and web basics

### 8. What is JavaScript used for here?

**Short answer:** It runs both the React browser app and the Node.js API server.

### 9. What is JSON?

**Short answer:** JavaScript Object Notation is a text format for sending structured data. API requests and responses commonly use JSON.

### 10. What is an API?

**Short answer:** An Application Programming Interface is a contract that lets programs communicate. Here the React app uses the Express API to manage posts.

### 11. What is HTTP?

**Short answer:** HTTP is the web protocol used by browsers and servers to exchange requests and responses.

### 12. What is a request and response?

**Short answer:** A request asks the server to do something; a response contains the result and an HTTP status code.

### 13. What is a URL?

**Short answer:** A web address. `http://localhost:5000/posts` means the local machine, server port 5000, and the posts API path.

### 14. What is `localhost`?

**Short answer:** It means the computer currently running the program. It is useful during development.

### 15. What is a port?

**Short answer:** A port identifies a specific network program on a machine. This project uses 3000 for React and 5000 for Express.

### 16. What does `EADDRINUSE` mean?

**Short answer:** Another process is already using that port. Stop the old server process or use a different port.

### 17. What is asynchronous code?

**Short answer:** It starts work that takes time, such as a network request, without freezing the entire application while waiting.

### 18. What are `async` and `await`?

**Short answer:** `async` marks a function that returns a promise. `await` pauses that function until a promise finishes, making asynchronous code easier to read.

### 19. What is a promise?

**Short answer:** A promise represents a value that will be available later, either successfully or with an error.

### 20. Why use `try/catch` around API and database calls?

**Short answer:** Network and database operations can fail. `try/catch` lets the app handle failure rather than crashing silently.

## 3. React basics

### 21. What is React?

**Short answer:** React is a JavaScript library for building user interfaces from reusable components.

### 22. What is a component?

**Short answer:** A reusable UI unit. In this project, `Post`, `Posts`, and `Form` are components.

### 23. What is JSX?

**Short answer:** JSX looks like HTML inside JavaScript. React converts it into JavaScript instructions for rendering UI.

### 24. What are props?

**Short answer:** Props are values passed from a parent component to a child component. `Post` receives one post through props.

### 25. What is state?

**Short answer:** State is data a component remembers and can change over time. `App` stores `currentId`, the post currently being edited.

### 26. Props vs state?

**Short answer:** Props come from a parent and should not be changed by the child. State belongs to a component and can change.

### 27. What does `useState` do?

**Short answer:** It adds local state to a function component. The form uses it to store typed input values.

### 28. What does `useEffect` do?

**Short answer:** It runs side effects after rendering, such as fetching posts from the API when the app loads.

### 29. Why is a dependency array used with `useEffect`?

**Short answer:** It controls when the effect runs. It prevents unnecessary repeated API calls.

### 30. What is conditional rendering?

**Short answer:** Showing different UI based on data or state. The posts component shows an empty-state message when no posts exist.

### 31. Why use a `key` when mapping posts?

**Short answer:** React uses a stable key, such as `_id`, to efficiently identify which list item changed.

### 32. Why should state be updated immutably?

**Short answer:** React and Redux detect changes by reference. Creating a new array/object avoids unexpected bugs and makes updates predictable.

### 33. What is controlled form input?

**Short answer:** React state holds the input value, and each user change updates that state. This gives React full control of the form.

## 4. Redux and client data flow

### 34. Why use Redux in this project?

**Short answer:** Posts are shared across several components. Redux keeps that shared application state in one predictable store.

### 35. What is the Redux store?

**Short answer:** The central object that holds the current application state.

### 36. What is an action?

**Short answer:** A plain object describing a state change, for example `{ type: 'DELETE', payload: id }`.

### 37. What is a reducer?

**Short answer:** A pure function that receives old state and an action, then returns the next state.

### 38. What does “pure function” mean?

**Short answer:** Given the same input, it gives the same output and does not change external data.

### 39. What is `dispatch`?

**Short answer:** Dispatch sends an action to the Redux store so reducers can update state.

### 40. What is `useSelector`?

**Short answer:** It reads a selected value from the Redux store inside a React component.

### 41. What is Redux Thunk?

**Short answer:** Middleware that lets an action creator run asynchronous code, such as an Axios request, before dispatching a normal action.

### 42. Why not put Axios directly in a reducer?

**Short answer:** Reducers must be synchronous and pure. API calls are asynchronous side effects, so they belong in thunk actions.

### 43. How does the `DELETE` reducer work?

**Short answer:** It filters the posts array and returns every post except the one with the matching ID.

### 44. How does the `LIKE` reducer work?

**Short answer:** It maps over the posts and replaces only the post whose `_id` matches the updated post returned by the API.

## 5. Express and REST API basics

### 45. What is Node.js?

**Short answer:** Node.js is a runtime that lets JavaScript execute outside the browser, including on a server.

### 46. What is Express?

**Short answer:** Express is a Node.js framework for defining middleware and HTTP routes.

### 47. What is middleware?

**Short answer:** A function that runs during request processing. This app uses middleware to parse JSON and allow browser requests through CORS.

### 48. What does `express.json()` or `bodyParser.json()` do?

**Short answer:** It reads JSON request bodies and puts the parsed data in `req.body`.

### 49. What is a route?

**Short answer:** A route connects an HTTP method and path to a handler, such as `router.delete('/:id', deletePost)`.

### 50. What is a controller?

**Short answer:** A controller contains the route’s logic: reading inputs, calling the model, and returning a response.

### 51. Why separate routes from controllers?

**Short answer:** Routes show the API structure clearly; controllers keep business logic separate and easier to test.

### 52. What is a route parameter?

**Short answer:** A dynamic value in a URL. In `/posts/:id`, `id` is available as `req.params.id`.

### 53. What is `req.body`?

**Short answer:** It contains JSON sent by the client, such as a new post’s title and message.

### 54. What is an HTTP status code?

**Short answer:** A number that describes the response result. It helps the client know whether the request succeeded.

### 55. Which status codes should you know?

**Short answer:** `200` success, `201` created, `400` bad input, `401` unauthenticated, `403` forbidden, `404` not found, and `500` server error.

### 56. Why does `http://localhost:5000/` show `Cannot GET /`?

**Short answer:** The API only defines `/posts` routes. There is no handler for the root `/` path.

### 57. What is CORS?

**Short answer:** Browser security rules that control whether one origin, such as port 3000, may request another origin, such as port 5000.

### 58. Why should CORS be restricted in production?

**Short answer:** Allowing every origin is convenient for development but can expose an API to unwanted browser clients.

## 6. MongoDB and Mongoose basics

### 59. What is MongoDB?

**Short answer:** MongoDB is a NoSQL document database. It stores flexible JSON-like documents rather than table rows.

### 60. What is a document?

**Short answer:** A single stored record, similar to one post in `postmessages`.

### 61. What is a collection?

**Short answer:** A group of related documents, similar to a table in a relational database.

### 62. What is Mongoose?

**Short answer:** Mongoose is an ODM (Object Data Modeling) library that connects Node.js to MongoDB and defines schemas/models.

### 63. What is a schema?

**Short answer:** A blueprint for a document’s fields and types. `postMessage.js` defines fields such as `title`, `message`, and `likeCount`.

### 64. What is a model?

**Short answer:** A model is the JavaScript object used to create and query documents based on a schema.

### 65. What is MongoDB’s `_id`?

**Short answer:** MongoDB automatically gives every document a unique identifier called `_id`.

### 66. Why validate `ObjectId` values?

**Short answer:** It avoids invalid database queries and lets the API return a clear `404` response for malformed IDs.

### 67. What does `find()` do?

**Short answer:** It reads documents from a collection. This app uses it to get all posts.

### 68. What does `findByIdAndUpdate()` do?

**Short answer:** It finds one document by ID and updates it.

### 69. What does `findByIdAndDelete()` do?

**Short answer:** It finds one document by ID and deletes it. It replaced the older `findByIdAndRemove()` API.

### 70. What does `$inc` do?

**Short answer:** It increases a numeric MongoDB field without first reading it into application code.

### 71. Why is `$inc` better for likes than `likeCount + 1` in Node?

**Short answer:** `$inc` is atomic. Multiple users can like at once without one update overwriting another.

### 72. What is MongoDB Atlas?

**Short answer:** Atlas is MongoDB’s managed cloud service for hosting clusters and databases.

### 73. Why is an Atlas IP access list needed?

**Short answer:** Atlas blocks database connections unless the connecting public IP is allowed. This protects the database from unknown networks.

### 74. Why use environment variables for the MongoDB URI?

**Short answer:** Credentials must not be hard-coded or committed to Git. Environment variables keep secrets outside source code.

## 7. Project-specific debugging questions

### 75. Why might new posts not appear in the application?

**Short answer:** Check the API response, the server's Neon connection, and the Redux action result. The application stores posts in Neon PostgreSQL through Prisma.

### 76. How do you verify that the API works?

**Short answer:** Open `http://localhost:5000/posts`. A successful API returns JSON, not a React page.

### 77. How do you verify the PostgreSQL schema is current?

**Short answer:** Run `npx prisma migrate status` from `server`, then create and fetch a post through the API.

### 78. What happens when Neon is unavailable?

**Short answer:** The API reports a database error; it does not switch to a separate local store that could split or lose writes.

### 79. How are database operations implemented?

**Short answer:** Express controllers use Prisma Client with the Neon adapter; the like endpoint uses an atomic increment.

### 80. Where are database schema changes tracked?

**Short answer:** In versioned SQL migrations under `server/prisma/migrations`; `DATABASE_URL` stays in the local environment and is not committed.

## 8. Security and production questions

### 81. Is this app secure enough for production?

**Short answer:** No. It is a learning project. It needs authentication, authorization, validation, safer CORS, rate limiting, monitoring, tests, and secure image storage.

### 82. What is authentication?

**Short answer:** Authentication verifies who a user is, for example by signing in with email and password.

### 83. What is authorization?

**Short answer:** Authorization decides what an authenticated user may do, such as allowing only a post owner to edit or delete it.

### 84. Why is client-side validation not enough?

**Short answer:** Anyone can bypass the UI and call the API directly. The server must validate all incoming data.

### 85. How would you store images in production?

**Short answer:** Upload files to object storage such as Cloudinary, S3, or Azure Blob Storage, then save only the image URL in MongoDB.

### 86. Why is storing base64 images in MongoDB not ideal?

**Short answer:** Base64 increases data size and makes database documents heavy. Object storage is cheaper and better for serving media.

### 87. How would you add pagination?

**Short answer:** Accept `page` and `limit` query parameters, then use MongoDB `skip` and `limit` (or cursor pagination) and return pagination metadata.

### 88. What database indexes could help?

**Short answer:** Index fields used for filtering or sorting, such as `createdAt`, while considering the extra write cost of each index.

### 89. How would you test this project?

**Short answer:** Unit-test reducers and controller helpers, integration-test API routes with a test database, and end-to-end-test create/edit/delete flows in the browser.

### 90. How would you deploy it?

**Short answer:** Build and deploy the React client as static files, deploy Express to a Node-compatible host, set environment variables in the host dashboard, and configure production CORS.

## 9. Behavioural and ownership questions

### 91. What was the hardest bug you solved?

**Short answer:** “I diagnosed two separate issues: an old Node process holding port 5000, and Atlas rejecting the server because its current public IP differed from the allowlisted IP. I used port inspection and network tests to separate the problems.”

### 92. What did you learn from this project?

**Short answer:** “I learned the complete request flow in a MERN app, how Redux handles async UI state, how Express routes map to database work, and how configuration/network issues can look like application bugs.”

### 93. What would you build next?

**Short answer:** “I would add login, ownership checks, search and pagination, cloud image storage, tests, and a deployment pipeline.”

### 94. How do you explain a bug to a teammate?

**Short answer:** State the symptom, show the evidence, explain the root cause, describe the fix, and mention how you verified it.

### 95. What should you say if you do not know an interview answer?

**Short answer:** Be honest, explain what you do know, and say how you would verify the missing detail. Do not invent an answer.

## Final revision checklist

- Can you explain the create-post flow without looking at code?
- Can you name the role of React, Redux, Axios, Express, Mongoose, and MongoDB?
- Can you explain why reducers are pure and why thunks handle API calls?
- Can you describe each HTTP method and status code used here?
- Can you explain why `.env` exists and must not be committed?
- Can you explain the difference between authentication and authorization?
- Can you identify one technical improvement for frontend, backend, database, and security?

# Sprint 10: The Data Storm (Track B: Fullstack)

A REST API built with Express and Mongoose that stores data in MongoDB Atlas instead of in-memory arrays.

**Live URL:** https://sprint10mongoose.onrender.com

## Tech Stack
- Node.js and Express
- MongoDB Atlas (M0 free cluster)
- Mongoose (ODM)
- dotenv
- Deployed on Render

## Features
- **Post** model with `title`, `content`, `createdAt`, `authorId`
- **User** model with `name`, `email`
- Relation: `Post.authorId` references `User`, hydrated with `.populate()`
- Custom route that returns the 3 most recent posts

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/users` | Create a user |
| POST | `/posts` | Create a post (`Post.create()`) |
| GET | `/posts` | Get all posts with author details (`Post.find()` + `populate`) |
| GET | `/posts/top` | Get the 3 most recent posts |
| DELETE | `/posts/:id` | Delete a post (`Post.findByIdAndDelete()`) |

### Example request body
```json
{ "title": "My Post", "content": "Hello", "authorId": "<user _id>" }
```

## Run Locally
1. Clone the repo and run `npm install`
2. Create a `.env` file in the root:
```
   MONGO_URI="your_mongodb_atlas_connection_string"
   PORT=5000
```
3. Start the server: `node server.js`

`.env` is listed in `.gitignore`, so credentials are never pushed to GitHub.

## Project Structure
```
sprint10-data-storm/
├── models/
│   ├── Post.js
│   └── User.js
├── server.js
├── package.json
├── Prompts.md
└── README.md
```

## Notes
- Tested all routes with Postman.
- On the Render free plan, the first request after inactivity can take 30-60 seconds.
- AI usage is logged in `Prompts.md`.

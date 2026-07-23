
import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';

import postRoutes from './routes/posts.js';

const app = express();

app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
app.use(cors());

app.use('/posts', postRoutes);

const CONNECTION_URL = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT}`));

const connectToDatabase = async () => {
  if (!CONNECTION_URL) {
    console.log('MONGODB_URI is not set. Using the local fallback store.');
    return;
  }

  try {
    await mongoose.connect(CONNECTION_URL, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.log(`${error.message} did not connect`);
    console.log('Using the local fallback store. Set MONGODB_URI to enable MongoDB persistence.');
  }
};

connectToDatabase();

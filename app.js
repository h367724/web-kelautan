const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const authRoutes = require('./routes/auth');
const kapalRoutes = require('./routes/kapal');

// Load environment variables
dotenv.config();

// Import Firebase SDK
const firebase = require('firebase/app');
require('firebase/analytics');

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// Firebase configuration from .env file
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics();

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

app.locals.db = pool;

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to Web Kelautan API. Use /auth for authentication and /kapal for managing ships.');
});

app.use('/auth', authRoutes);
app.use('/kapal', kapalRoutes);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
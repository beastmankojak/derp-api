const express = require('express');
const { MongoClient } = require('mongodb');
const applyRoutes = require('./webserver/applyRoutes');

const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';

(async () => {
  const mongoClient = new MongoClient(MONGODB_URL);
  try {
    await mongoClient.connect();
    console.log('Connected to database');

    const app = express();
    applyRoutes(app, mongoClient);

    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}...`);
    });
  } catch (err) {
    console.log('Error', err);
    process.exit(1);
  }
})();
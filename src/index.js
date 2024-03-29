const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const applyRoutes = require('./webserver/applyRoutes');
const applyBACRoutes = require('./webserver/applyBACRoutes');
const applyMuggoRoutes = require('./webserver/applyMuggoRoutes');
const applyDrapesRoutes = require('./webserver/applyDrapesRoutes');
const applyEquineRoutes = require('./webserver/applyEquineRoutes');
const applyPredRoutes = require('./webserver/applyPredRoutes');
const applyBaldoRoutes = require('./webserver/applyBaldoRoutes');

const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';

const origin = process.env.NODE_ENV === 'prod' ? [
  /\/\/(www\.)?beastmankojak\.com$/,
  /\/\/(www\.)?muggos\.io$/,
 ] : '*';

(async () => {
  const mongoClient = new MongoClient(MONGODB_URL);
  try {
    await mongoClient.connect();
    console.log('Connected to database');

    const app = express();
    console.log('ENV:', process.env.NODE_ENV);
    app.use(cors({ origin }));
    applyRoutes(app, mongoClient);
    applyBACRoutes(app, mongoClient);
    applyMuggoRoutes(app, mongoClient);
    applyDrapesRoutes(app, mongoClient);
    applyEquineRoutes(app, mongoClient);
    applyPredRoutes(app, mongoClient);
    applyBaldoRoutes(app, mongoClient);

    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}...`);
    });
  } catch (err) {
    console.log('Error', err);
    process.exit(1);
  }
})();
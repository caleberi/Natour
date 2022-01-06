const config = require('./config');
const mongoose = require('mongoose');
const app = require('./app');

const db = config.mongoUseLocal
  ? config.mongoDatabaseLocal
  : config.mongoDatabaseProduction.replace('<MONGO_PASSWORD>', process.env.MONGO_PASSWORD);

function closeServer(server) {
  server.close((err) => {
    if (err) console.log(err);
    console.log('closing server ....');
    process.exit(1);
  });
}
function gracefullyShutdown(server) {
  process.on('SIGTERM', () => {
    closeServer(server);
  });
}

mongoose
  .connect(db, {
    useNewUrlParser: true,
    retryReads: true,
    retryWrites: true,
  })
  .then((_conn) => {
    console.log('DB Connection was sucessful !!!');
  })
  .catch((err) => {
    console.log(err);
    console.log('DB Connection was unsucessful !!!');
  });

const server = app.listen(config.appPort || 3000, '127.0.0.1', () => {
  console.log(`app is listening on port ${config.appPort}`);
});

process.on('unhandledRejection', (err) => {
  closeServer(server);
});

process.on('uncaughtException', (err) => {
  console.log(err);
  gracefullyShutdown(server);
});

process.on('SIGTERM', () => {
  gracefullyShutdown(server);
});

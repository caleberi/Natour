const config = require('./config');
const mongoose = require('mongoose');
const app = require('./app');
const { Server } = require('socket.io');
const http = require('http');
const globalErrorHandler = require('./controllers/errorController');
const { AppError } = require('./helpers/error');
const server = http.createServer(app);
const io = new Server(server);

// plugin feature dependencies that need socket connection here
//************************************************************/
const featuresRouter = require('./features/index');
//***********************************************************/
app.use(`/api/v1/features`, featuresRouter(io));

// handling error
app.all('*', (req, res, next) =>
  next(new AppError(messages.GLOBAL_ERROR_MSG(req), 404))
);
app.use(globalErrorHandler);

const db = config.mongoUseLocal
  ? config.mongoDatabaseLocal
  : config.mongoDatabaseProduction.replace(
      '<MONGO_PASSWORD>',
      process.env.MONGO_PASSWORD
    );

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

server.listen(config.appPort || 3000, '127.0.0.1', () => {
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

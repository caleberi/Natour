const morgan = require('morgan');
const _ = require('lodash');
const express = require('express');
const app = express();
const rateLimit = require('express-rate-limit').default;
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const config = require('./config');
const { messages, tools, environments } = require('./helpers/constants');
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: messages.RATE_LIMIT_MSG(this.windowMs),
});

if (_.isEqual(config.currentEnviroment, environments.DEVELOPMENT)) {
  app.use(morgan('dev'));
} else {
  app.use(morgan(tools.LOGGER_TEMPLATE));
}
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({ whitelist: tools.HPP_WHITELIST }));
app.get('/ping', (req, res, next) => res.send('Pinged'));
app.use('/public', express.static(`${__dirname}/public`));
app.use(`/api/v1`, apiLimiter);
app.use(`/api/v1/tours`, tourRouter);
app.use(`/api/v1/users`, userRouter);
app.use(`/api/v1/reviews`, reviewRouter);

module.exports = app;

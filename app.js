const morgan = require('morgan');
const _ = require('lodash');
const express = require('express');
const app = express();
const rateLimit = require('express-rate-limit').default;
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const config = require('./config');
const path = require('path');
const cookieParser = require('cookie-parser');
const { messages, tools, environments, codes } = require('./helpers/constants');
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
const CSP = 'Content-Security-Policy';
const POLICY =
  // "default-src 'self' https://*.mapbox.com;" +
  "base-uri 'self';block-all-mixed-content;" +
  "font-src 'self' https: data:;" +
  "frame-ancestors 'self';" +
  "img-src http://localhost:3000 'self' blob: data:;" +
  "object-src 'none';" +
  "script-src https: cdn.jsdelivr.net cdnjs.cloudflare.com api.mapbox.com 'self' blob: ;" +
  "script-src-attr 'none';" +
  "style-src 'self' https: 'unsafe-inline';" +
  'upgrade-insecure-requests;';
app.use((req, res, next) => {
  res.setHeader(CSP, POLICY);
  res.setHeader('Access-Control-Allow-Origin', ' *');
  next();
});

app.use(
  cors({
    origin: 'http://localhost:3000/*',
    optionsSuccessStatus: codes.OK,
  })
);
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '100kb', extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({ whitelist: tools.HPP_WHITELIST }));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, './views'));
app.locals.moment = require('moment');
app.use(express.static(path.join(__dirname, './public')));
app.use(`/api/v1`, apiLimiter);
app.use(`/api/v1/tours`, tourRouter);
app.use(`/api/v1/users`, userRouter);
app.use(`/api/v1/reviews`, reviewRouter);
app.use('/', viewRouter);

module.exports = app;

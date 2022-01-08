const express = require('express');
const router = express.Router({
  mergeParams: true,
  caseSensitive: true,
});
const chatRouter = require('./chat/index');
const dashboardRouter = require('./dashboard/index');
const metricRouter = require('./metrics/index');
const searchRouter = require('./search/index');

module.exports = (io) => {
  router.get('/', (req, res, next) => res.send('feature endpoint pinged'));
  router.use('/chat', chatRouter(io));
  router.use('/dashboard', dashboardRouter(io));
  router.use('/metrics', metricRouter(io));
  router.use('/search', searchRouter);
  return router;
};

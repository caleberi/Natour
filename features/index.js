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
  router.use('/chat', chatRouter(io));
  router.use('/dashboard', dashboardRouter(io));
  router.use('/metrics', metricRouter(io));
  router.use('/search', searchRouter);
  return router;
};

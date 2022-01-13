const express = require('express');
const router = express.Router({
  mergeParams: true,
  caseSensitive: true,
});
const chatRouter = require('./chat/index');
const dashboardRouter = require('./dashboard/index');

module.exports = (io) => {
  router.use('/chat', chatRouter(io));
  router.use('/dashboard', dashboardRouter(io));
  return router;
};

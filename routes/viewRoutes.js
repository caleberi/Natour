const express = require('express');
const { getOverview, getTour } = require('../controllers/viewController');
const { catchAsync } = require('../helpers/utils');
const router = express.Router();
router.get('/', catchAsync(getOverview));

router.get('/tours/:slug', catchAsync(getTour));

module.exports = router;

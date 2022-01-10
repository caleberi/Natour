const express = require('express');
const { getOverview, getTour } = require('../controllers/viewController');
const router = express.Router();
router.get('/', getOverview);

router.get('/tours', getTour);

module.exports = router;

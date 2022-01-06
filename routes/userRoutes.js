const express = require('express');
const router = express.Router();
const { catchAsync } = require('../helpers/utils');
const auth = require('../controllers/authController');
const { roles } = require('../helpers/constants');
const {
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  updateMe,
  deleteMe,
} = require('../controllers/userController');

router.post('/signup', catchAsync(auth.signup));
router.post('/login', catchAsync(auth.login));
router.post('/forgotPassword', catchAsync(auth.forgotPassword));
router.post('/resetPassword/:token', catchAsync(auth.resetPassword));
router.post('/generateOTP', catchAsync(auth.generateOTP));
router.post('/resetPasswordWithOTP', catchAsync(auth.resetPasswordWithOTP));
router.patch(
  '/updatePassword',
  auth.isAuthenticated,
  catchAsync(auth.updateUserPassword)
);
router.route('/').get(auth.isAuthenticated, catchAsync(getAllUsers));
router.patch(
  '/:userId',
  auth.isAuthenticated,
  auth.isAuthorized(roles.C_ADMIN, roles.C_LEAD_GUIDE),
  catchAsync(updateUser)
);
router.use(auth.isAuthenticated);
router.patch('/updateMe/:id', catchAsync(updateMe));
router.patch('/deleteMe/:id', catchAsync(deleteMe));
router.use(auth.isAuthorized(roles.C_ADMIN));
router
  .route('/:id')
  .get(catchAsync(getUser))
  .patch(catchAsync(updateUser))
  .delete(catchAsync(deleteUser));

module.exports = router;

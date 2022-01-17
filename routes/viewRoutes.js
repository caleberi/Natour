const express = require('express');
const {
  getOverview,
  getTour,
  getMyTour,
  getLoginForm,
  getAccount,
  getSignupForm,
  updateUserData,
  updateUserPassword,
} = require('../controllers/viewController');
const multer = require('multer');
const multerStorage = multer.memoryStorage();

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users/');
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       req.user.id +
//         '-' +
//         file.fieldname +
//         '-' +
//         uniqueSuffix +
//         '.' +
//         file.mimetype.split('/')[1]
//     );
//   },
// });

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    return cb(null, true);
  } else {
    return cb(
      new AppError(
        'Not a image file ! please upload an image file',
        codes.BAD_REQUEST,
        false
      ),
      false
    );
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
const { catchAsync } = require('../helpers/utils');
const { isLoggedIn, isAuthenticated } = require('../middlewares');
const { AppError } = require('../helpers/error');
const { codes } = require('../helpers/constants');
const middlewares = require('../middlewares');
const { createBookingCheckout } = require('../controllers/bookingController');
const { signup } = require('../controllers/authController');
const router = express.Router();
router.get(
  '/overview',
  createBookingCheckout,
  isLoggedIn,
  catchAsync(getOverview)
);
router.get('/tours/:slug', isLoggedIn, catchAsync(getTour));
router.get('/me', isAuthenticated, getAccount);
router.get('/', catchAsync(getLoginForm));
router.get('/signup', getSignupForm);
router.get('/my-tours', isAuthenticated, catchAsync(getMyTour));

router.post(
  '/submit-user-data',
  isAuthenticated,
  upload.single('avatar'),
  middlewares.resizePhoto({
    single: true,
    multiple: false,
  }),
  catchAsync(updateUserData)
);
router.post('/submit-registration-data', catchAsync(signup));
router.post(
  '/update-password',
  isAuthenticated,
  catchAsync(updateUserPassword)
);
module.exports = router;

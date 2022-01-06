exports.roles = {
  C_USER: 'User',
  C_ADMIN: 'Admin',
  C_LEAD_GUIDE: 'lead-tour-guide',
  C_TOUR_GUIDE: 'tour-guide',
};

exports.codes = {
  OK: 200,
  CREATED: 201,
  N0_CONTENT: 204,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  PAYMENT_REQUIRED: 402,
  UNAUTHORIZED: 401,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER: 500,
  METHOD_NOT_IMPLEMENTED: 501,
};

exports.environments = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  STAGING: 'staging',
};
exports.tools = {
  LOGGER_TEMPLATE:
    ':method :url :status :res[content-length] - :response-time ms',
  HPP_WHITELIST: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficult',
    'price',
  ],
};
exports.messages = {
  EMAIL_ALREADY_EXIST: 'Sorry , User with email already exist',
  INVALID_LATLONG:
    'Please provide latitude and longitude in the format lat,lng',
  INVALID_DISTANCE: 'please provide distance in numberic form eg 125 only',
  INVALID_EMAIL_PASSWORD: 'Please provide email and password',
  INVALID_PASSWORD: 'Password is not correct',
  NOT_FOUND_EMAIL: 'No such email account exist  ',
  AUTH_KEY_PROVISION: 'Please provide an authorization key to access ',
  EXPIRED_TOKEN: 'Token has expired',
  INVALID_EXPIRED_TOKEN: 'Token has either expired or is invalid',
  PASSWORD_CHANGED: 'User has changed their password . Please  login again',
  INACTIVE_JWT: 'JWT not active',
  INCORRECT_OLD_PASSWORD: 'Old password is not correct',
  EMAIL_RESET_SEND: 'Error sending an email to reset your email',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  UNAUTHORIZED_ACCESS:
    'You are not logged in !!. Please login for more access ',
  NO_PRESENT_PHONE_NUMBER:
    'PhoneNumber was not provided by this email while onboarding ',
  OTP_SEND_ERROR: 'Error sending OTP to phonenumber  with this email ',
  INVALID_EXPIRED_OTP: 'OTP has either expired or is invalid',
  DELETE_WITH_INVALID_PASSWORD:
    'Password is not correct . Account cannot be deleted',
  NO_ENTITY: (model) => `Sorry , but no ${model} was found`,
  CONFIG_MSG: (key) =>
    `Variable with name : ${key} is not present as an enviromental variable`,
  RATE_LIMIT_MSG: (hour) =>
    `To many request from this IP , please make another in ${hour}hr`,
  GLOBAL_ERROR_MSG: (req) => `Can't find ${req.originalUrl} on this server`,
  NOT_FOUND_ID: (model) => `Sorry but no ${model} found with that ID`,
  NOT_CREATED: (model) => `Sorry 😅,but could not create ${model}`,
  NO_TOUR_PLAN: (year) => `Oops!! , No tour plan found for year ${year}`,
};

exports.errorType = {
  CAST_ERROR: 'CastError',
  VALIDATION_ERROR: 'ValidatorError',
  TOKEN_EXPIRED_ERROR: 'TokenExpiredError',
  NOT_BEFORE_ERROR: 'NotBeforeError',
};

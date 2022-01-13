const { ValidationError, DuplicateFieldsError } = require('../helpers/error');
const { codes, errorType } = require('../helpers/constants');
const { createFailureResponse } = require('../helpers/utils');
const handleCastError = (err) =>
  new Error.CastError(
    `Invalid Cast ${err.path} : ${err.value}.`,
    codes.BAD_REQUEST
  );

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((elem) => {
    return elem['message'];
  });
  return new ValidationError(`Invalid Input Data : \n ${errors.join('\n*')}`);
};

const handleDuplicateFields = (err) =>
  new DuplicateFieldsError(
    'Duplicate field value: x. Please use another value!'.replace(
      'x',
      err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
    )
  );

function renderErrorPage(res, code, err) {
  return res.status(code).render('error', err);
}
module.exports = (err, req, res, next) => {
  const startwithAPI = req.originalUrl.startsWith('/api');
  if (err.isOperational) {
    console.log(err);
    if (!startwithAPI) {
      return renderErrorPage(
        res,
        codes.INTERNAL_SERVER,
        createFailureResponse({
          message: 'Something went wrong',
        })
      );
    }
    return res.status(codes.INTERNAL_SERVER).json(
      createFailureResponse({
        message: 'Something went wrong',
      })
    );
  } else {
    err.statusCode = err.statusCode || codes.INTERNAL_SERVER;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'production') {
      if (err.name === errorType.CAST_ERROR) err = handleCastError(err);
      if (err.name === errorType.VALIDATION_ERROR)
        err = handleValidationError(err);
      if (err.code === 11000) err = handleDuplicateFields(err);
      if (err.stack) delete err.stack;
    }
    if (!startwithAPI) {
      return renderErrorPage(
        res,
        codes.INTERNAL_SERVER,
        createFailureResponse({
          message: 'Something went wrong',
        })
      );
    }
    return res.status(err.statusCode).json(
      createFailureResponse({
        ...err,
        message: err.message ? err.message : null,
      })
    );
  }
};

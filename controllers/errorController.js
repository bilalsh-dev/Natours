const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invallid ${err.path}: ${err.value}`;

  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = err => {
  // const value = err.errname.ValidatorError.value.match(/(["'])(\\?.)*?\1/)[0];
  // console.log(value);
  console.log(err);

  const message = `Duplicate Field value: . please use another value`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invallid input data .${errors.join('. ')}`;

  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,

      message: err.message
    });
  } else {
    console.error('Error', err);

    res.status(500).json({
      status: 'error',
      message: 'Sonething went very wrong'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') {
      error = handleCastErrorDB(err);
    }
    if (err._message === 'Tour validation failed') {
      error = handleDuplicateFieldsDB(err);
    }
    if (err._message === 'Validation failed') {
      error = handleValidationErrorDB(err);
    }

    sendErrorProd(error, res);
  }
};

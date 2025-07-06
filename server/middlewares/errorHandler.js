const logger = require('../utils/logger');

class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleSequelizeError = (err) => {
  const message = err.errors ? err.errors.map(e => e.message).join('. ') : err.message;
  return new AppError(400, message);
};

const handleJWTError = () => new AppError(401, 'Token invalide. Veuillez vous reconnecter.');

const handleJWTExpiredError = () => new AppError(401, 'Votre token a expiré. Veuillez vous reconnecter.');

const sendErrorDev = (err, res) => {
  logger.error('Erreur en développement:', {
    error: err,
    stack: err.stack
  });

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Erreur opérationnelle, envoyer au client
  if (err.isOperational) {
    logger.error('Erreur opérationnelle:', {
      error: err,
      message: err.message
    });

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } 
  // Erreur de programmation, ne pas fuiter les détails
  else {
    logger.error('Erreur de programmation:', {
      error: err
    });

    res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'SequelizeValidationError') error = handleSequelizeError(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

module.exports.AppError = AppError; 
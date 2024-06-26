import { Request, Response, NextFunction } from 'express';
import BaseResponse from '../dtos/responses/baseResponse';
import { NotFoundError, BadRequestError, UnauthorizedError, ForbiddenError } from '../errors';
import Logger from '../utils/logger';

const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode : number = 500
  switch (err.constructor) {
    case NotFoundError:
      statusCode = 404;
      break;
    case BadRequestError:
      statusCode = 400;
      break;
    case UnauthorizedError:
      statusCode = 401;
      break;
    case ForbiddenError:
      statusCode = 403;
      break;
    default:
      statusCode = err.status || 500
      break;
  }

  const message = err.message || 'Something went wrong';
  if (statusCode >= 500) {
    Logger.error(`Error ${statusCode}: ${message}: ${err}`);
  } else {
    Logger.info(`Client Error ${statusCode}: ${message}: ${err}`);
  }

  res.status(statusCode).send({
    success: false,
    message: message,
    payload: null,
  } as BaseResponse);
}

export default errorMiddleware;

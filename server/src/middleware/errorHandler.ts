import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((err: any) => err.message);
    return res.status(400).json({
      message: 'Validation Error',
      errors
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format'
    });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      message: `${field} already exists`
    });
  }

  res.status(error.status || 500).json({
    message: error.message || 'Internal Server Error'
  });
};
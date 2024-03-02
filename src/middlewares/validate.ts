import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import BaseResponse from '../dtos/responses/baseResponse';

export default function validationMiddleware<T>(type: any): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
        const input = plainToInstance(type, req.body);
        validate(input).then(errors => {
            if (errors.length > 0) {
                // You can customize the response as needed
                return res.status(400).send({
                  success: false,
                  errors: errors.map(error => error.toString())
                } as BaseResponse);
            } else {
                next();
            }
        });
    };
}

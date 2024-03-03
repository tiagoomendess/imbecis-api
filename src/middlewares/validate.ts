import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import BaseResponse from '../dtos/responses/baseResponse';

export default function validationMiddleware<T>(type: any): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {

        console.log("Params xxxx: ", req.params)
        let requestData = getInputData(req);
        for (const key in req.params) {
            // if already exists, add prefix, request data has priority
            if (requestData[key]) {
                requestData[`${key}Param`] = req.params[key] as string
                continue
            }

            requestData[key] = req.params[key] as string
        }

        let input = plainToInstance(type, requestData);
        validate(input).then(errors => {
            if (errors.length > 0) {
                return res.status(400).send({
                    success: false,
                    errors: errors.map(error => error.toString())
                } as BaseResponse);
            } else {
                req.body = input as T;
                next();
            }
        });
    };
}

const getInputData = (req: Request): any => {
    return req.method === 'GET' ? req.query : req.body;
}

import { Request, Response, NextFunction } from 'express';
import { getPlateReportsUC } from '../useCases/getPlateReports';
import { getPlateByNumberUC } from '../useCases/getPlateByNumber';
import type {GetPlateByNumberRequest}  from '../dtos/requests/getPlateByNumberRequest';

export const getPlateReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await getPlateReportsUC(req.query as any)

        res.status(200).send({
            success: true,
            message: "Plate reports successfully retrieved",
            payload: result
        })
    } catch (error) {
        next(error)
    }
};

export const getPlateByNumberAndCountry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await getPlateByNumberUC(req.body as GetPlateByNumberRequest)

        res.status(200).send({
            success: true,
            message: "Plate successfully retrieved",
            payload: result
        })
    } catch (error) {
        next(error)
    }
}


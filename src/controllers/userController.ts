import { Response, Request, NextFunction } from 'express'
import { getMeUC } from '../useCases/getMe'
import BaseResponse from '../dtos/responses/baseResponse'

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await getMeUC({
            deviceUUID: req.query.deviceUUID as string,
            ipAddress: req.query.ipAddress as string,
        })
        const response: BaseResponse = { success: true, payload: result }
        res.json(response)
    } catch (err) {
        next(err)
    }
}

export const getUser = (req: Request, res: Response) => {
    res.send('Get User')
};

export const addUser = (req: Request, res: Response) => {
    res.send('Add User')
};

import { Response, Request } from 'express'

export const getUser = (req: Request, res: Response) => {
    res.send('Get User')
};

export const addUser = (req: Request, res: Response) => {
    res.send('Add User')
};

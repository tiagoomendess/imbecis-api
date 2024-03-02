import { Response, Request } from 'express'
import config from '../config'

import type BaseResponse from '../dtos/responses/baseResponse'
import type IndexResponse from '../dtos/responses/indexResponse'

export const index = (req: Request, res: Response) => {

    const response: BaseResponse = {
        success: true,
        payload: {
            message: `Welcome to the ${config.app.name}!`,
        } as IndexResponse,
    }

    res.send(response)
}

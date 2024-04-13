import { Request, Response, NextFunction } from 'express'
import { verifyCSRFToken } from '../services/csrf'
import Logger from '../utils/logger'
import { BadRequestError } from '../errors'

export const csrf = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deviceUUID = req.headers['device-uuid'] as string || req.headers['deviceUUID'] as string || undefined
        if (!deviceUUID) {
            Logger.warn('Device UUID not found in the request headers on CSRF middleware')
            throw new BadRequestError('Dispositivo desconhecido, recarregue a página e tente novamente')
        }

        const csrfToken = req.headers['csrf-token'] as string || undefined
        if (!csrfToken) {
            Logger.warn('CSRF Token not found in the request headers on CSRF middleware')
            throw new BadRequestError('Código de segurança não encontrado')
        }

        const isValid = await verifyCSRFToken(deviceUUID, csrfToken)
        if (!isValid) {
            throw new BadRequestError('Código de segurança inválido')
        }

        next()
    } catch (error) {
        return next(error)
    }
}

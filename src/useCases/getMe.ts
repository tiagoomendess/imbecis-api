import { getByUuidAndIp } from '../models/adminAccount'
import { BadRequestError } from '../errors'

interface GetMeRequest {
    deviceUUID?: string
    ipAddress?: string
}

interface GetMeResult {
    isAdmin: boolean
}

export const getMeUC = async (request: GetMeRequest): Promise<GetMeResult> => {
    if (!request.deviceUUID) {
        throw new BadRequestError('UUID do dispositivo desconhecido')
    }

    if (!request.ipAddress) {
        throw new BadRequestError('Endereço IP desconhecido')
    }

    const adminAccount = await getByUuidAndIp(request.deviceUUID, request.ipAddress)

    return { isAdmin: adminAccount !== null }
}

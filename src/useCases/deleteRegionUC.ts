import { InternalServerError } from "../errors"
import { deleteRegion } from "../models/notificationRegion"
import { ObjectId } from "mongodb"
import { getByUuidAndIp } from "../models/adminAccount"
import { BadRequestError } from "../errors"
import { DeleteRegionRequest } from "../dtos/requests/deleteRegionRequest"

export const deleteRegionUC = async (request: DeleteRegionRequest): Promise<boolean> => {
    if (!request.deviceUUID) {
        throw new BadRequestError('UUID do dispositivo desconhecido');
    }

    if (!request.ipAddress) {
        throw new BadRequestError('Endereço IP desconhecido');
    }

    const adminAccount = await getByUuidAndIp(request.deviceUUID, request.ipAddress)
    if (!adminAccount) {
        throw new BadRequestError('Não tem permissão para editar esta fotografia');
    }

    const objectId = new ObjectId(request.id)
    const deleted = await deleteRegion(objectId)
    if (!deleted) {
        throw new InternalServerError("Failed to delete region")
    }

    return true
}

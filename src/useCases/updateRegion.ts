import { newNotificationRegionDto, NotificationRegionDto } from '../dtos/responses/notificationRegionDto';
import { ObjectId } from 'mongodb';
import { getRegion, updateRegion, type NotificationRegion } from '../models/notificationRegion';
import { InternalServerError } from '../errors';
import { UpdateRegionRequest } from '../dtos/requests/updateRegionRequest';
import { BadRequestError } from '../errors';
import { getByUuidAndIp } from '../models/adminAccount';

export const updateRegionUC = async (request: UpdateRegionRequest): Promise<NotificationRegionDto> => {

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

    const updated = await updateRegion({
        _id: objectId,
        name: request.name,
        priority: request.priority,
        color: request.color,
        polygon: request.polygon,
        recipients: request.recipients
    } as NotificationRegion)

    if (!updated) {
        throw new InternalServerError("Failed to update region")
    }

    const updatedRegion = await getRegion(objectId)
    if (!updatedRegion) {
        throw new InternalServerError("Failed to get updated region")
    }

    return newNotificationRegionDto(updatedRegion)
}

import { NotificationRegion } from "../models/notificationRegion"
import { createRegion } from "../models/notificationRegion"
import { InternalServerError } from "../errors"
import { newNotificationRegionDto, type NotificationRegionDto } from "../dtos/responses/notificationRegionDto"
import { CreateRegionRequest } from "../dtos/requests/createRegionRequest"
import { BadRequestError } from "../errors"
import { getByUuidAndIp } from "../models/adminAccount"

export const createRegionUC = async (request: CreateRegionRequest): Promise<NotificationRegionDto> => {
    if (!request.deviceUUID) {
        throw new BadRequestError('UUID do dispositivo desconhecido');
    }

    if (!request.ipAddress) {
        throw new BadRequestError('Endereço IP desconhecido');
    }

    const adminAccount = await getByUuidAndIp(request.deviceUUID, request.ipAddress)
    if (!adminAccount) {
        throw new BadRequestError('Não tem permissão para criar regiões');
    }

    const newRegion = await createRegion({
        name: request.name,
        priority: request.priority,
        color: request.color,
        polygon: request.polygon,
        recipients: request.recipients
    } as NotificationRegion)

    if (!newRegion) {
        throw new InternalServerError("Failed to create region")
    }

    return newNotificationRegionDto(newRegion)
}

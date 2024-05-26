import { getRegions } from "../models/notificationRegion";
import { InternalServerError } from "../errors";
import { NotificationRegionDto, newNotificationRegionDto } from "../dtos/responses/notificationRegionDto";

export const getRegionsUC = async (): Promise<NotificationRegionDto[]> => {

    const regions = await getRegions()
    if (!regions) {
        throw new InternalServerError("Failed to get regions")
    }

    return regions.map(region => newNotificationRegionDto(region))
}

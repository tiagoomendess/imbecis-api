import { NotificationRegion } from "../../models/notificationRegion";

export interface NotificationRecipientDto {
    type: "email" | "reddit" | "none"
    target: string
}

export interface NotificationRegionDto {
    id: string
    name: string
    priority: number
    color: string
    polygon: {
        type: "Polygon";
        coordinates: number[][][]
    };
    recipients: NotificationRecipientDto[]
}

export const newNotificationRegionDto = (region: NotificationRegion) : NotificationRegionDto => {
    return {
        id: region._id.toString(),
        name: region.name,
        priority: region.priority,
        color: region.color,
        polygon: region.polygon,
        recipients: region.recipients
    } as NotificationRegionDto
}

import { Report } from "../../models/report";
import { newPlateDto, type PlateDto } from "./plateDto";

export interface ReportDto {
    id: string
    status: string
    deviceUUID: string
    municipality?: string
    picture?: string
    pictureSignedUrl?: string
    plateId?: string
    plate?: PlateDto
    createdAt: Date
    updatedAt: Date
}

export const newReportDto = (report: Report | null): ReportDto | null => {
    if (!report) {
        return null
    }

    return {
        id: report?._id.toString(),
        status: report.status,
        deviceUUID: report.deviceUUID,
        municipality: report.municipality,
        picture: report.picture,
        plateId: report.plateId?.toString(),
        plate: newPlateDto(report.plate),
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
    }
}

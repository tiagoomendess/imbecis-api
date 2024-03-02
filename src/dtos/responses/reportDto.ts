import { Report } from "../../models/report";

export interface ReportDto {
    id: string
    status: string
    deviceUUID: string
    municipality?: string
    picture?: string
    plateId?: string
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
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
    }
}

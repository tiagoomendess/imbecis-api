import { CreateReportRequest } from "../dtos/requests/CreateReportRequest";
import { STATUS, createReport, getReportById } from "../models/report";
import type { Report } from "../models/report";
import { Request } from "express";

export const createReportUC = async (request : Request) => {
    const reportDto = request.body as CreateReportRequest;

    const result = await createReport({
        location: {
            latitude: reportDto.location.latitude,
            longitude: reportDto.location.longitude
        },
        deviceUUID: reportDto.deviceUUID,
        ipAddress: request.headers['x-forwarded-for'] as string || request.connection.remoteAddress as string,
        userAgent: request.headers['user-agent'] as string,
        status: STATUS.NEW,
    } as Report)

    if (!result) {
        throw new Error('Error creating report');
    }

    const created = await getReportById(result);
    
    return created;
}

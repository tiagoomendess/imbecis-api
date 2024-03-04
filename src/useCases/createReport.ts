import { CreateReportRequest } from "../dtos/requests/createReportRequest";
import { STATUS, createReport, getReportById } from "../models/report";
import type { Report } from "../models/report";
import { type ReportDto, newReportDto } from "../dtos/responses/reportDto";
import { getMunicipalityByCoords } from "../gateways/geoApiPT";

export const createReportUC = async (request : CreateReportRequest) : Promise<ReportDto | null> => {

    const municipality = await getMunicipalityByCoords(request.location.latitude, request.location.longitude)

    const result = await createReport({
        location: {
            latitude: request.location.latitude,
            longitude: request.location.longitude
        },
        municipality: municipality ?? undefined,
        deviceUUID: request.deviceUUID,
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        status: STATUS.NEW,
    } as Report)

    if (!result) {
        throw new Error('Error creating report');
    }

    const created = await getReportById(result);

    return newReportDto(created);
}

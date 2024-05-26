import { CreateReportRequest } from "../dtos/requests/createReportRequest";
import { STATUS, createReport, getReportById, getReportsByUuidOrIp } from "../models/report";
import type { Report } from "../models/report";
import { type ReportDto, newReportDto } from "../dtos/responses/reportDto";
import { getMunicipalityByCoords } from "../gateways/geoApiPT";

export const createReportUC = async (request : CreateReportRequest) : Promise<ReportDto | null> => {

    if (await shouldBeBlocked(request)) {
        throw new Error('Denúncia bloqueada por suspeitas de fraude');
    }

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
        reporterInfo: request.reporterInfo,
        imageHash: request.imageHash
    } as Report)

    if (!result) {
        throw new Error('Erro ao criar denúncia');
    }

    const created = await getReportById(result);

    return newReportDto(created);
}

const shouldBeBlocked = async (request: CreateReportRequest): Promise<boolean> => {
    const now = new Date()
    const lastReports = await getReportsByUuidOrIp(request.deviceUUID, request.ipAddress, 1)
    const lastMinuteReports = lastReports.filter(r => now.getTime() - r.createdAt.getTime() < 60000)
    const lastMinuteInNewCount = lastMinuteReports.filter(r => r.status === STATUS.NEW).length

    return lastMinuteInNewCount >= 1 || lastMinuteReports.length >= 6
}

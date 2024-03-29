import type { GetPlateReportsRequest } from "../dtos/requests/getPlateReportsRequest";
import { newReportDto, type ReportDto } from "../dtos/responses/reportDto";
import { NotFoundError } from "../errors";
import { getReportsByPlateId } from "../models/report";
import { ObjectId } from "mongodb";
import s3 from "../storage/s3";

export const getPlateReportsUC = async (request: GetPlateReportsRequest): Promise<ReportDto[]> => {
    const plateId = new ObjectId(request.plateId);
    const reports = await getReportsByPlateId(plateId, request.page);

    if (reports.length === 0) {
        throw new NotFoundError('Não foram encontradas denúncias para esta matrícula');
    }

    const dtos = [] as ReportDto[]
    for (const report of reports) {
        const dto = newReportDto(report)
        if (!dto) {
            continue
        }

        if (dto.picture) {
            dto.picture = await s3.getDownloadUrl(dto.picture) ?? undefined
        }

        dtos.push(dto)
    }

    return dtos
}

import { GetFeedRequest } from "../dtos/requests/getFeedRequest"
import { ReportDto, newReportDto } from "../dtos/responses/reportDto"
import { getConfirmedReports } from "../models/report"
import { MUNICIPALITIES } from "../utils/constants"
import s3 from "../storage/s3"
import { BadRequestError } from "../errors"

export const getFeedUC = async (request : GetFeedRequest) : Promise<ReportDto[]> => {

    if (request.municipality && !MUNICIPALITIES.includes(request.municipality)) {
        throw new BadRequestError(`Município ${request.municipality} não existe`)
    }

    const reports = await getConfirmedReports(request.page, request.municipality)

    const dtos = [] as ReportDto[]
    for (const report of reports) {
        const dto = newReportDto(report)
        if (!dto) {
            continue
        }

        if (dto.picture) {
            dto.picture = await s3.getPublicUrl(dto.picture) ?? undefined
        }

        dtos.push(dto)
    }

    return dtos
}

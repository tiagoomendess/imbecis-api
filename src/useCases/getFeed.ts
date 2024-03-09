import { GetFeedRequest } from "../dtos/requests/getFeedRequest"
import { ReportDto, newReportDto } from "../dtos/responses/reportDto"
import { getConfirmedReports } from "../models/report"
import s3 from "../storage/s3"

export const getFeedUC = async (request : GetFeedRequest) : Promise<ReportDto[]> => {
    const reports = await getConfirmedReports(request.page)

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

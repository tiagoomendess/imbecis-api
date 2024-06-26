import { GetReportForReviewRequest } from '../dtos/requests/getReportForReviewRequest'
import { ReportDto, newReportDto } from '../dtos/responses/reportDto'
import { getReportForReview, updateReport } from '../models/report'
import s3 from '../storage/s3'

export const getReportForReviewUC = async (request : GetReportForReviewRequest) : Promise<ReportDto | null> => {

    const report = await getReportForReview(request.ipAddress, request.deviceUUID, request.userAgent)

    // Update updated at so it does not get served again soon
    if (report) {
        updateReport(report)
    }

    const dto = newReportDto(report)
    if (dto?.picture)
        dto.picture = await s3.getPublicUrl(dto.picture) ?? undefined
    
    return dto
}

import { GetReportForReviewRequest } from '../dtos/requests/getReportForReviewRequest'
import { ReportDto, newReportDto } from '../dtos/responses/reportDto'
import { getReportForReview, updateReport } from '../models/report'
import { Coordinate } from '../models/coordinate'
import s3 from '../storage/s3'

export const getReportForReviewUC = async (request : GetReportForReviewRequest) : Promise<ReportDto | null> => {

    const location = new Coordinate(request.latitude, request.longitude)
    const report = await getReportForReview(request.ipAddress, request.deviceUUID, location)

    // Update updated at so it does not get served again
    if (report) {
        updateReport(report)
    }

    const dto = newReportDto(report)
    if (dto?.picture)
        dto.picture = await s3.getDownloadUrl(dto.picture) ?? undefined
    
    return dto
}

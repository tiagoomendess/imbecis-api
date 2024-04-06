import { GetReportForReviewRequest } from '../dtos/requests/getReportForReviewRequest';
import { countAvailableReportsForReview } from '../models/report';

export const countAvailableReportsForReviewUC = async (request: GetReportForReviewRequest): Promise<number> => {
    return await countAvailableReportsForReview(request.ipAddress, request.deviceUUID, request.userAgent);
}

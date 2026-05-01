import { listReportsByDeviceUUID } from '../models/report'
import { ListMyReportsRequest } from '../dtos/requests/listMyReportsRequest'
import { type ListMyReportsResponse, type MyReportItemDto } from '../dtos/responses/listMyReportsResponse'
import s3 from '../storage/s3'

export const listMyReportsUC = async (request: ListMyReportsRequest): Promise<ListMyReportsResponse> => {
    const result = await listReportsByDeviceUUID({
        deviceUUID: request.deviceUUID,
        page: request.page,
        pageSize: request.pageSize,
    })

    const data: MyReportItemDto[] = []
    for (const report of result.data) {
        let picture: string | null = report.picture ?? null
        if (picture) {
            picture = (await s3.getPublicUrl(picture)) ?? null
        }

        data.push({
            id: report._id.toHexString(),
            picture,
            status: report.status,
            municipality: report.municipality ?? null,
            occurredAt: (report.occurredAt ?? report.createdAt).toISOString(),
        })
    }

    const total = result.total
    const totalPages = total === 0 ? 0 : Math.ceil(total / request.pageSize)

    return {
        meta: {
            page: request.page,
            pageSize: request.pageSize,
            total,
            totalPages,
        },
        data,
    }
}

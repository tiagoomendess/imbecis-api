import { BadRequestError } from '../errors'
import { listConfirmedReports, type Report } from '../models/report'
import { ListConfirmedReportsRequest } from '../dtos/requests/listConfirmedReportsRequest'
import {
    type ConfirmedReportItemDto,
    type ConfirmedReportLocationDto,
    type ListConfirmedReportsResponse,
} from '../dtos/responses/listConfirmedReportsResponse'
import s3 from '../storage/s3'

const round5 = (n: number): number => Math.round(n * 1e5) / 1e5

export const listConfirmedReportsUC = async (
    request: ListConfirmedReportsRequest
): Promise<ListConfirmedReportsResponse> => {
    const fromTime = request.from_time ? new Date(request.from_time) : undefined
    const toTime = request.to_time ? new Date(request.to_time) : undefined

    if (fromTime && toTime && fromTime > toTime) {
        throw new BadRequestError('from_time must be earlier than or equal to to_time')
    }

    const result = await listConfirmedReports({
        page: request.page,
        pageSize: request.pageSize,
        fromTime,
        toTime,
        municipality: request.municipality,
    })

    const data: ConfirmedReportItemDto[] = []
    for (const report of result.data) {
        data.push(await toDto(report))
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

const toDto = async (report: Report): Promise<ConfirmedReportItemDto> => {
    const effectiveDate = report.occurredAt ?? report.createdAt

    let picture: string | null = report.picture ?? null
    if (picture) {
        picture = (await s3.getPublicUrl(picture)) ?? null
    }

    const location: ConfirmedReportLocationDto = {
        latitude: round5(report.location.latitude),
        longitude: round5(report.location.longitude),
        municipality: report.geoInfo?.concelho ?? report.municipality,
        freguesia: report.geoInfo?.freguesia,
        street: report.geoInfo?.rua,
        doorNumber: report.geoInfo?.n_porta,
        postal_code: report.geoInfo?.CP,
    }

    return {
        id: report._id.toHexString(),
        occurredAt: effectiveDate.toISOString(),
        createdAt: report.createdAt.toISOString(),
        picture,
        plateNumber: report.plate?.number ?? null,
        plateCountry: report.plate?.country ?? null,
        location,
    }
}

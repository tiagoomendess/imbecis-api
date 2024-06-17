import { ListReportsRequest } from "../dtos/requests/listReportsRequest";
import { ListReportsResponse } from "../dtos/responses/listReportsResponse";
import { getByUuidAndIp } from "../models/adminAccount";
import { BadRequestError } from "../errors";
import { listReports, countTotalReports, type ListReportsParams, Report } from "../models/report";
import type { ReportInListDto, PlateInListDto } from "../dtos/responses/reportInListDto";

import s3 from "../storage/s3";

export const listReportsUC = async (request: ListReportsRequest): Promise<ListReportsResponse> => {

    if (!request.deviceUUID) {
        throw new BadRequestError('UUID do dispositivo desconhecido');
    }

    if (!request.ipAddress) {
        throw new BadRequestError('Endereço IP desconhecido');
    }

    const adminAccount = await getByUuidAndIp(request.deviceUUID, request.ipAddress)
    if (!adminAccount) {
        throw new BadRequestError('Não tem permissão para ver a lista de denúncias');
    }

    const result = await listReports(request as ListReportsParams)

    const dtos = [] as ReportInListDto[]
    for (const reportModel of result.reports) {
        const dto = newReportInListDto(reportModel)
        if (!dto) {
            continue
        }

        if (dto.originalPicture) {
            dto.originalPicture = await s3.getPublicUrl(dto.originalPicture) ?? undefined
        }

        if (dto.publicPicture) {
            dto.publicPicture = await s3.getPublicUrl(dto.publicPicture) ?? undefined
        }

        dto.suggestedPlate = getSuggestedPlate(reportModel)
        dto.notSureVotes = reportModel.reportVotes?.filter(vote => vote.result === 'not_sure').length || 0
        dto.imbecileVotes = reportModel.reportVotes?.filter(vote => vote.result === 'imbecile').length || 0

        dtos.push(dto)
    }

    return {
        page: result.page,
        total: result.total,
        reports: dtos
    } as ListReportsResponse;
}

const newReportInListDto = (report: Report): ReportInListDto => {
    return {
        id: report._id.toHexString(),
        confirmedPlate: report.plate ? { country: report.plate.country, number: report.plate.number } : undefined,
        suggestedPlate: undefined,
        status: report.status,
        originalPicture: report.originalPicture,
        publicPicture: report.picture,
        municipality: report.municipality,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
    } as ReportInListDto
}

const getSuggestedPlate = (report: Report): PlateInListDto | undefined => {
    if (report.plateId || !report.reportVotes) {
        return undefined
    }

    const mostVotedKeys: { [key: string]: number } = {}
    for (const vote of report.reportVotes) {
        if (vote.result !== 'imbecile') {
            continue
        }

        const key = `${vote.plateCountry}-${vote.plateNumber}`
        if (mostVotedKeys[key] === undefined) {
            mostVotedKeys[key] = 1
        } else {
            mostVotedKeys[key]++
        }
    }

    if (Object.keys(mostVotedKeys).length === 0) {
        return undefined
    }

    // sort plateCountry from most to least
    const topVotedKey = Object.keys(mostVotedKeys).sort((a, b) => mostVotedKeys[b] - mostVotedKeys[a])[0]

    console.log(`Top voted key ${topVotedKey}`)

    return {
        country: topVotedKey.split('-')[0],
        number: topVotedKey.split('-')[1]
    }
}

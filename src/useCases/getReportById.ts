import { ObjectId } from 'mongodb';
import { getReportById, type Report } from '../models/report'
import { newReportDto, type ReportDto } from '../dtos/responses/reportDto'
import s3 from '../storage/s3'

export const getReportByIdUC = async (id: string): Promise<ReportDto | null> => {
    const objectId = new ObjectId(id)
    const report = await getReportById(objectId)

    let dto = newReportDto(report)
    if (!dto) {
        return null
    }
    
    if (dto.picture) {
        dto.picture = await s3.getDownloadUrl(dto.picture) ?? undefined
    }

    return dto
}

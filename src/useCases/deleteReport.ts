import { DeleteReportRequest } from "../dtos/requests/deleteReportRequest";
import { BadRequestError, NotFoundError } from "../errors";
import { getByUuidAndIp } from "../models/adminAccount";
import { deleteReport, getReportById } from "../models/report";
import { ObjectId } from "mongodb";
import s3 from "../storage/s3"

export const deleteReportUC = async (request: DeleteReportRequest): Promise<void> => {
    if (!request.deviceUUID) {
        throw new BadRequestError('UUID do dispositivo desconhecido');
    }

    if (!request.ipAddress) {
        throw new BadRequestError('Endereço IP desconhecido');
    }

    const adminAccount = await getByUuidAndIp(request.deviceUUID, request.ipAddress)
    if (!adminAccount) {
        throw new BadRequestError('Não tem permissão para editar esta denúncia');
    }

    const objectId = new ObjectId(request.reportId);
    const report = await getReportById(objectId);
    if (!report) {
        throw new NotFoundError(`Denúncia a editar não foi encontrada`);
    }

    // Delete the pictures from S3
    if (report.originalPicture) {
        await s3.deleteObject(report.originalPicture)
    }

    if (report.picture) {
        await s3.deleteObject(report.picture)
    }

    // Delete the report from the database
    await deleteReport(report._id);
}

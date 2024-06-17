import { UpdateReportRequest } from "../dtos/requests/updateReportRequest";
import { BadRequestError, NotFoundError } from "../errors";
import { getByUuidAndIp } from "../models/adminAccount";
import { getOrCreatePlate } from "../models/plate";
import { getReportById, STATUS, updateReport } from "../models/report";
import { ObjectId } from "mongodb";

export const updateReportUC = async (request : UpdateReportRequest): Promise<void> => {
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

    const hasPlate = request.plateNumber && request.plateCountry
    if (!hasPlate && [STATUS.NOTIFY, STATUS.CONFIRMED, STATUS.CONFIRMED_BLUR_PLATES].includes(request.status)) {
        throw new BadRequestError('Denúncia deve ter uma matrícula associada para ser movida para este estado');
    }
    
    if (hasPlate) {
        const plate = await getOrCreatePlate(request.plateNumber, request.plateCountry);
        report.plateId = plate._id;
    }
    
    report.status = request.status;
    updateReport(report);

    return
}

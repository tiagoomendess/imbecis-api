import { STATUS, getReportById } from "../models/report"
import { UpdateReportPictureRequest } from "../dtos/requests/updateReportPictureRequest"
import { NotFoundError, BadRequestError, InternalServerError } from "../errors"
import { updateReport } from "../models/report"
import { ObjectId } from "mongodb"
import { getByUuidAndIp } from "../models/adminAccount"
import s3 from "../storage/s3"
import sharp from 'sharp'
import Logger from "../utils/logger";

export const updateReportPictureUC = async (request: UpdateReportPictureRequest): Promise<void> => {
    if (!request.deviceUUID) {
        throw new BadRequestError('UUID do dispositivo desconhecido');
    }

    if (!request.ipAddress) {
        throw new BadRequestError('Endereço IP desconhecido');
    }

    const adminAccount = await getByUuidAndIp(request.deviceUUID, request.ipAddress)
    if (!adminAccount) {
        throw new BadRequestError('Não tem permissão para editar esta fotografia');
    }

    const reportId = new ObjectId(request.reportId);
    const report = await getReportById(reportId);
    if (!report) {
        throw new NotFoundError(`Denúncia com o id ${request.reportId} não foi encontrada`);
    }

    if (!report.picture) {
        throw new BadRequestError('Denúncia não tem uma imagem para poder ser alterada');
    }

    if (!request.file) {
        throw new BadRequestError('Fotografia não estava no pedido');
    }

    if (report.status === STATUS.REVIEW) {
        throw new BadRequestError('Denúncia ainda está em revisão');
    }

    let buffer = null;
    try {
        const resized = await sharp(request.file.buffer).resize(1000, 1000)
        buffer = await resized.webp({ quality: 95 }).toBuffer()
    } catch (error) {
        Logger.error(`Could not compress and convert image: ${error}`);
        throw new InternalServerError("Não foi possível comprimir a imagem");
    }

    try {
        await s3.uploadFile(report.picture, buffer, 'image/webp')
        await updateReport(report)
    } catch (error) {
        Logger.error(`Could not upload picture to S3: ${error}`);
        throw error;
    }

    return
}

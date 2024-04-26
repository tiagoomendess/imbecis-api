import { STATUS, getReportById } from "../models/report"
import { UploadReportPictureRequest } from "../dtos/requests/uploadReportPictureRequest"
import { NotFoundError, BadRequestError, InternalServerError } from "../errors"
import { updateReport } from "../models/report"
import { ObjectId } from "mongodb"
import s3 from "../storage/s3"
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid';

export const uploadReportPictureUC = async (request: UploadReportPictureRequest): Promise<void> => {
    const reportId = new ObjectId(request.reportId);
    const report = await getReportById(reportId);
    if (!report) {
        throw new NotFoundError(`Denúncia com o id ${request.reportId} não foi encontrada`);
    }

    if (report.picture) {
        throw new BadRequestError('Denúncia já tem uma fotografia associada');
    }

    if (!request.file) {
        throw new BadRequestError('Fotografia não estava no pedido');
    }

    if (request.deviceUUID !== report.deviceUUID) {
        throw new BadRequestError('O dispositivo que iniciou a denúncia é diferente do que está a tentar fazer o upload da fotografia');
    }

    let buffer = null;
    let bufferBackup = null;
    try {
        const resized = await sharp(request.file.buffer).resize(1000, 1000)
        // 100% quality here because it will be compressed in the blur plates cron job
        const promises = await Promise.all([
            resized.webp({ quality: 100 }).toBuffer(),
            resized.webp({ quality: 80 }).toBuffer()
        ])

        buffer = promises[0]
        bufferBackup = promises[1]

    } catch (error) {
        console.error("Could not compress and convert image: ", error);
        throw new InternalServerError("Não foi possível comprimir a imagem");
    }

    const filename = `${uuidv4()}.webp`
    const filePath = `pictures/reports/${filename}`

    // Save the original picture in case we need to revert
    const filenameBackup = `${uuidv4()}.webp`
    const filePathBackup = `pictures/reports/${filenameBackup}`

    try {
        await s3.uploadFile(filePath, buffer, 'image/webp')
        await s3.uploadFile(filePathBackup, bufferBackup, 'image/webp')
        report.picture = filePath
        report.originalPicture = filePathBackup
        report.status = STATUS.REVIEW
        await updateReport(report)
    } catch (error) {
        console.error("Could not upload picture to S3: ", error);
        throw error;
    }

    return
}

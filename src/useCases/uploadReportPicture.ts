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

    if (!request.file) {
        throw new BadRequestError('Fotografia não estava no pedido');
    }

    let buffer = null;
    try {
        const resized = await sharp(request.file.buffer).resize(1000, 1000)
        // 100% quality here because it will be compressed in the blur plates cron job
        buffer = await resized.webp({ quality: 100 }).toBuffer()
    } catch (error) {
        console.error("Could not compress and convert image: ", error);
        throw new InternalServerError("Não foi possível comprimir a imagem");
    }

    const filename = `${uuidv4()}.webp`
    const filePath = `pictures/reports/${filename}`

    try {
        await s3.uploadFile(filePath, buffer, 'image/webp')
        report.picture = filePath
        report.status = STATUS.REVIEW
        await updateReport(report)
    } catch (error) {
        console.error("Could not upload picture to S3: ", error);
        throw error;
    }

    return
}

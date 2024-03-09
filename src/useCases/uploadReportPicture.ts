import { STATUS, getReportById } from "../models/report"
import { UploadReportPictureRequest } from "../dtos/requests/uploadReportPictureRequest"
import { NotFoundError, BadRequestError, InternalServerError } from "../errors"
import { updateReport } from "../models/report"
import { ObjectId } from "mongodb"
import s3 from "../storage/s3"
import sharp from 'sharp'

export const uploadReportPictureUC = async (request: UploadReportPictureRequest): Promise<void> => {
    const reportId = new ObjectId(request.reportId);
    const report = await getReportById(reportId);
    if (!report) {
        throw new NotFoundError(`Report with the id ${request.reportId} was not found`);
    }

    if (!request.file) {
        throw new BadRequestError('Picture file was not in the request');
    }

    let buffer = null;
    try {
        const resized = await sharp(request.file.buffer).resize(1000, 1000)
        buffer = await resized.webp({ quality: 80 }).toBuffer()
    } catch (error) {
        console.error("Could not compress and convert image: ", error);
        throw new InternalServerError("Could not compress and convert image");
    }

    const filePath = `pictures/reports/${request.reportId.toString()}_1.webp`

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

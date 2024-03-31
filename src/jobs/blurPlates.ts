import { getReportsByStatus, updateReport } from '../models/report';
import { STATUS } from '../models/report';
import s3 from '../storage/s3';
import Logger from '../utils/logger';
import axios from 'axios';
import sharp from 'sharp';

export const blurPlatesAfterConfirm = async () => {
    Logger.info("Starting blurPlatesAfterConfirm job")

    const reports = await getReportsByStatus(STATUS.CONFIRMED_BLUR_PLATES, 1)
    Logger.info(`Found ${reports.length} reports to blur plates`)
    let successful = 0
    let failed = 0
    let alreadyBlured = 0

    // Loop every report
    for (const report of reports) {
        Logger.info(`Blurring plates for report ${report._id}`)
        
        if (report.platesBluredAt) {
            Logger.warn(`Report ${report._id} already has plates blured, skipping...`)
            alreadyBlured++
            report.status = STATUS.CONFIRMED
            await updateReport(report)
            continue
        }

        if (!report.picture) {
            Logger.warn(`Report ${report._id} has no picture, rejecting`)
            failed++
            report.status = STATUS.REJECTED
            await updateReport(report)
            continue
        }

        const imageStream = await downloadImage(report.picture)
        if (!imageStream) {
            Logger.error(`Error downloading image for report ${report._id}`)
            failed++
            report.status = STATUS.CONFIRMED
            await updateReport(report)
            continue
        }

        const newPicture = await getBluredPlatesPicture(imageStream)
        if (!newPicture) {
            Logger.error(`Error blurring plates for report ${report._id}`)
            failed++
            report.status = STATUS.CONFIRMED
            await updateReport(report)
            continue
        }

        try {
            const uncompressed = await sharp(newPicture)
            const compressed = await uncompressed.webp({ quality: 80 }).toBuffer()
            await s3.uploadFile(report.picture, compressed, 'image/webp')
        } catch (err) {
            Logger.error(`Error building and uploading image back up ${report._id}: ${err}`)
            failed++
            report.status = STATUS.CONFIRMED
            await updateReport(report)
            continue
        }

        try {
            report.status = STATUS.CONFIRMED
            report.platesBluredAt = new Date()
            await updateReport(report)
        } catch (err) {
            Logger.error(`Error updating report ${report._id}: ${err}`)
            failed++
        }

        successful++
    }

    Logger.info(`Finished blurPlatesAfterConfirm job, ${alreadyBlured} were already blured, ${failed} failed, and ${successful} were successfully blured`)
}

const downloadImage = async (url: string): Promise<Uint8Array | null> => {
    try {
        const bytes = await s3.downloadFile(url)
        return bytes ?? null
    } catch (err) {
        Logger.error(`Error downloading image: ${err}`)
        return null
    }
}

const getBluredPlatesPicture = async (imageBytes: Uint8Array): Promise<Buffer | null> => {
    try {
        const imageBlob = new Blob([imageBytes], { type: 'image/webp' });
        const formData = new FormData();
        formData.append('image', imageBlob);

        const response = await axios.post('http://localhost:5000/blur-plates', formData, {
            responseType: 'arraybuffer',
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        const imageBuffer = Buffer.from(response.data);

        return imageBuffer
    } catch (err) {
        Logger.error(`Error calling blurring plates API: ${err}`);
        return null;
    }
}

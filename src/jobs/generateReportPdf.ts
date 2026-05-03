import { STATUS, getReportsByStatus, updateReport } from '../models/report'
import { generateAndUploadReportPdf } from '../services/reportPdfGenerator'
import Logger from '../utils/logger'

export const generateReportPdfs = async () => {
    Logger.info('=== Starting generateReportPdfs job ====================')
    try {
        await doGenerateReportPdfs()
    } catch (error) {
        Logger.error(`Error in generateReportPdfs job: ${error}`)
    }
    Logger.info('=== Finished generateReportPdfs job ====================')
}

const doGenerateReportPdfs = async () => {
    const reports = await getReportsByStatus(STATUS.GENERATE_PDF, 1)
    Logger.info(`Found ${reports.length} reports to generate PDFs for`)

    for (const report of reports) {
        if (report.pdfPath) {
            Logger.warn(`Report ${report._id} already has a PDF, advancing to notify`)
            report.status = STATUS.NOTIFY
            await updateReport(report)
            continue
        }

        try {
            const pdfPath = await generateAndUploadReportPdf(report)
            report.pdfPath = pdfPath
            report.pdfGeneratedAt = new Date()
            report.status = STATUS.NOTIFY
            await updateReport(report)
            Logger.info(`PDF generated and uploaded for report ${report._id}`)
        } catch (err) {
            Logger.error(`PDF generation failed for report ${report._id}: ${err}`)
            // Advance to notify anyway so the pipeline is not blocked
            report.status = STATUS.NOTIFY
            await updateReport(report)
        }
    }
}

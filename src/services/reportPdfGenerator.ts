import PDFDocument from 'pdfkit'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import { Report } from '../models/report'
import s3 from '../storage/s3'
import Logger from '../utils/logger'
import config from '../config'
import { getAddress, getDocumentTypeStr, getGoogleMapsLink, getInfractionDate } from '../utils/reportFormatting'

const CDN_BASE = config.app.isDevelopment
    ? 'https://cdn-dev.imbecis.app'
    : 'https://cdn.imbecis.app'

/**
 * Generates a PDF for the given report, uploads it to S3 and returns the S3 key.
 * Must be called while reporterInfo is still present on the report (i.e. before
 * dispatchNotifications scrubs it).
 */
export const generateAndUploadReportPdf = async (report: Report): Promise<string> => {
    const pdfBuffer = await buildPdf(report)
    const key = `pdfs/reports/${uuidv4()}.pdf`
    await s3.uploadFile(key, pdfBuffer, 'application/pdf')
    Logger.info(`PDF for report ${report._id} uploaded to ${key}`)
    return key
}

const buildPdf = (report: Report): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' })
            const chunks: Buffer[] = []

            doc.on('data', (chunk: Buffer) => chunks.push(chunk))
            doc.on('end', () => resolve(Buffer.concat(chunks)))
            doc.on('error', reject)

            await renderContent(doc, report)

            doc.end()
        } catch (err) {
            reject(err)
        }
    })
}

const renderContent = async (doc: PDFKit.PDFDocument, report: Report): Promise<void> => {
    const infractionDate = getInfractionDate(report)
    const day = infractionDate.toLocaleDateString('pt-PT')
    const time = infractionDate.toLocaleTimeString('pt-PT')
    const plateNumber = report.plate?.number ?? 'Desconhecida'
    const address = report.geoInfo ? getAddress(report.geoInfo) : 'Localização não disponível'
    const mapsLink = getGoogleMapsLink(report)
    const coords = `${report.location.latitude}, ${report.location.longitude}`

    // Header
    doc.fontSize(18).font('Helvetica-Bold')
        .text('Denúncia de Estacionamento Abusivo', { align: 'center' })
    doc.moveDown(1.5)

    // Salutation
    doc.fontSize(11).font('Helvetica')
        .text('Excelentíssimos Agentes de Autoridade,')
    doc.moveDown(0.8)

    // Main infraction paragraph
    doc.font('Helvetica')
        .text('No passado dia ', { continued: true })
        .font('Helvetica-Bold').text(`${day}`, { continued: true })
        .font('Helvetica').text(', pelas ', { continued: true })
        .font('Helvetica-Bold').text(`${time}`, { continued: true })
        .font('Helvetica').text(' UTC, a viatura com a matrícula ', { continued: true })
        .font('Helvetica-Bold').text(`${plateNumber}`, { continued: true })
        .font('Helvetica').text(', foi fotografada em alegada violação do código da estrada, junto a ', { continued: true })
        .font('Helvetica-Bold').text(`${address}`, { continued: true })
        .font('Helvetica').text('.')
    doc.moveDown(0.5)

    doc.text(`Coordenadas GPS: ${coords}`)
    doc.text(`Google Maps: ${mapsLink}`, { link: mapsLink, underline: true })
    doc.moveDown(1)

    // Photo section
    doc.font('Helvetica-Bold').fontSize(12).text('Fotografia da viatura')
    doc.moveDown(0.5)

    if (report.originalPicture) {
        try {
            const imageBytes = await s3.downloadFile(report.originalPicture)
            if (imageBytes) {
                // PDFKit does not support WebP; convert to PNG via sharp
                const pngBuffer = await sharp(Buffer.from(imageBytes)).png().toBuffer()
                const maxWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
                doc.image(pngBuffer, { fit: [maxWidth, 300], align: 'center' })
                doc.moveDown(0.5)
            }
        } catch (err) {
            Logger.warn(`Could not embed image in PDF for report ${report._id}: ${err}`)
            doc.text(`[Imagem não disponível — aceder via: ${CDN_BASE}/${report.originalPicture}]`, {
                link: `${CDN_BASE}/${report.originalPicture}`,
                underline: true,
            })
        }
    } else {
        doc.text('[Nenhuma fotografia associada a esta denúncia]')
    }
    doc.moveDown(1)

    // Reporter info section — included because this PDF is generated before scrubbing
    if (report.reporterInfo) {
        doc.font('Helvetica-Bold').fontSize(12).text('Denunciante / Testemunha')
        doc.moveDown(0.5)
        doc.fontSize(11)
        doc.font('Helvetica-Bold').text('Nome: ', { continued: true })
            .font('Helvetica').text(report.reporterInfo.name)
        doc.font('Helvetica-Bold').text('Documento de Identificação: ', { continued: true })
            .font('Helvetica').text(
                `${getDocumentTypeStr(report.reporterInfo.idType)} ${report.reporterInfo.idNumber}`,
            )
        doc.font('Helvetica-Bold').text('Email: ', { continued: true })
            .font('Helvetica').text(report.reporterInfo.email)

        if (report.reporterInfo.obs) {
            doc.moveDown(0.5)
            doc.font('Helvetica-Bold').text('Nota do denunciante:')
            doc.font('Helvetica').text(report.reporterInfo.obs)
        }

        doc.moveDown(1)
    }

    // Legal paragraph
    doc.font('Helvetica-Bold').fontSize(12).text('Enquadramento Legal')
    doc.moveDown(0.5)
    doc.font('Helvetica').fontSize(11)
        .text(
            'O Cidadão que denuncia esta infração deseja usar do seu direito previsto no n.º 5 do artigo 170.º do Código da Estrada. Este artigo prevê que a autoridade que tiver notícia ' +
            'por denúncia de contra-ordenação, levanta auto, não carecendo de presenciar tal contra-ordenação rodoviária.',
        )
    doc.moveDown(0.8)

    doc.text('Sem mais de momento,\nContinuação de um bom dia e obrigado pela atenção.')
    doc.moveDown(1.5)

    doc.fillColor('#000000')
}

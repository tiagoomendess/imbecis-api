
import { postUrl } from '../services/redditPoster';
import { sendEmail } from '../services/emailSender';
import Logger from '../utils/logger';
import config from '../config';
import type { EmailContact } from '../dtos/emailContact';
import { getFullInfoByCoords, type GeoApiPTResponse } from '../gateways/geoApiPT';

import { findRegionsByPoint, NotificationRegion } from '../models/notificationRegion';
import { STATUS, getReportsByStatus, Report, updateReport, type GeoInfo } from '../models/report';
import { createNotificationHistory, type NotificationHistory } from '../models/notificationHistory';

export const dispatchNotifications = async () => {
    Logger.info("=== Starting dispatchNotifications job ====================");
    try {
        doDispatchNotifications()
    } catch (error) {
        Logger.error(`Error dispatching notifications: ${error}`);
    }

    Logger.info("=== Finished dispatchNotifications job ====================");
}

const doDispatchNotifications = async () => {
    // Get all the reports that are in the notify status
    const reports = await getReportsByStatus(STATUS.NOTIFY, 1);
    Logger.info(`Found ${reports.length} reports to dispatch notifications`);

    // For each report find the region it's coordinates are in
    for (const report of reports) {
        report.status = STATUS.CONFIRMED_BLUR_PLATES;
        const regions = await findRegionsByPoint(report.location);
        Logger.info(`Found ${regions.length} regions for report ${report._id}`);
        if (regions.length === 0) {
            report.reporterInfo = undefined;
            await updateReport(report);
            continue;
        }

        await handleRegions(report, regions);

        // Update report status to confirmed
        report.reporterInfo = undefined;
        await updateReport(report);
    }
}

const handleRegions = async (report: Report, regions: NotificationRegion[]): Promise<void> => {
    // For each region, send the notification according to type
    for (const region of regions) {
        for (const recipient of region.recipients) {
            switch (recipient.type) {
                case "none":
                    // If it's type none then we should not send any notification
                    Logger.info(`Region ${region._id} has recipient with none, breaking chain`);
                    return
                case "email":
                    Logger.info(`Sending email notification to ${recipient.target}`);
                    await handleEmailNotification(region, report, recipient.target);
                    break;
                case "reddit":
                    Logger.info(`Sending reddit notification to r/${recipient.target}`);
                    await handleRedditNotification(region, report, recipient.target)
                    break;
                default:
                    Logger.warn(`Unknown recipient type ${recipient.type}`);
            }
        }
    }

    return
}

const getReportPublicUrl = (report: Report) => {
    let countryCode = report.plate?.country || 'unknown'

    return `${config.app.url}/matriculas/${countryCode}/${report.plate?.number}`;
}

const handleRedditNotification = async (region: NotificationRegion, report: Report, subreddit: string) => {
    if (!config.features.reddit_notification) {
        Logger.info(`Reddit notification disabled`);
        return
    }

    let success = true;
    let errorMessage = '';
    try {
        // wait 1 second to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        const date = new Date(report.createdAt).toLocaleDateString('pt-PT');
        await postUrl(
            `${report.plate?.number} estacionou abusivamente em ${report.municipality} no dia ${date}`,
            getReportPublicUrl(report),
            subreddit
        );
    } catch (error: any) {
        Logger.info(`Reddit notification failed: ${error}`);
        success = false;
        errorMessage = error.message || `${error}`;
    }

    await createNotificationHistory({
        regionId: region._id.toString(),
        reportId: report._id.toString(),
        success,
        type: "reddit",
        target: subreddit,
        errorMessage: errorMessage
    } as NotificationHistory);
}

const handleEmailNotification = async (region: NotificationRegion, report: Report, email: string) => {
    if (!config.features.email_notification) {
        Logger.info(`Email notification disabled`);
        return
    }

    // If no geo info, send back to fill_geo_info status to get it populated
    if (!report.geoInfo) {
        Logger.info(`No geo info for report ${report._id}, sending it back to fill_geo_info status`);
        report.status = STATUS.FILL_GEO_INFO;
        await updateReport(report);
        return
    }

    let success = true;
    let errorMessage = '';
    try {
        const dateStr = new Date(report.createdAt).toLocaleDateString('pt-PT');
        const body = buildBody(report);
        const cc = report.reporterInfo ? [
            { email: report.reporterInfo.email, name: report.reporterInfo.name }
        ] : [];

        success = await sendEmail(
            { email: config.app.reportsEmail, name: config.app.reportsEmailName } as EmailContact,
            { email: email, name: email } as EmailContact,
            cc,
            `Denúncia de estacionamento abusivo da viatura ${report.plate?.number} no dia ${dateStr}`,
            body,
            []
        );

        Logger.info(`Email sent to ${email} successfully`);
    } catch (error: any) {
        success = false;
        errorMessage = error.message || `${error}`;
        Logger.error(`Failed to send email to ${email}`);
    }

    await createNotificationHistory({
        regionId: region._id.toString(),
        reportId: report._id.toString(),
        success,
        type: "email",
        target: email,
        errorMessage: errorMessage
    } as NotificationHistory);
}

const buildBody = (report: Report): string => {
    if (!report.geoInfo) {
        throw new Error('GeoInfo is required to build the email body');
    }

    const day = new Date(report.createdAt).toLocaleDateString('pt-PT');
    const time = new Date(report.createdAt).toLocaleTimeString('pt-PT');

    let message = `<p>Estimados Agentes da Autoridade</p>`

    message += `<p>No passado dia <b>${day}</b>, pelas <b>${time}</b>, a viatura com a matrícula <b>${report.plate?.number}</b>, foi fotografada
    em alegada violação do código da estrada, junto a <b>${getAddress(report.geoInfo)}</b>.
    As coordenadas exatas do local são as seguintes: ${report.location.latitude}, ${report.location.longitude} 
    (<a href="${getGoogleMapsLink(report)}">Link Google Maps</a>)</p>`

    message += `<p>A fotografia, que foi tirada através da aplicação de denúncias, e que comprova a infração, pode ser pré visualizada abaixo:</p>`
    message += `<img src="${getImageUrl(report)}" alt="Fotografia da viatura" style="width: 100%; height: auto;"/>`
    message += `<p>A seguinte hash criptográfica, gerada no momento e local da infração, ainda no dispositivo do denunciante, e a partir da fotografia reproduzida, 
    prova que a imagem não foi adulterada enquanto armazenada ou em trânsito. Hash SHA256: ${report.imageHash}. A imagem original está disponível 
    <a href="${getImageUrl(report)}">aqui</a>, e a hash pode ser validada através de qualquer ferramenta online, como por exemplo 
    <a href="https://emn178.github.io/online-tools/sha256_checksum.html">esta</a>.</p>`

    message += addReporterInfo(report);

    message += `<p>De recordar que ao abrigo do <b>n.º 5 do artigo 170.º</b> do Código da Estrada, a autoridade que tiver notícia 
    por denúncia de contra-ordenação, levanta auto, não carecendo de presenciar tal contra-ordenação rodoviária, situação a que se 
    aplica o n.º 1 do mesmo artigo.</p>`

    message += `<p>Para quaisquer esclarecimentos não hesite em entrar em contacto.</p>`
    message += `<p>Sem mais de momento,<br/>Continuação de um bom dia.</p>`

    message += `<small style="opacity: 75%">Esta denúncia foi validada e confirmada por, pelo menos, 3 pessoas diferentes para além do denunciante antes de 
    ser automaticamente enviada para este endereço de email. Endereço esse que foi o escolhido por ter sido identificado como pertencendo à autoridade responsável 
    pela fiscalização rodoviária na localização da alegada infração. Caso não seja o caso, por favor encaminhe este email para quem de direito, e avise 
    respondendo a este email para ser efectuada a alteração no sistema, para que eventuais denúncias futuras, sejam enviadas para a entidade correta.</small>`

    return message
}

const getAddress = (locationFullInfo: GeoInfo): string => {

    let street = locationFullInfo.rua ? `${locationFullInfo.rua}` : '';
    let number = locationFullInfo.n_porta ? ` ${locationFullInfo.n_porta}` : '';
    let postalCode = locationFullInfo.CP ? `, ${locationFullInfo.CP}` : '';
    let freguesia = locationFullInfo.freguesia ? `, ${locationFullInfo.freguesia}` : '';
    let municipality = locationFullInfo.concelho ? `, ${locationFullInfo.concelho}` : '';
    let district = locationFullInfo.distrito ? `, ${locationFullInfo.distrito}` : '';

    return `${street}${number}${postalCode}${freguesia}${municipality}${district}`
}

const tryGetFullInfoByCoords = async (latitude: number, longitude: number): Promise<GeoApiPTResponse | null> => {
    let tries = 0;
    while (tries < 3) {
        const result = await getFullInfoByCoords(latitude, longitude)
        if (result) {
            return result
        }
        // wait 1 second to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        tries++;
    }

    return null;
}

const getGoogleMapsLink = (report: Report): string => {
    return `https://www.google.com/maps/search/?api=1&query=${report.location.latitude},${report.location.longitude}`;
}

const getImageUrl = (report: Report): string => {
    let cdnUrl = "https://cdn-dev.imbecis.app";
    if (!config.app.isDevelopment) {
        cdnUrl = "https://cdn.imbecis.app";
    }

    return `${cdnUrl}/${report.originalPicture}`;
}

const addReporterInfo = (report: Report): string => {
    if (!report.reporterInfo) {
        return '';
    }

    let message = `<h3>Denunciante/Testemunha:</h3>`
    message += `<p>Nome: ${report.reporterInfo.name}<br/>
    Documento de Identificação: ${getDocumentTypeStr(report.reporterInfo.idType)} ${report.reporterInfo.idNumber}<br/>
    Email: ${report.reporterInfo.email}<br/>
    </p>`

    if (report.reporterInfo.obs) {
        message += `<h3>O denunciante fez questão de deixar a seguinte nota:</h3>`
        message += `<p>${report.reporterInfo.obs}</p></br>`
    }

    return message
}

const getDocumentTypeStr = (idType: string): string => {
    switch (idType) {
        case 'cc':
            return 'Cartão de Cidadão';
        case 'residency':
            return 'Autorização de Residência';
        case 'passport':
            return 'Passaporte';
        default:
            return '';
    }
}


import { postUrl } from '../services/redditPoster';
import { sendEmail } from '../services/emailSender';
import Logger from '../utils/logger';
import config from '../config';

import { findRegionsByPoint, NotificationRegion } from '../models/notificationRegion';
import { STATUS, getReportsByStatus, Report, updateReport } from '../models/report';
import { createNotificationHistory, type NotificationHistory } from '../models/notificationHistory';

export const dispatchNotifications = async () => {
    Logger.info("Starting dispatchNotifications job");
    try {
        doDispatchNotifications()
    } catch (error) {
        Logger.error(`Error dispatching notifications: ${error}`);
    }

    Logger.info("Finished dispatchNotifications job");
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

        Logger.info(`Found ${regions.length} regions for report ${report._id}`);
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
    return `${config.app.url}/${report.plate?.number}`;
}

const handleRedditNotification = async (region : NotificationRegion, report: Report, subreddit: string) => {
    if (!config.features.reddit_notification) {
        Logger.info(`Reddit notification disabled`);
        return
    }

    let success = true;
    let errorMessage = '';
    try {
        // wait 1 second to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        await postUrl(
            `${report.plate?.number} em ${report.municipality}`,
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

const handleEmailNotification = async (region : NotificationRegion, report: Report, email: string) => {
    if (!config.features.email_notification) {
        Logger.info(`Email notification disabled`);
        return
    }

    const success = await sendEmail(email, `subject`, `body`);
}

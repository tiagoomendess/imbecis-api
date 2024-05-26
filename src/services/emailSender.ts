import Logger from "../utils/logger";


export const sendEmail = async (email: string, subject: string, message: string) : Promise<boolean>=> {
    // Simulate sending email for now
    Logger.info(`Sending email to ${email} with subject: ${subject} and message: ${message}`);
    Logger.info(`Email notification not implemented yet.`)
    return new Promise((resolve) => { resolve(true)});
}

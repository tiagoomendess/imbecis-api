import Logger from "../utils/logger";
import { sendEmailViaMailJet } from "./mailJet";
import type { EmailContact } from "../dtos/emailContact";

const MAIL_JET_PROVIDER = "mailjet";

/**
 * Send Email abstraction
 * 
 * @param email The email to send the message to
 * @param subject The subject of the email
 * @param message The message to send, html is supported
 * @returns true if the email was sent successfully, false otherwise
 */
export const sendEmail = async (
    from: EmailContact,
    to: EmailContact,
    cc: EmailContact[],
    subject: string,
    message: string,
    attatchements: Blob[]
): Promise<boolean> => {
    const provider = chooseProvider();
    Logger.info(`Sending email to ${to.email} with subject: ${subject} using ${provider}`);

    switch (provider) {
        case MAIL_JET_PROVIDER:
            return await sendEmailViaMailJet(from, to, cc, subject, message, attatchements);
        default:
            Logger.error(`Unknown email provider ${provider}`);
            return new Promise((resolve) => { resolve(false) });
    }
}

/**
 * Choose the email provider to use
 * 
 * @returns the email provider to use
 */
const chooseProvider = () => {
    // For now only mailjet is supported
    return MAIL_JET_PROVIDER;
}

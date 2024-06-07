import mailjet from 'node-mailjet';
import config from '../config';
import Logger from '../utils/logger';
import type { EmailContact } from '../dtos/emailContact';

const mailjetClient = mailjet.apiConnect(
    config.mailjet.apiKeyPublic,
    config.mailjet.apiKeyPrivate
);

export const sendEmailViaMailJet = async (
    from: EmailContact,
    to: EmailContact,
    cc: EmailContact[],
    subject: string,
    message: string,
    attatchements: Blob[]
): Promise<boolean> => {

    const body = {
        "Messages": [
            {
                "From": {
                    "Email": from.email,
                    "Name": from.name
                },
                "To": [
                    {
                        "Email": to.email,
                        "Name": to.name
                    }
                ],
                "Subject": subject,
                "HTMLPart": message,
            }
        ]
    }

    if (cc.length > 0) {
        (body.Messages[0] as any).Cc = cc.map((c) => { return { "Email": c.email, "Name": c.name }})
    }

    if (attatchements.length > 0) {
       (body.Messages[0] as any).Attachments = await getAttachments(attatchements)
    }

    const request = mailjetClient
        .post("send", { 'version': 'v3.1' })
        .request(body)

    try {
        const result = await request;
        return result.response.status === 200
    } catch (error: any) {
        Logger.error(`Error sending email via mailjet: ${error}`);
        throw error;
    }
}

const getAttachments = async (attatchements: Blob[]): Promise<any[] | undefined> => {
    if (attatchements.length === 0) {
        return undefined
    }

    const base64Attachments = []
    for (const attachment of attatchements) {
        try {
            const base64 = await blobToBase64(attachment)
            base64Attachments.push({
                "ContentType": attachment.type,
                "Filename": `Anexo ${base64Attachments.length + 1}.${attachment.type.split('/')[1]}`,
                "Base64Content": base64
            })
        } catch(error : any) {
            Logger.error(`Error reading attachment: ${error}`)
            continue
        }
    }

    return base64Attachments.length > 0 ? base64Attachments : undefined
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (!reader || !reader.result) {
                reject('Error reading file');
                return;
            }

            resolve(reader.result.toString().split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

import { ObjectId } from "mongodb"
import db from '../database/mongo'

export interface NotificationHistory {
    _id: ObjectId
    regionId: string
    reportId: string
    success: boolean
    type: "email" | "reddit" | "none"
    target: string
    errorMessage: string | null
    createdAt: Date
}

const collection = 'notificationHistory';

export const createNotificationHistory = async (notificationHistory: NotificationHistory): Promise<NotificationHistory | null> => {
    notificationHistory.createdAt = new Date();
    const notificationHistoryCollection = db.collection<NotificationHistory>(collection);
    const result = await notificationHistoryCollection.insertOne(notificationHistory);
    if (result.insertedId) {
        notificationHistory._id = result.insertedId;
        return notificationHistory;
    }

    return null;
}

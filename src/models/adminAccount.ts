import { ObjectId } from 'mongodb';
import db from '../database/mongo'

export interface AdminAccount {
    _id: ObjectId;
    uuid: string
    ipAddress: string
}

const collection = 'adminAccounts';

export const getByUuidAndIp = async (uuid: string, ipAddress: string): Promise<AdminAccount | null> => {
    const account = await db
        .collection<AdminAccount>(collection)
        .findOne({ uuid, ipAddress });
    return account;
}

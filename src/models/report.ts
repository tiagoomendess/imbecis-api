import type { Coordinate } from './coordinate';
import db from '../database/mongo'
import { ObjectId } from 'mongodb';

export const STATUS = {
    NEW: 'new',
    WAIT_PICTURE: 'wait_picture',
    FILL_EXTRA_INFO: 'fill_extra_info',
    REVIEW: 'review',
    REJECTED: 'rejected',
    APPROVED: 'approved',
    REVIEW_REQUESTED: 'review_requested',
}

export interface Report {
    _id: ObjectId;
    status: string;
    municipality?: string;
    picture?: string;
    plateId?: ObjectId;
    location: Coordinate;
    deviceUUID: string;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
    updatedAt: Date;
}

const collection = 'reports';

export const getReports =
    async (): Promise<Report[]> => {
        const reports = await db
            .collection<Report>(collection)
            .find()
            .toArray();
        return reports;
    };

export const createReport =
    async (report: Report): Promise<ObjectId | null> => {
        report.createdAt = new Date();
        report.updatedAt = new Date();

        const result = await db
            .collection<Report>(collection)
            .insertOne(report);
        return result.insertedId ? result.insertedId : null;
    };

export const updateReport =
    async (report: Report): Promise<boolean> => {
        report.updatedAt = new Date();

        const result = await db
            .collection<Report>(collection)
            .updateOne({ _id: report._id }, { $set: report });
        return result.modifiedCount > 0;
    };

export const getReportById =
    async (id: ObjectId): Promise<Report | null> => {
        const user = await db
            .collection<Report>(collection)
            .findOne({ _id: id});
        return user;
    };

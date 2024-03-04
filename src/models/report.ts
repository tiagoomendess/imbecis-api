import type { Coordinate } from './coordinate';
import db from '../database/mongo'
import { ObjectId } from 'mongodb';

export const STATUS = {
    NEW: 'new',
    REVIEW: 'review',
    REJECTED: 'rejected',
    CONFIRMED: 'confirmed',
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
    async (page: number = 1): Promise<Report[]> => {

        const reports = await db
            .collection<Report>(collection)
            .find()
            .skip((page - 1) * 10)
            .limit(10)
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
            .findOne({ _id: id });
        return user;
    };

export const getReportForReview =
    async (ipAddress: string, deviceUUID: string, location: Coordinate): Promise<Report | null> => {
        // Find one report that has a different ip address and deviceUUID
        // and updated at more than 5 minutes ago
        // order by createdAt ascending
        const report = await db
            .collection<Report>(collection)
            .findOne({
                status: STATUS.REVIEW,
                ipAddress: { $ne: ipAddress },
                deviceUUID: { $ne: deviceUUID },
                updatedAt: { $lt: new Date(Date.now() - 3 * 60 * 1000) }
            }, {
                sort: { createdAt: 'asc' }
            });

        return report
    }

export const getConfirmedReports =
    async (page: number = 1): Promise<Report[]> => {
        const reports = await db
            .collection<Report>(collection)
            .find({
                status: STATUS.CONFIRMED,
                municipality: { $exists: true },
            }, {
                sort: { createdAt: 'desc' }
            })
            .skip((page - 1) * 10)
            .limit(10)
            .toArray()

        return reports
    }

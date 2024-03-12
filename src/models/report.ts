import type { Coordinate } from './coordinate';
import db from '../database/mongo'
import { ObjectId } from 'mongodb';
import type { Plate } from './plate';

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
    plate?: Plate;
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

        const reportsWithPlates = await db
            .collection<Report>(collection)
            .aggregate<Report>([
                { $skip: (page - 1) * 10 },
                { $limit: 10 },
                {
                    $lookup: {
                        from: "plates", // Replace with your Plate collection name
                        localField: "plateId",
                        foreignField: "_id",
                        as: "plate"
                    }
                },
                {
                    $unwind: {
                        path: "$plate",
                        preserveNullAndEmptyArrays: true // Keeps reports even if there is no matching plate
                    }
                }
            ])
            .toArray();

        return reportsWithPlates;
    }

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
        const report = await db
            .collection<Report>(collection)
            .aggregate<Report>([
                {
                    $match: { _id: id }
                },
                {
                    $lookup: {
                        from: "plates",
                        localField: "plateId",
                        foreignField: "_id",
                        as: "plate"
                    }
                },
                {
                    $unwind: {
                        path: "$plate",
                        preserveNullAndEmptyArrays: true
                    }
                }
            ])
            .toArray();
        return report[0] ?? null;
    };

export const getReportForReview =
    async (ipAddress: string, deviceUUID: string, userAgent: string, location: Coordinate): Promise<Report | null> => {
        const report = await db
            .collection<Report>(collection)
            .aggregate<Report>([
                {
                    $lookup: {
                        from: "reportVotes",
                        localField: "_id",
                        foreignField: "reportId",
                        as: "reportVotes"
                    }
                },
                {
                    $match: {
                        "reportVotes.ipAddress": { $ne: ipAddress },
                        "reportVotes.deviceUUID": { $ne: deviceUUID },
                        "reportVotes.userAgent": { $ne: userAgent },
                        "status": STATUS.REVIEW,
                        "ipAddress": { $ne: ipAddress },
                        "deviceUUID": { $ne: deviceUUID },
                        "userAgent": { $ne: userAgent },
                        "updatedAt": { $lt: new Date(Date.now() - (0.5 * 60 * 1000)) } // Change this later to 5 minutes
                    }
                },
                {
                    $sample: { size: 1 }
                }
            ]).toArray();

        return report[0] ?? null;
    }

export const getConfirmedReports = async (page: number = 1): Promise<Report[]> => {
    const reportsWithPlates = await db
        .collection<Report>(collection)
        .aggregate<Report>([
            { $match: { status: STATUS.CONFIRMED, municipality: { $exists: true } } },
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * 10 },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'plates',
                    localField: 'plateId',
                    foreignField: '_id',
                    as: 'plate'
                }
            },
            {
                $unwind: {
                    path: '$plate',
                    preserveNullAndEmptyArrays: true
                }
            }
        ])
        .toArray();

    return reportsWithPlates;
};

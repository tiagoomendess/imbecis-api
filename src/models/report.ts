import type { Coordinate } from './coordinate';
import db from '../database/mongo'
import { ObjectId } from 'mongodb';
import type { Plate } from './plate';
import { ReportVote } from './reportVote';

export const STATUS = {
    NEW: 'new',
    FILL_GEO_INFO: 'fill_geo_info',
    REVIEW: 'review',
    REJECTED: 'rejected',
    NOTIFY: 'notify', // This state will notify whatever is configured
    CONFIRMED_BLUR_PLATES: 'confirmed_blur_plates', // This state will blur the plates
    CONFIRMED: 'confirmed', // This state make the report public
    CONFIRMED_MANUAL_VERIFY: 'confirmed_manual_verify', // When report deem to risky for automatic confirmation
    REMOVED: 'removed', // Soft delete
}

export interface ReporterInfo {
    name: string;
    email: string;
    idNumber: string;
    idType: string;
    obs: string | undefined;
}

export interface GeoInfo {
    lon: number
    lat: number
    distrito: string
    concelho: string
    freguesia: string
    uso: string
    SEC: number
    SS: number
    rua: string
    n_porta: number
    CP: string
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
    platesBluredAt?: Date;
    originalPicture?: string;
    imageHash?: string;
    reporterInfo?: ReporterInfo;
    geoInfo?: GeoInfo;
    reportVotes?: ReportVote[];
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
    async (ipAddress: string, deviceUUID: string, userAgent: string): Promise<Report | null> => {
        const reports = await db
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
                        "status": STATUS.REVIEW,
                        "ipAddress": { $ne: ipAddress },
                        "deviceUUID": { $ne: deviceUUID },
                        "updatedAt": { $lt: new Date(Date.now() - (10 * 60 * 1000)) } // 10 minutes
                    }
                },
                {
                    $sort: { createdAt: 1 }
                }
            ]).toArray();

        const report = reports[0] ?? null;
        if (!report) {
            return null;
        }

        // update updatedAT so it does not get served again soon
        updateReport(report);

        return report;
    }

export const countAvailableReportsForReview = async (ipAddress: string, deviceUUID: string, userAgent: string): Promise<number> => {
    // Count the number or possible reports
    const results = await db
        .collection<Report>(collection)
        .aggregate([
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
                    "status": STATUS.REVIEW,
                    "ipAddress": { $ne: ipAddress },
                    "deviceUUID": { $ne: deviceUUID },
                    "updatedAt": { $lt: new Date(Date.now() - (10 * 60 * 1000)) }
                }
            },
            {
                $count: 'count'
            },
        ]).toArray();

    return results.length > 0 ? results[0].count : 0;
};

export const getConfirmedReports = async (page: number = 1, municipality: string = ""): Promise<Report[]> => {
    const matchCondition: any = {
        status: STATUS.CONFIRMED
    };

    // Conditionally add municipality to the match condition if it is not an empty string
    if (municipality !== "") {
        matchCondition.municipality = municipality;
    } else {
        matchCondition.municipality = { $exists: true };
    }

    const reportsWithPlates = await db
        .collection<Report>(collection)
        .aggregate<Report>([
            { $match: matchCondition },
            { $sort: { platesBluredAt: -1, createdAt: -1 } },
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

export const getReportsByPlateId = async (plateId: ObjectId, page: number = 1): Promise<Report[]> => {
    const reportsWithPlates = await db
        .collection<Report>(collection)
        .aggregate<Report>([
            {
                $match: {
                    plateId: plateId,
                    status: { $in: [STATUS.CONFIRMED, STATUS.NOTIFY, STATUS.CONFIRMED_BLUR_PLATES] },
                }
            },
            { $sort: { updatedAt: -1 } },
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
}

export const getReportsByStatus = async (status: string, page: number = 1): Promise<Report[]> => {
    const reportsWithPlates = await db
        .collection<Report>(collection)
        .aggregate<Report>([
            { $match: { status: status } },
            { $sort: { createdAt: 1 } },
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
}

export const getReportsByUuidOrIp = async (deviceUUID: string, ipAddress: string, page: number = 1): Promise<Report[]> => {
    const reportsWithPlates = await db
        .collection<Report>(collection)
        .aggregate<Report>([
            {
                $match: {
                    $or: [
                        { deviceUUID: deviceUUID },
                        { ipAddress: ipAddress }
                    ]
                }
            },
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
}

export const getReportsToFillGeoInfo = async (page: number = 1): Promise<Report[]> => {
    const reports = await db
        .collection<Report>(collection)
        .aggregate<Report>([
            { $match: { status: STATUS.FILL_GEO_INFO } },
            { $sort: { createdAt: 1 } },
            { $skip: (page - 1) * 10 },
            { $limit: 10 }
        ]).toArray();

    return reports;
}

export interface ListReportsParams {
    page: number;
    municipality?: string;
    status?: string;
    sortOrder: string;
}

export interface PaginatedListReports {
    reports: Report[];
    total: number;
    page: number;
}

export const listReports = async (params: ListReportsParams): Promise<PaginatedListReports> => {

    const matchCondition: any = {};

    // Conditionally add municipality to the match condition if it is not an empty string
    if (params.municipality) {
        matchCondition.municipality = params.municipality;
    }

    // Conditionally add status to the match condition if it is not an empty string
    if (params.status) {
        matchCondition.status = params.status;
    }

    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const totalResult = await db
        .collection<Report>(collection)
        .aggregate([
            { $match: matchCondition },
            {
                $count: 'count'
            },
        ]).toArray();

        const total = totalResult.length > 0 ? totalResult[0].count : 0;

    const reports = await db
        .collection<Report>(collection)
        .aggregate<Report>([
            { $match: matchCondition },
            { $sort: { createdAt: sortOrder } },
            { $skip: (params.page - 1) * 10 },
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
            },
            {
                $lookup: {
                    from: 'reportVotes',
                    localField: '_id',
                    foreignField: 'reportId',
                    as: 'reportVotes'
                }
            },
        ]).toArray();

        return {
            reports: reports,
            total: total,
            page: params.page
        };
}

export const countTotalReports = async (): Promise<number> => {
    const count = await db
        .collection<Report>(collection)
        .countDocuments();

    return count;
}

export const deleteReport = async (id: ObjectId): Promise<boolean> => {
    const result = await db
        .collection<Report>(collection)
        .deleteOne({ _id: id });

    return result.deletedCount > 0;
}

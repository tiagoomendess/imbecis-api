import type { Coordinate } from './coordinate'
import db from '../database/mongo'
import { ObjectId } from 'mongodb'

export const RESULTS = {
    IMBECILE: 'imbecile',
    NOT_IMBECILE: 'not_imbecile',
    NOT_SURE: 'not_sure',
}

export interface ReportVote {
    _id: ObjectId
    reportId: ObjectId
    deviceUUID: string
    ipAddress: string
    userAgent: string
    plateNumer: string
    plateCountry: string
    result: string
    location: Coordinate
    createdAt: Date
    updatedAt: Date
}

const collection = 'reportVotes'

export const createReportVote =
    async (reportVote: ReportVote): Promise<ObjectId | null> => {
        reportVote.createdAt = new Date()
        reportVote.updatedAt = new Date()

        const result = await db
            .collection<ReportVote>(collection)
            .insertOne(reportVote)
        return result.insertedId ? result.insertedId : null
    };

export const getReportVoteById =
    async (id: ObjectId): Promise<ReportVote | null> => {
        const reportVote = await db
            .collection<ReportVote>(collection)
            .findOne({ _id: id})
        return reportVote
    };

export const deleteReportVoteById =
    async (id: ObjectId): Promise<boolean> => {
        const result = await db
            .collection<ReportVote>(collection)
            .deleteOne({ _id: id })
        return result.deletedCount > 0
    }

export const getReportVotesByReportId =
    async (reportId: ObjectId): Promise<ReportVote[]> => {
        const reportVotes = await db
            .collection<ReportVote>(collection)
            .find({ reportId })
        return reportVotes?.toArray() ?? []
    };

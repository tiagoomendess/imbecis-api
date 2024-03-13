import { VoteRequest } from "../dtos/requests/voteRequest";
import { Report, updateReport, STATUS } from "../models/report";
import { getOrCreatePlate } from "../models/plate";
import { BadRequestError, InternalServerError } from "../errors";
import { getReportById } from "../models/report";
import { getReportVotesByReportId, ReportVote, createReportVote, RESULTS } from "../models/reportVote";
import { ObjectId } from "mongodb"

export const voteUC = async (request : VoteRequest) : Promise<boolean> => {
    const reportId = new ObjectId(request.reportId)
    const getReportPromise = getReportById(reportId)
    const getCurrentVotesPromise = getReportVotesByReportId(reportId)
    const result = await Promise.all([ getReportPromise, getCurrentVotesPromise ])
    const report = result[0]
    const currentVotes = result[1]

    if (!report)
        throw new BadRequestError(`Report with the id ${request.reportId} was not found`)

    for (const currentVote of currentVotes) {
        // If it's too similar, don't allow it
        if (currentVote.deviceUUID === request.deviceUUID || currentVote.ipAddress === request.ipAddress)
            throw new BadRequestError('Vote too similar to a previous vote')
    }

    const plateNumber = request.plateNumber.replace(/-/g, '').toUpperCase()

    const newVote = {
        reportId: reportId,
        deviceUUID: request.deviceUUID,
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        plateNumber: plateNumber,
        plateCountry: request.plateCountry,
        result: request.result,
    } as ReportVote

    const newVoteId = await createReportVote(newVote)
    if (!newVoteId)
        throw new InternalServerError('Error creating vote')

    newVote._id = newVoteId
    currentVotes.push(newVote)

    await runTransitionVerification(report, currentVotes)

    return true
}

/**
 * Checks if the report has enough votes to be verified
 */
const runTransitionVerification = async (report : Report, votes : ReportVote[]) => {

    // Hash map of string to number
    const plateNumbers : { [key: string]: number } = {}
    const plateCountry : { [key: string]: number } = {}
    const voteResults : { [key: string]: number } = {}

    let totalVotes = 0
    for (const vote of votes) {
        totalVotes++

        if (plateNumbers[vote.plateNumber] === undefined)
            plateNumbers[vote.plateNumber] = 1
        else
            plateNumbers[vote.plateNumber]++

        if (plateCountry[vote.plateCountry] === undefined)
            plateCountry[vote.plateCountry] = 1
        else
            plateCountry[vote.plateCountry]++

        if (voteResults[vote.result] === undefined)
            voteResults[vote.result] = 1
        else
            voteResults[vote.result]++
    }

    // sort plateCountry from most to least
    const mostVotedCountry = Object.keys(plateCountry).sort((a, b) => plateCountry[b] - plateCountry[a])[0]

    const imbecileVotes = voteResults[RESULTS.IMBECILE] ?? 0
    const notSureVotes = voteResults[RESULTS.NOT_SURE] ?? 0

    // If there are 3 or more cotes with result = imbecile and all the votes agree on the same plate number, confirm the report
    if (imbecileVotes >= 3 && imbecileVotes > totalVotes / 2) {
        for (const plateNumber in plateNumbers) {
            if (plateNumbers[plateNumber] >= 3 && plateNumber != "") {
                const plate = await getOrCreatePlate(plateNumber, mostVotedCountry)
                report.plateId = plate._id
                report.status = STATUS.CONFIRMED
                await updateReport(report)
                return
            }
        }
    }

    if (notSureVotes >= 3 && notSureVotes > totalVotes / 2) {
        report.status = STATUS.REJECTED
        await updateReport(report)
        return
    }
}

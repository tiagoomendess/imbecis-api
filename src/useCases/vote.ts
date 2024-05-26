import { VoteRequest } from "../dtos/requests/voteRequest";
import { Report, updateReport, STATUS } from "../models/report";
import { getOrCreatePlate } from "../models/plate";
import { BadRequestError, InternalServerError } from "../errors";
import { getReportById } from "../models/report";
import { getReportVotesByReportId, ReportVote, createReportVote, RESULTS, getReportVotesByUuidOrIP } from "../models/reportVote";
import { ObjectId } from "mongodb"
import Logger from "../utils/logger";

export const voteUC = async (request: VoteRequest): Promise<boolean> => {
    const reportId = new ObjectId(request.reportId)
    const getReportPromise = getReportById(reportId)
    const getCurrentVotesPromise = getReportVotesByReportId(reportId)
    const shouldBeBlockedPromise = shouldBeBlocked(request)
    const result = await Promise.all([getReportPromise, getCurrentVotesPromise, shouldBeBlockedPromise])
    const report = result[0]
    const currentVotes = result[1]
    const shouldBlock = result[2]

    if (!report)
        throw new BadRequestError(`Denúncia com o id ${request.reportId} não foi encontrada`)

    if (shouldBlock) {
        console.warn(`Vote throttled UUID ${report.deviceUUID}, IP ${report.ipAddress}, might be spam`)
        throw new BadRequestError('Voto bloqueado por suspeitas de fraude')
    }

    for (const currentVote of currentVotes) {
        // If it's too similar, don't allow it
        if (currentVote.deviceUUID === request.deviceUUID || currentVote.ipAddress === request.ipAddress) {
            console.warn(`Vote too similar to a previous vote ${report.plate?.number}`)
            throw new BadRequestError('Possível voto duplicado, ignorado')
        }
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
    if (!newVoteId) {
        console.error(`Did not registered new vote for report ${reportId}`)
        throw new InternalServerError('Erro ao guardar o voto')
    }

    newVote._id = newVoteId
    currentVotes.push(newVote)

    await runTransitionVerification(report, currentVotes)

    return true
}

/**
 * Checks if the report has enough votes to be verified
 */
const runTransitionVerification = async (report: Report, votes: ReportVote[]) => {

    // Hash map of string to number
    const plateNumbers: { [key: string]: number } = {}
    const plateCountry: { [key: string]: number } = {}
    const voteResults: { [key: string]: number } = {}

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
    if (imbecileVotes >= 3 && imbecileVotes > totalVotes / 1.8) {
        for (const plateNumber in plateNumbers) {
            if (plateNumbers[plateNumber] >= 3 && plateNumber != "") {
                const plate = await getOrCreatePlate(plateNumber, mostVotedCountry)
                report.plateId = plate._id
                report.status = STATUS.NOTIFY
                report.userAgent = "redacted"
                report.ipAddress = "redacted"
                report.deviceUUID = "redacted"
                await updateReport(report)
                Logger.info(`Report ${report._id} confirmed imbecile with plate ${mostVotedCountry} ${plateNumber}`)
                return
            }
        }
    }

    if (notSureVotes >= 5 && notSureVotes > totalVotes / 1.8) {
        report.status = STATUS.REJECTED
        report.userAgent = "redacted"
        report.ipAddress = "redacted"
        report.deviceUUID = "redacted"
        await updateReport(report)
        Logger.info(`Report ${report._id} rejected`)
        return
    }
}

const shouldBeBlocked = async (request: VoteRequest): Promise<boolean> => {
    const lastUserVotes = await getReportVotesByUuidOrIP(request.deviceUUID, request.ipAddress, 1)

    // Handle not sure spam
    if (request.result === RESULTS.NOT_SURE) {
        let notSureCount = 0
        for (const vote of lastUserVotes) {
            if (vote.result === RESULTS.NOT_SURE)
                notSureCount++
            else
                return false
        }

        return notSureCount >= 3
    }

    // handle same plate spam
    if (request.result == RESULTS.IMBECILE) {
        const requestPlateKey = `${request.plateCountry}_${request.plateNumber}`

        for (const vote of lastUserVotes) {
            if (vote.result === RESULTS.IMBECILE) {
                let plateKey = `${vote.plateCountry}_${vote.plateNumber}`
                if (plateKey === requestPlateKey)
                    return true
            }
        }

        return false
    }

    // unknow result type
    return false
}

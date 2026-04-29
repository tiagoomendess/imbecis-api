import { GeoInfo, getReportsToFillGeoInfo, updateReport, STATUS } from '../models/report'
import Logger from '../utils/logger';
import { getFullInfoByCoords, LocationNotFoundError } from '../gateways/geoApiPT';

export const fillGeoLocationData = async () => {
    Logger.info("=== Starting fillGeoLocationData job ====================")
    try {
        await doFillGeoLocationData()
    } catch (error : any) {
        Logger.error(`Error filling geo location data: ${error}`)
    }

    Logger.info("=== Ending fillGeoLocationData job ====================")
}

const doFillGeoLocationData = async () => {
    let totalProcessed = 0
    let totalFailed = 0
    let totalRejected = 0
    let page = 1;
    let reports = await getReportsToFillGeoInfo(page)

    while (reports.length > 0) {
        Logger.info(`Found ${reports.length} reports to fill geo location data (page ${page})`)
        for (const report of reports) {
            totalProcessed++
            try {
                const info = await getGeoinfo(report.location.latitude, report.location.longitude)
                if (!info) {
                    totalFailed++
                    Logger.warn(`Could not get geo info for report ${report._id}`)
                    continue
                }

                report.geoInfo = info
                report.municipality = info.concelho
                report.status = STATUS.REVIEW
                await updateReport(report)
            } catch (err) {
                if (err instanceof LocationNotFoundError) {
                    totalRejected++
                    Logger.warn(`Location not found for report ${report._id}, rejecting report`)
                    report.status = STATUS.REJECTED
                    await updateReport(report)
                } else {
                    throw err
                }
            }
        }

        reports = await getReportsToFillGeoInfo(++page)
    }

    Logger.info(`Filled GeoInfo for ${totalProcessed} reports, ${totalFailed} failed, ${totalRejected} rejected.`)
}

const getGeoinfo = async (lat : number, lon : number) : Promise<GeoInfo | null> => {
    let tries = 0
    while (tries < 3) {
        try {
            const info = await getFullInfoByCoords(lat, lon)
            if (info) return info
        } catch (err) {
            if (err instanceof LocationNotFoundError) throw err
            Logger.error(`Unexpected error fetching geo info for ${lat}, ${lon}: ${err}`)
        }
        Logger.warn(`Could not get geo info for coordinates ${lat}, ${lon}, retrying (${tries + 1} of 3)...`)
        tries++
        await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return null
}

import { IsIn, IsString, IsUUID, IsIP, IsMongoId, IsOptional, IsAlphanumeric } from "class-validator"
import { STATUS } from "../../models/report"
import { AVAILABLE_COUNTRY_CODES } from "../../utils/constants"


export class UpdateReportRequest {
    constructor(
        reportId: string,
        status: string,
        plateCountry: string,
        plateNumber: string,
        ipAddress?: string,
        deviceUUID?: string,
    ) {
        this.reportId = reportId
        this.status = status
        this.plateCountry = plateCountry
        this.plateNumber = plateNumber
        this.ipAddress = ipAddress ?? ''
        this.deviceUUID = deviceUUID ?? ''
    }

    @IsMongoId()
    public reportId: string

    @IsString()
    @IsIn([
        STATUS.NEW,
        STATUS.FILL_GEO_INFO,
        STATUS.REVIEW,
        STATUS.REJECTED,
        STATUS.NOTIFY,
        STATUS.CONFIRMED_BLUR_PLATES,
        STATUS.CONFIRMED,
        STATUS.CONFIRMED_MANUAL_VERIFY,
        STATUS.REMOVED,
    ])
    public status: string

    @IsOptional()
    @IsIn(AVAILABLE_COUNTRY_CODES)
    public plateCountry: string

    @IsOptional()
    @IsString()
    @IsAlphanumeric()
    public plateNumber: string

    @IsUUID(4)
    public deviceUUID: string

    @IsIP()
    public ipAddress: string
}

import { IsIP, IsMongoId, IsUUID } from 'class-validator'

export class DeleteReportRequest {
    constructor(
        reportId: string,
        ipAddress?: string,
        deviceUUID?: string,
    ) {
        this.reportId = reportId
        this.ipAddress = ipAddress ?? ''
        this.deviceUUID = deviceUUID ?? ''
    }

    @IsMongoId()
    public reportId: string

    @IsUUID(4)
    public deviceUUID: string

    @IsIP()
    public ipAddress: string
}

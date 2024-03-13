import { IsNotEmpty, IsString, IsUUID, IsIP, Length, IsLatitude, IsLongitude, ValidateIf } from "class-validator";

export class GetReportForReviewRequest {

    constructor(deviceUUID?: string, ipAddress?: string) {
        this.deviceUUID = deviceUUID ?? ''
        this.ipAddress = ipAddress ?? ''
        this.userAgent = ''
    }

    @IsNotEmpty({ message: 'Device UUID is required'})
    @IsUUID(4, { message: 'Device UUID is invalid'})
    public deviceUUID: string

    @IsNotEmpty({ message: 'IP Address is required'})
    @IsIP()
    public ipAddress: string

    @IsString({ message: 'User Agent is not a string'})
    @Length(5, 300)
    public userAgent: string
}

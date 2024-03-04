import { IsNotEmpty, IsString, IsUUID, IsIP, Length, IsLatitude, IsLongitude, ValidateIf } from "class-validator";
import { Transform } from "class-transformer";

export class GetReportForReviewRequest {

    constructor(latitude?: number, longitude?: number, deviceUUID?: string, ipAddress?: string) {
        this.latitude = latitude ?? 200
        this.longitude = longitude ?? 200
        this.deviceUUID = deviceUUID ?? ''
        this.ipAddress = ipAddress ?? ''
        this.userAgent = ''
    }

    @Transform(({ value }) => parseFloat(value))
    @IsLatitude({ message: 'Latitude is invalid', always: true })
    public latitude: number

    @Transform(({ value }) => parseFloat(value))
    @IsLongitude({ message: 'Longitude is invalid', always: true})
    public longitude: number

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

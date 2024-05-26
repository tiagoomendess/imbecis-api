import { IsIP, IsNotEmpty, IsObject, IsString, IsUUID, ValidateNested, Length, IsOptional } from 'class-validator';
import { CoordinateDto } from '../coordinateDto';
import { ReporterInfo } from '../reporterInfo';

export class CreateReportRequest {
    constructor() {
        this.location = new CoordinateDto()
        this.deviceUUID = ''
        this.userAgent = ''
        this.ipAddress = ''
        this.imageHash = ''
    }

    @IsNotEmpty({ message: 'Location is required'})
    @IsObject({ message: 'Location is invalid'})
    @ValidateNested()
    public location: CoordinateDto

    @IsString({ message: 'Image Hash is not a string invalid'})
    @Length(63, 65, { message: 'Image Hash is invalid'})
    public imageHash: string

    @IsOptional()
    @ValidateNested()
    public reporterInfo : ReporterInfo | undefined

    @IsString({ message: 'Device UUID is not a string invalid'})
    @IsNotEmpty({ message: 'Device UUID is required'})
    @IsUUID(4, { message: 'Device UUID is invalid'})
    public deviceUUID: string

    @IsString({ message: 'User Agent is not a string invalid'})
    @Length(5, 300)
    public userAgent: string

    @IsIP()
    public ipAddress: string
}

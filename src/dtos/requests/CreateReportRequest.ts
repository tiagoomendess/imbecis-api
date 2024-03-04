import { IsIP, IsNotEmpty, IsObject, IsString, IsUUID, ValidateNested, Length } from 'class-validator';
import { CoordinateDto } from '../coordinateDto';

export class CreateReportRequest {
    constructor() {
        this.location = new CoordinateDto()
        this.deviceUUID = ''
        this.userAgent = ''
        this.ipAddress = ''
    }

    @IsNotEmpty({ message: 'Location is required'})
    @IsObject({ message: 'Location is invalid'})
    @ValidateNested()
    public location: CoordinateDto;

    @IsString({ message: 'Device UUID is not a string invalid'})
    @IsNotEmpty({ message: 'Device UUID is required'})
    @IsUUID(4, { message: 'Device UUID is invalid'})
    public deviceUUID: string;

    @IsString({ message: 'User Agent is not a string invalid'})
    @Length(5, 300)
    public userAgent: string

    @IsIP()
    public ipAddress: string
}

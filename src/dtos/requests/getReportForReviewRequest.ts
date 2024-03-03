import { CoordinateDto } from "../coordinateDto";
import { IsNotEmpty, IsObject, ValidateNested, IsString, IsUUID, IsIP } from "class-validator";


export class GetReportForReviewRequest {

    constructor(location?: CoordinateDto, deviceUUID?: string, ipAddress?: string) {
        this.location = location ?? new CoordinateDto();
        this.deviceUUID = deviceUUID ?? '';
        this.ipAddress = ipAddress ?? '';
    }

    @IsNotEmpty({ message: 'Location is required'})
    @IsObject({ message: 'Location is invalid'})
    @ValidateNested()
    public location : CoordinateDto;

    @IsNotEmpty({ message: 'Device UUID is required'})
    @IsUUID(4, { message: 'Device UUID is invalid'})
    public deviceUUID: string;

    @IsIP()
    public ipAddress: string;
}

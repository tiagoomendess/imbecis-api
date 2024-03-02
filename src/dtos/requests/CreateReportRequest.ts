import { IsNotEmpty, IsObject, IsString, IsUUID, ValidateNested } from 'class-validator';
import { CoordinateDto } from '../coordinateDto';


export class CreateReportRequest {
    constructor() {
        this.location = new CoordinateDto();
        this.deviceUUID = '';
    }

    @IsNotEmpty({ message: 'Location is required'})
    @IsObject({ message: 'Location is invalid'})
    @ValidateNested()
    public location: CoordinateDto;

    @IsString({ message: 'Device UUID is not a string invalid'})
    @IsNotEmpty({ message: 'Device UUID is required'})
    @IsUUID(4, { message: 'Device UUID is invalid'})
    public deviceUUID: string;
}

import { IsLatitude, IsLongitude, IsNotEmpty, ValidateIf } from 'class-validator';

export class CoordinateDto {
    constructor() {
        this.latitude = 200;
        this.longitude = 200;
    }

    @IsLatitude({ message: 'Latitude is invalid'})
    public latitude: number;

    @IsLongitude({ message: 'Longitude is invalid' })
    public longitude: number;
}

import { IsLatitude, IsLongitude, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class CoordinateDto {
    constructor() {
        this.latitude = 0;
        this.longitude = 0;
    }

    @IsLatitude({ message: 'Latitude is invalid'})
    @IsNotEmpty({ message: 'Latitude is required'})
    public latitude: number;

    @IsLongitude({ message: 'Longitude is invalid' })
    @IsNotEmpty({ message: 'Longitude is required'})
    public longitude: number;
}

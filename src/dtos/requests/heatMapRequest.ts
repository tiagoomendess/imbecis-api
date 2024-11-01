import { IsNumber, IsOptional } from "class-validator"

export class HeatMapRequest {
    constructor(lat1: number, lon1: number, lat2: number, lon2: number) {
        this.lat1 = lat1 || 0
        this.lon1 = lon1 || 0
        this.lat2 = lat2 || 0
        this.lon2 = lon2 || 0
    }

    @IsOptional()
    @IsNumber()
    public lat1: number

    @IsOptional()
    @IsNumber()
    public lon1: number

    @IsOptional()
    @IsNumber()
    public lat2: number

    @IsOptional()
    @IsNumber()
    public lon2: number
}

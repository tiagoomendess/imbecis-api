import { IsIn, IsNumber, IsOptional, IsPositive, IsString, IsUUID, IsIP } from "class-validator"
import { Transform } from "class-transformer"
import { MUNICIPALITIES } from "../../utils/constants"

export class ListReportsRequest {

    constructor(
        page: number,
        municipality?: string,
        status?: string,
        sortOrder?: string, 
        ipAddress?: string,
        deviceUUID?: string
    ) {
        this.page = page || 1
        this.municipality = municipality
        this.status = status
        this.sortOrder = sortOrder || 'desc'
        this.deviceUUID = ipAddress || ''
        this.ipAddress = deviceUUID || ''
    }

    @IsNumber()
    @IsPositive()
    @Transform(({ value }) => parseInt(value, 10))
    public page: number

    @IsOptional()
    @IsIn(MUNICIPALITIES)
    public municipality?: string

    @IsOptional()
    @IsString()
    public status?: string

    @IsOptional()
    @IsString()
    @IsIn(['asc', 'desc'])
    public sortOrder?: string

    @IsUUID(4)
    public deviceUUID: string

    @IsIP()
    public ipAddress: string
}

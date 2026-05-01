import { IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator'
import { Transform } from 'class-transformer'

export class ListMyReportsRequest {
    constructor() {
        this.page = 1
        this.pageSize = 10
    }

    @IsUUID(4, { message: 'deviceUUID is invalid' })
    public deviceUUID: string = ''

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(9999)
    @Transform(({ value }) => parseInt(value, 10))
    public page: number

    @IsOptional()
    @IsNumber()
    @Min(5)
    @Max(50)
    @Transform(({ value }) => parseInt(value, 10))
    public pageSize: number
}

import { IsDateString, IsIn, IsNumber, IsOptional, Min, Max } from 'class-validator'
import { Transform } from 'class-transformer'
import { MUNICIPALITIES } from '../../utils/constants'

export class ListConfirmedReportsRequest {
    constructor() {
        this.page = 1
        this.pageSize = 10
    }

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

    @IsOptional()
    @IsDateString({}, { message: 'from_time must be a valid ISO date string' })
    public from_time?: string

    @IsOptional()
    @IsDateString({}, { message: 'to_time must be a valid ISO date string' })
    public to_time?: string

    @IsOptional()
    @IsIn(MUNICIPALITIES, { message: 'municipality is not a valid municipality' })
    public municipality?: string
}

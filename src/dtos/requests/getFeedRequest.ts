import { IsNumber, Min, Max, IsString, IsIn } from "class-validator"
import { Transform } from "class-transformer"

export class GetFeedRequest {
    constructor(page : number = 1) {
        this.page = page
        this.municipality = ""
    }

    @IsNumber()
    @Min(1)
    @Max(9999)
    @Transform(({ value }) => parseInt(value, 10))
    public page: number

    @IsString()
    public municipality?: string
}

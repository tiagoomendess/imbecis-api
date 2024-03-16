import { IsNumber, Min, Max } from "class-validator"
import { Transform } from "class-transformer"

export class GetPlatesListRequest {
    constructor(page: number = 1) {
        this.page = page
    }

    @IsNumber()
    @Min(1)
    @Max(99999)
    @Transform(({ value }) => parseInt(value, 10))
    public page: number
}

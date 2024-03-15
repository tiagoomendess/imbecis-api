import { IsIn, IsString } from "class-validator"
import { AVAILABLE_COUNTRY_CODES } from '../../utils/constants'
import { Transform } from "class-transformer"

export class GetPlateByNumberRequest {

    constructor(number: string = "", country: string = "pt") {
        this.number = number
        this.country = country
    }

    @IsString({ message: 'Number is not a string'})
    @Transform(({ value }) => value.toUpperCase().replace(/[\s\-]+/g, ''))
    public number: string

    @IsIn(AVAILABLE_COUNTRY_CODES, { message: 'Country is not a valid country code'})
    public country: string
}

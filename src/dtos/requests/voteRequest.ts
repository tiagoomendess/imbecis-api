import { IsIP, IsMongoId, IsUUID, IsString, Length, IsIn, ValidateNested, IsObject, IsNotEmpty, IsOptional } from "class-validator"
import { CoordinateDto } from '../coordinateDto'
import { AVAILABLE_COUNTRY_CODES } from '../../utils/constants'
import { RESULTS } from '../../models/reportVote'
import { Transform } from "class-transformer"

export class VoteRequest {
    constructor(
        reportId: string = "",
        deviceUUID: string = "",
        ipAddress: string = "",
        userAgent: string = "",
        plateNumber: string = "",
        plateCountry: string = "",
        result: string = "",
        location: CoordinateDto = new CoordinateDto()
    ) {
        this.reportId = reportId
        this.deviceUUID = deviceUUID
        this.ipAddress = ipAddress
        this.userAgent = userAgent
        this.plateNumber = plateNumber
        this.plateCountry = plateCountry
        this.result = result
        this.location = location
    }

    @IsMongoId()
    public reportId: string

    @IsUUID(4)
    public deviceUUID: string

    @IsIP()
    public ipAddress: string

    @IsString({ message: 'User Agent is not a string invalid'})
    @Length(5, 300)
    public userAgent: string

    @Transform(({ value }) => value.toUpperCase())
    @IsString({ message: 'Plate Number is not a string invalid'})
    @IsOptional()
    public plateNumber: string

    @Transform(({ value }) => value.toLowerCase())
    @IsString({ message: 'Plate Country is not a string invalid'})
    @IsIn(AVAILABLE_COUNTRY_CODES)
    public plateCountry: string


    @IsString({ message: 'Result is not a string invalid'})
    @IsIn([RESULTS.IMBECILE, RESULTS.NOT_SURE])
    public result: string

    @IsNotEmpty({ message: 'Location is required'})
    @IsObject({ message: 'Location is invalid'})
    @ValidateNested()
    public location: CoordinateDto
}

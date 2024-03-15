import { IsMongoId, IsNumber, Min, Max } from "class-validator";

export class GetPlateReportsRequest {
    constructor(plateId: string = '', page: number = 1) {
        this.plateId = plateId
        this.page = page
    }

    @IsMongoId({ message: 'Plate ID is not a valid ID'})
    public plateId: string

    @IsNumber()
    @Min(1)
    @Max(1000)
    public page : number
}

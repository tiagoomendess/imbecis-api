import { IsMongoId } from "class-validator";

export class GetReportByIdRequest {
    constructor(id?: string) {
        this.id = id ?? ""
    }

    @IsMongoId()
    public id : string
}

import { IsMongoId } from "class-validator";

export class GetReportByIdRequest {
    constructor(reportId?: string) {
        this.reportId = reportId ?? ""
    }

    @IsMongoId()
    public reportId : string
}

import type { ReportDto } from "./reportDto";

export interface PlateReportsResponse {
    plateId : string
    page : number
    reports : ReportDto[]
}

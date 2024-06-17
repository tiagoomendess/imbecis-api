import { ReportInListDto } from "./reportInListDto";

export interface ListReportsResponse {
    total: number;
    page: number;
    reports: ReportInListDto[];
}

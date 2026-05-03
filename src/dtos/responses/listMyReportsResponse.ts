export interface MyReportItemDto {
    id: string
    picture: string | null
    pdf: string | null
    status: string
    municipality: string | null
    occurredAt: string
}

export interface ListMyReportsResponse {
    meta: {
        page: number
        pageSize: number
        total: number
        totalPages: number
    }
    data: MyReportItemDto[]
}

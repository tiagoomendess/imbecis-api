export interface ConfirmedReportLocationDto {
    latitude: number
    longitude: number
    municipality?: string
    freguesia?: string
    street?: string
    doorNumber?: number
    postal_code?: string
}

export interface ConfirmedReportItemDto {
    id: string
    occurredAt: string
    createdAt: string
    picture: string | null
    plateNumber: string | null
    plateCountry: string | null
    location: ConfirmedReportLocationDto
}

export interface ListConfirmedReportsResponse {
    meta: {
        page: number
        pageSize: number
        total: number
        totalPages: number
    }
    data: ConfirmedReportItemDto[]
}

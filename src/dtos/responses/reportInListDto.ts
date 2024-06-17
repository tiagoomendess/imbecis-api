
export interface PlateInListDto {
    country: string
    number: string
}

export interface ReportInListDto {
    id: string
    status: string
    municipality?: string
    originalPicture?: string
    publicPicture?: string
    suggestedPlate?: PlateInListDto
    confirmedPlate?: PlateInListDto
    notSureVotes: number
    imbecileVotes: number
    createdAt: Date
    updatedAt: Date
}

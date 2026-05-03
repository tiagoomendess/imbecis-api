import type { GeoInfo, Report } from '../models/report'

export const getAddress = (locationFullInfo: GeoInfo): string => {
    const street = locationFullInfo.rua ? `${locationFullInfo.rua}` : ''
    const number = locationFullInfo.n_porta ? ` ${locationFullInfo.n_porta}` : ''
    const postalCode = locationFullInfo.CP ? `, ${locationFullInfo.CP}` : ''
    const freguesia = locationFullInfo.freguesia ? `, ${locationFullInfo.freguesia}` : ''
    const municipality = locationFullInfo.concelho ? `, ${locationFullInfo.concelho}` : ''

    return `${street}${number}${postalCode}${freguesia}${municipality}`
}

export const getDocumentTypeStr = (idType: string): string => {
    switch (idType) {
        case 'cc':
            return 'Cartão de Cidadão'
        case 'residency':
            return 'Autorização de Residência'
        case 'passport':
            return 'Passaporte'
        default:
            return ''
    }
}

export const getGoogleMapsLink = (report: Report): string => {
    return `https://www.google.com/maps/search/?api=1&query=${report.location.latitude},${report.location.longitude}`
}

export const getInfractionDate = (report: Report): Date =>
    report.occurredAt ?? report.createdAt

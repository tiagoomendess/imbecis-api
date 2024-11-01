import { HeatMapRequest } from "../dtos/requests/heatMapRequest"
import { HeatMapResponse } from "../dtos/responses/heatMapResponse"
import { getHeatMapCoordinates } from "../models/report"

export const getHeatMapCoordinatesUC = async (request: HeatMapRequest): Promise<HeatMapResponse> => {

    // TODO: Implement request constraints so the whole collection is not dumped
    const coords = await getHeatMapCoordinates()

    // Make coordinates less precise for security reasons
    coords.forEach(coord => {
        coord.latitude = parseFloat(coord.latitude.toFixed(4))
        coord.longitude = parseFloat(coord.longitude.toFixed(4))
    })

    return {
        coordinates: coords
    } as HeatMapResponse
}

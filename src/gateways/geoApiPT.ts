import axios from 'axios'

const BASE_URL = 'https://json.geoapi.pt'

export const getMunicipalityByCoords = async (latitude: number, longitude: number) : Promise<string | null> => {
    try {
        const response = await axios.get(`${BASE_URL}/gps?lat=${latitude}&lon=${longitude}&ext-apis=false`)
        if (response.status !== 200) {
            return null
        }

        return response.data?.concelho || null
    } catch (error) {
        console.error(`Could not get municipality for coordinates ${latitude}, ${longitude} from GeoApiPT: ${error}`)
        return null
    }
}

export interface GeoApiPTResponse {
    lon: number
    lat: number
    distrito: string
    concelho: string
    freguesia: string
    uso: string
    SEC: number
    SS: number
    rua: string
    n_porta: number
    CP: string
}

export const getFullInfoByCoords = async (latitude: number, longitude: number) : Promise<GeoApiPTResponse | null> => {
    try {
        const response = await axios.get(`${BASE_URL}/gps?lat=${latitude}&lon=${longitude}&ext-apis=true`)
        if (response.status !== 200) {
            return null
        }

        if (!response.data) {
            return null
        }

        return response.data as GeoApiPTResponse
    } catch (error) {
        console.error(`Could not get full info for coordinates ${latitude}, ${longitude} from GeoApiPT: ${error}`)
        return null
    }
}

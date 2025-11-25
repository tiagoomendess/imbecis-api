import axios from 'axios'
import config from '../config'
import Logger from '../utils/logger'

const BASE_URL = 'https://json.geoapi.pt'

export const getMunicipalityByCoords = async (latitude: number, longitude: number): Promise<string | null> => {
    Logger.info(`API Key: ${config.geoApiPT.key}`)
    try {
        // wait 1 second to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))

        const response = await axios.get(`${BASE_URL}/gps?lat=${latitude}&lon=${longitude}&ext-apis=false`)
        if (response.status !== 200) {
            return null
        }

        return response.data?.concelho || null
    } catch (error) {
        Logger.error(`Could not get municipality for coordinates ${latitude}, ${longitude} from GeoApiPT: ${error}`)
        return null
    } finally {
        // Reset axios to not use any proxy
        axios.defaults.proxy = false
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

export const getFullInfoByCoords = async (latitude: number, longitude: number): Promise<GeoApiPTResponse | null> => {
    Logger.info(`API Key: ${config.geoApiPT.key}`)
    try {
        // wait 1 second to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))

        const response = await axios.get(`${BASE_URL}/gps?lat=${latitude}&lon=${longitude}&ext-apis=true`)
        if (response.status !== 200) {
            return null
        }

        if (!response.data) {
            return null
        }

        return response.data as GeoApiPTResponse
    } catch (error) {
        Logger.error(`Could not get full info for coordinates ${latitude}, ${longitude} from GeoApiPT: ${error}`)
        return null
    }
}

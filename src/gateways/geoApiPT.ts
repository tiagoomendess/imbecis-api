import axios from 'axios'
import config from '../config'
import Logger from '../utils/logger'

const BASE_URL = 'https://json.geoapi.pt'

export class LocationNotFoundError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'LocationNotFoundError'
    }
}

export const getMunicipalityByCoords = async (latitude: number, longitude: number): Promise<string | null> => {
    try {
        console.log(`API KEY: ${config.geoApiPT.key}`)

        // wait 1 second to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))

        const response = await axios.get(
            `${BASE_URL}/gps?lat=${latitude}&lon=${longitude}&ext-apis=false`,
            {
                headers: {
                    'x-api-Key': `${config.geoApiPT.key}`,
                },
                timeout: 15000,
            }
        )
        if (response.status !== 200) {
            return null
        }

        return response.data?.concelho || null
    } catch (error) {
        Logger.error(`Could not get municipality for coordinates ${latitude}, ${longitude} from GeoApiPT: ${error}`)
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

export const getFullInfoByCoords = async (latitude: number, longitude: number): Promise<GeoApiPTResponse | null> => {
    try {
        console.log(`API KEY: ${config.geoApiPT.key}`)
        // wait 1 second to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))

        const axiosInstance = axios.create({
            headers: {
                'x-api-key': `${config.geoApiPT.key}`,
            },
            timeout: 15000,
          })

        const response = await axiosInstance.get(
            `${BASE_URL}/gps?lat=${latitude}&lon=${longitude}&ext-apis=false`
        )

        if (response.headers) {
            console.log(`GeoApiPT response headers: ${JSON.stringify(response.headers)}`)
        }

        if (response.status !== 200) {
            return null
        }

        if (!response.data) {
            return null
        }

        return response.data as GeoApiPTResponse
    } catch (error) {
        Logger.error(`Could not get full info for coordinates ${latitude}, ${longitude} from GeoApiPT: ${error}`)

        if (error instanceof axios.AxiosError && error.response) {
            Logger.error(`GeoApiPT response error: ${JSON.stringify(error.response.data)}`)
            Logger.error(`GeoApiPT response headers: ${JSON.stringify(error.response.headers)}`)

            if (error.response.status === 404) {
                throw new LocationNotFoundError(`No location found for coordinates ${latitude}, ${longitude}`)
            }
        }

        return null
    }
}

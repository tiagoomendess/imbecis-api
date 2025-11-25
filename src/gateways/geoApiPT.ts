import axios from 'axios'
import config from '../config'

const BASE_URL = 'https://json.geoapi.pt'

const proxyList = [
    "138.68.60.8:80",
    "no_proxy",
    "8.221.141.88:31433",
    "152.230.215.123:80",
    "8.213.156.191:8008",
    "203.74.125.18:8888",
    "5.161.103.41:88",
    "no_proxy",
    "35.209.198.222:80",
    "133.232.93.66:80",
    "89.116.34.113:80",
    "139.59.1.14:80",
    "138.68.235.51:80",
    "no_proxy"
]

export const getMunicipalityByCoords = async (latitude: number, longitude: number): Promise<string | null> => {
    try {

        // Select 1 random proxy from the list
        const randomProxy = proxyList[Math.floor(Math.random() * proxyList.length)]

        if (randomProxy !== "no_proxy") {
            // set axios to use the proxy
            axios.defaults.proxy = {
                host: randomProxy.split(':')[0],
                port: parseInt(randomProxy.split(':')[1])
            }
        }

        const response = await axios.get(`${BASE_URL}/gps?lat=${latitude}&lon=${longitude}&ext-apis=false`)
        if (response.status !== 200) {
            return null
        }

        return response.data?.concelho || null
    } catch (error) {
        console.error(`Could not get municipality for coordinates ${latitude}, ${longitude} from GeoApiPT: ${error}`)
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
    try {
        // wait 1 second to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))

        const response = await axios.get(`${BASE_URL}/gps?lat=${latitude}&lon=${longitude}&ext-apis=true&key=${config.geoApiPT.key}`)
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

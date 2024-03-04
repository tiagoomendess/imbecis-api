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

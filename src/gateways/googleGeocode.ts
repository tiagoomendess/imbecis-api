import axios from 'axios'
import config from '../config'
import Logger from '../utils/logger'

const BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json'

export interface GoogleGeocodeAddress {
    rua?: string
    n_porta?: number
    CP?: string
}

export const getAddressByCoords = async (latitude: number, longitude: number): Promise<GoogleGeocodeAddress | null> => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                latlng: `${latitude},${longitude}`,
                key: config.googleGeocode.key,
                language: 'pt',
                result_type: 'street_address|premise|route',
            },
            timeout: 15000,
        })

        if (response.status !== 200) {
            return null
        }

        const data = response.data
        if (data.status !== 'OK' || !data.results || data.results.length === 0) {
            Logger.warn(`Google Geocoding returned status ${data.status} for coordinates ${latitude}, ${longitude}`)
            return null
        }

        const components: { types: string[]; long_name: string }[] = data.results[0].address_components ?? []

        const find = (type: string): string | undefined =>
            components.find(c => c.types.includes(type))?.long_name

        const ruaRaw = find('route')
        const nPortaRaw = find('street_number')
        const cpRaw = find('postal_code')

        const nPortaParsed = nPortaRaw !== undefined ? parseInt(nPortaRaw, 10) : undefined

        return {
            rua: ruaRaw,
            n_porta: nPortaParsed !== undefined && !isNaN(nPortaParsed) ? nPortaParsed : undefined,
            CP: cpRaw,
        }
    } catch (error) {
        Logger.error(`Could not get address for coordinates ${latitude}, ${longitude} from Google Geocoding: ${error}`)
        return null
    }
}

import { generateRandomString } from '../utils'

export interface CSRFToken {
    DeviceUUID: string
    CreatedAt: Date
    Token: string
}

const tokenMaxAge = 1000 * 60 * 10 // 10 minutes

const tokens = {} as {[key: string]: CSRFToken}

export const generateCSRFToken = (deviceUUID: string) : string  => {
    const tokenStr = generateRandomString(64)
    tokens[deviceUUID] = {
        Token: tokenStr,
        DeviceUUID: deviceUUID,
        CreatedAt: new Date(),
    } as CSRFToken

    return tokenStr
}

export const verifyCSRFToken = (deviceUUID: string, token: string) : boolean => {
    if (!tokens[deviceUUID]) {
        return false
    }

    const tokenObj = tokens[deviceUUID]
    const now = new Date()
    const diff = now.getTime() - tokenObj.CreatedAt.getTime()
    const result = tokenObj.Token === token && tokenObj.DeviceUUID == deviceUUID && diff < tokenMaxAge
    delete tokens[deviceUUID]

    return result
}

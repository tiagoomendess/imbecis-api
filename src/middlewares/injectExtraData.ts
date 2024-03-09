import { Request, Response, NextFunction } from 'express'

// Injects extra usefull data into the body or query of the request
const injectExtraData = (req: Request, res: Response, next: NextFunction) => {

  // Get the request data
  let requestData = req.method === 'GET' ? req.query : req.body

  // Get extra info
  requestData.ipAddress = req.headers['cf-connecting-ip'] as string || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress as string || undefined
  requestData.ipCountry = req.headers['cf-ipcountry'] as string || undefined
  requestData.deviceUUID = req.headers['device-uuid'] as string || req.headers['deviceUUID'] as string || undefined
  requestData.userAgent = req.headers['user-agent'] as string || undefined

  // Finally add data to the request
  if (req.method === 'GET') {
    if (!req.query) req.query = {}
    req.query = requestData
  } else {
    if (!req.body) req.body = {}
    req.body = requestData
  }

  next();
};

export default injectExtraData;

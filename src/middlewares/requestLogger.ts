import { Request, Response, NextFunction } from 'express';

const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const currentTime = new Date().toISOString();
        const uuid = req.header('device-uuid') || 'N/A';
        const ipAddress = req.headers['cf-connecting-ip'] as string || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress as string || "N/A"

        console.log(`[${currentTime}] ${req.method}: ${req.url} - UUID: ${uuid} IP: ${ipAddress}`);
    } catch (error) {
        console.error("Error executing request logger: ", error)
    }

    next()
};

export default requestLoggerMiddleware;

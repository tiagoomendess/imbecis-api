import express from 'express'
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
import config from './config'

import errorMiddleware from './middlewares/errorHandler'
import injectExtraData from './middlewares/injectExtraData'
import requestLoggerMiddleware from './middlewares/requestLogger';

import indexRoutes from './routes/indexRoutes'
import userRoutes from './routes/userRoutes'
import reportRoutes from './routes/reportRoutes'
import plateRoutes from './routes/plateRoutes'

const limiter = rateLimit({
    windowMs: 10 * 1000,
    max: 20,
    standardHeaders: 'draft-7',
	legacyHeaders: false,
    message: {
        success: false,
        message: "Muitos pedidos feitos num curto espaço de tempo, aguarda alguns segundos e tenta novamente."
    },
    validate: {xForwardedForHeader: false}
})

const corsOption = {
    origin: "*",
    credentials: true,
};

if (config.app.isDevelopment) {
    corsOption.origin = "*"
    corsOption.credentials = false
} else {
    corsOption.origin = "https://imbecis.app"
}

const app = express()
app.use(limiter)
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors(corsOption))
app.use(injectExtraData)
app.use(requestLoggerMiddleware)

// Routes
app.use('/', indexRoutes)
app.use('/users', userRoutes)
app.use('/reports', reportRoutes)
app.use('/plates', plateRoutes)

app.use(errorMiddleware)

export default app

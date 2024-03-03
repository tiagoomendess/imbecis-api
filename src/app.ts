import express from 'express'
import indexRoutes from './routes/indexRoutes'
import userRoutes from './routes/userRoutes'
import reportRoutes from './routes/reportRoutes'

import errorMiddleware from './middlewares/errorHandler'
import injectExtraData from './middlewares/injectExtraData'
import cors from 'cors'

const corsOption = {
    origin: "*",
    credentials: true,
};

const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors(corsOption))
app.use(injectExtraData)

// Routes
app.use('/', indexRoutes)
app.use('/users', userRoutes)
app.use('/reports', reportRoutes)

app.use(errorMiddleware)

export default app

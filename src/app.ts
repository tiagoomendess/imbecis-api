import express from 'express'
import indexRoutes from './routes/indexRoutes'
import userRoutes from './routes/userRoutes'
import reportRoutes from './routes/reportRoutes'

import errorMiddleware from './middlewares/errorHandler'
import cors from 'cors'
import { connectDB } from './database/mongoose'

const corsOption = {
    origin: "*",
    credentials: true,
};

const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors(corsOption))

// Routes
app.use('/', indexRoutes)
app.use('/users', userRoutes)
app.use('/reports', reportRoutes)

app.use(errorMiddleware)

export default app

import express from 'express'
import { index } from '../controllers/indexController'

const router = express.Router()
router.get('/', index)

export default router

import express from 'express'
import { getUser, addUser, getMe } from '../controllers/userController'

const router = express.Router()

router.get('/me', getMe)
router.get('/', getUser)
router.post('/', addUser)

export default router;

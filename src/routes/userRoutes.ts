import express from 'express'
import { getUser, addUser } from '../controllers/userController'

const router = express.Router()

router.get('/', getUser)
router.post('/', addUser)

export default router;

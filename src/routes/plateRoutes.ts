
import express from 'express'
import validationMiddleware from '../middlewares/validate'

import { getPlateReports, getPlateByNumberAndCountry, getPlatesList } from '../controllers/plateController'
import { GetPlateByNumberRequest } from '../dtos/requests/getPlateByNumberRequest'
import { GetPlateReportsRequest } from '../dtos/requests/getPlateReportsRequest'
import { GetPlatesListRequest } from '../dtos/requests/getPlatesListRequest'

const router = express.Router()

router.get('/', validationMiddleware(GetPlatesListRequest), getPlatesList)
router.get('/:country([a-z]{2})/:number([A-Z0-9]+)', validationMiddleware(GetPlateByNumberRequest), getPlateByNumberAndCountry)
router.get('/:plateId([a-z0-9]{24})/reports', validationMiddleware(GetPlateReportsRequest), getPlateReports)

export default router;

import express from 'express'
import { createRegion, updateRegion, deleteRegion, getRegions } from '../controllers/notificationRegions'
import { CreateRegionRequest } from '../dtos/requests/createRegionRequest'
import { UpdateRegionRequest } from '../dtos/requests/updateRegionRequest'
import { DeleteRegionRequest } from '../dtos/requests/deleteRegionRequest'
import validationMiddleware from '../middlewares/validate';

const router = express.Router()

router.post('/', validationMiddleware(CreateRegionRequest), createRegion)
router.put('/:id', validationMiddleware(UpdateRegionRequest), updateRegion)
router.delete('/:id', validationMiddleware(DeleteRegionRequest), deleteRegion)
router.get('/', getRegions)

export default router;

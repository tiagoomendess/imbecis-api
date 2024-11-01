import express from 'express'
import multer from 'multer';

import validationMiddleware from '../middlewares/validate';
import { csrf } from '../middlewares/csrf';
import { BadRequestError } from '../errors';

import { CreateReportRequest } from '../dtos/requests/createReportRequest';
import { GetReportForReviewRequest } from '../dtos/requests/getReportForReviewRequest';
import { UploadReportPictureRequest } from '../dtos/requests/uploadReportPictureRequest';
import { GetReportByIdRequest } from '../dtos/requests/getReportByIdRequest';
import { GetFeedRequest } from '../dtos/requests/getFeedRequest';
import { VoteRequest } from '../dtos/requests/voteRequest';
import { UpdateReportPictureRequest } from '../dtos/requests/updateReportPictureRequest';
import { ListReportsRequest } from '../dtos/requests/listReportsRequest';
import { UpdateReportRequest } from '../dtos/requests/updateReportRequest';
import { DeleteReportRequest } from '../dtos/requests/deleteReportRequest';
import { HeatMapRequest } from '../dtos/requests/heatMapRequest';

import injectExtraData from '../middlewares/injectExtraData';

import {
    createReport,
    getReportById,
    uploadPicture,
    getReportForReview,
    getFeed,
    updatePicture,
    vote,
    countAvailableReportsForReview,
    listReports,
    updateReport,
    deleteReport,
    getHeatMap,
} from '../controllers/reportController';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new BadRequestError('Only images are allowed'));
        }
    },
});

const router = express.Router()

router.post('/', validationMiddleware(CreateReportRequest), createReport)
router.get('/', validationMiddleware(ListReportsRequest), listReports)
router.patch('/:reportId([a-z0-9]{24})', validationMiddleware(UpdateReportRequest), updateReport)
router.delete('/:reportId([a-z0-9]{24})', validationMiddleware(DeleteReportRequest), deleteReport)

// TODO: Remove injectExtraData from these two, should not be necessary, the upload middleware is the one braking things
router.post('/:reportId([a-z0-9]{24})/upload-picture', upload.single('picture'), injectExtraData, validationMiddleware(UploadReportPictureRequest), csrf, uploadPicture)
router.post('/:reportId([a-z0-9]{24})/update-picture', upload.single('picture'), injectExtraData, validationMiddleware(UpdateReportPictureRequest), updatePicture)

router.get('/for-review', validationMiddleware(GetReportForReviewRequest), getReportForReview)
router.get('/for-review/count', validationMiddleware(GetReportForReviewRequest), countAvailableReportsForReview)
router.get('/:reportId([a-z0-9]{24})', validationMiddleware(GetReportByIdRequest), getReportById)
router.get('/feed', validationMiddleware(GetFeedRequest), getFeed)
router.post('/:reportId([a-z0-9]{24})/vote', validationMiddleware(VoteRequest), csrf, vote)
router.get('/heat-map', validationMiddleware(HeatMapRequest), getHeatMap)

export default router;

import express from 'express'
import multer from 'multer';

import validationMiddleware from '../middlewares/validate';
import { BadRequestError } from '../errors';

import { CreateReportRequest } from '../dtos/requests/createReportRequest';
import { GetReportForReviewRequest } from '../dtos/requests/getReportForReviewRequest';
import { UploadReportPictureRequest } from '../dtos/requests/uploadReportPictureRequest';
import { GetReportByIdRequest } from '../dtos/requests/getReportByIdRequest';
import { GetFeedRequest } from '../dtos/requests/getFeedRequest';
import { VoteRequest } from '../dtos/requests/voteRequest';

import {
    createReport,
    getReportById,
    uploadPicture,
    getReportForReview,
    getFeed,
    vote
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

// Create a new report
router.post('/', validationMiddleware(CreateReportRequest), createReport)
router.post('/:reportId([a-z0-9]{24})/upload-picture', upload.single('picture'), validationMiddleware(UploadReportPictureRequest), uploadPicture)
router.get('/for-review', validationMiddleware(GetReportForReviewRequest), getReportForReview)
router.get('/:reportId([a-z0-9]{24})', validationMiddleware(GetReportByIdRequest), getReportById)
router.get('/feed', validationMiddleware(GetFeedRequest), getFeed)
router.post('/:reportId([a-z0-9]{24})/vote', validationMiddleware(VoteRequest), vote)

export default router;

import express from 'express'
import { createReport, getReportById, uploadPicture } from '../controllers/reportController';
import validationMiddleware from '../middlewares/validate';
import { CreateReportRequest } from '../dtos/requests/CreateReportRequest';
import { GetReportByIdRequest } from '../dtos/requests/getReportByIdRequest';
import multer from 'multer';
import { UploadReportPictureRequest } from '../dtos/requests/uploadReportPictureRequest';
import { BadRequestError } from '../errors';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {

        console.log("TYPE: ", file.mimetype);

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
router.post('/:id/upload-picture', upload.single('picture'), validationMiddleware(UploadReportPictureRequest), uploadPicture)
router.get('/:id', validationMiddleware(GetReportByIdRequest), getReportById)

export default router;

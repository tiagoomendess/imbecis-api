import { Request, Response, NextFunction } from "express";
import BaseResponse from "../dtos/responses/baseResponse";

import { UploadReportPictureRequest } from "../dtos/requests/uploadReportPictureRequest";
import { CreateReportRequest } from "../dtos/requests/createReportRequest";
import { GetReportForReviewRequest } from "../dtos/requests/getReportForReviewRequest";
import { GetReportByIdRequest } from "../dtos/requests/getReportByIdRequest";
import { GetFeedRequest } from "../dtos/requests/getFeedRequest";
import { VoteRequest } from "../dtos/requests/voteRequest";
import { ListReportsRequest } from "../dtos/requests/listReportsRequest";
import { UpdateReportRequest } from "../dtos/requests/updateReportRequest";
import { DeleteReportRequest } from "../dtos/requests/deleteReportRequest";
import { HeatMapRequest } from "../dtos/requests/heatMapRequest";

import { uploadReportPictureUC } from "../useCases/uploadReportPicture";
import { getReportForReviewUC } from "../useCases/getReportForReview";
import { createReportUC } from "../useCases/createReport";
import { getReportByIdUC } from "../useCases/getReportById";
import { getFeedUC } from "../useCases/getFeed";
import { voteUC } from "../useCases/vote";
import { updateReportPictureUC } from "../useCases/updateReportPicture";
import { countAvailableReportsForReviewUC } from "../useCases/countAvailableReportsForReviewUC";
import { listReportsUC } from "../useCases/listReports";
import { updateReportUC } from "../useCases/updateReport";
import { deleteReportUC } from "../useCases/deleteReport";
import { getHeatMapCoordinatesUC } from "../useCases/getHeatMapCoordinatesUC";

import { BadRequestError } from "../errors";
import { UpdateReportPictureRequest } from "../dtos/requests/updateReportPictureRequest";

import { generateCSRFToken } from "../services/csrf";

export const createReport = async (req: Request, res: Response, next: NextFunction) => {
    const request = req.body as CreateReportRequest
    createReportUC(request)
        .then((result) => {
            res.header('csrf-token', generateCSRFToken(request.deviceUUID))
            res.status(201).send({
                success: true,
                message: "Report created successfully",
                payload: result
            } as BaseResponse)
        })
        .catch((error) => {
            next(error)
        });
}

export const getReportById = async (req: Request, res: Response, next: NextFunction) => {
    getReportByIdUC(req.body as GetReportByIdRequest)
        .then((result) => {
            let code: number = 200
            let message: string = "Report was found"
            if (!result) {
                code = 404
                message = `Report with the id ${req.params.reportId} was not found`
            }

            res.status(code).send({
                success: code === 200,
                message: message,
                payload: result
            } as BaseResponse)
        })
}

export const uploadPicture = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            throw new BadRequestError('Fotografia não foi encontrada no pedido');
        }

        await uploadReportPictureUC(req.body as UploadReportPictureRequest)

        res.status(201).send({
            success: true,
            message: "Picture uploaded successfully",
            payload: null,
        } as BaseResponse);
    } catch (error) {
        return next(error);
    }
}

export const updatePicture = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            throw new BadRequestError('Fotografia não foi encontrada no pedido');
        }

        await updateReportPictureUC(req.body as UpdateReportPictureRequest)

        res.status(201).send({
            success: true,
            message: "Picture uploaded successfully",
            payload: null,
        } as BaseResponse);
    } catch (error) {
        return next(error);
    }
}

export const getReportForReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = req.body as GetReportForReviewRequest
        const result = await getReportForReviewUC(request)

        if (result) {
            const token = generateCSRFToken(request.deviceUUID)
            res.header('csrf-token', token)
        }

        res.status(200).send({
            success: true,
            message: "Report for review",
            payload: result
        } as BaseResponse)
    } catch (error) {
        return next(error)
    }
}

export const getFeed = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reports = await getFeedUC(req.body as GetFeedRequest)

        res.status(200).send({
            success: true,
            message: "Feed",
            payload: reports
        } as BaseResponse)
    } catch (error) {
        return next(error)
    }
}

export const vote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let result = await voteUC(req.body as VoteRequest)
        res.status(201).send({
            success: true,
            message: "Vote was registered",
            payload: {
                voteRegistered: result
            }
        } as BaseResponse)
    } catch (error) {
        return next(error)
    }
}

export const countAvailableReportsForReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await countAvailableReportsForReviewUC(req.body as GetReportForReviewRequest)
        res.status(200).send({
            success: true,
            message: "Counted available reports for review",
            payload: {
                count: result
            }
        } as BaseResponse)
    } catch (error) {
        return next(error)
    }
}

export const listReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await listReportsUC(req.body as ListReportsRequest)

        res.status(200).send({
            success: true,
            message: "Report List",
            payload: response
        } as BaseResponse)
    } catch (error) {
        return next(error)
    }
}

export const updateReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updateReportUC(req.body as UpdateReportRequest)
        res.status(200).send({
            success: true,
            message: "Denúncia atualizada com sucesso",
            payload: true
        } as BaseResponse)
    } catch (error) {
        return next(error)
    }
}

export const deleteReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await deleteReportUC(req.body as DeleteReportRequest)
        res.status(200).send({
            success: true,
            message: "Denúncia eliminada com sucesso",
            payload: null
        } as BaseResponse)
    } catch (error) {
        return next(error)
    }
}

export const getHeatMap = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await getHeatMapCoordinatesUC(req.body as HeatMapRequest)
        res.status(200).send({
            success: true,
            message: "Heat Map success",
            payload: result
        } as BaseResponse)
    } catch (error) {
        return next(error)
    }
}

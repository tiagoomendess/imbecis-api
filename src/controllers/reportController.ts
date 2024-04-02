import { Request, Response, NextFunction } from "express";
import BaseResponse from "../dtos/responses/baseResponse";

import { UploadReportPictureRequest } from "../dtos/requests/uploadReportPictureRequest";
import { CreateReportRequest } from "../dtos/requests/createReportRequest";
import { GetReportForReviewRequest } from "../dtos/requests/getReportForReviewRequest";
import { GetReportByIdRequest } from "../dtos/requests/getReportByIdRequest";
import { GetFeedRequest } from "../dtos/requests/getFeedRequest";
import { VoteRequest } from "../dtos/requests/voteRequest";

import { uploadReportPictureUC } from "../useCases/uploadReportPicture";
import { getReportForReviewUC } from "../useCases/getReportForReview";
import { createReportUC } from "../useCases/createReport";
import { getReportByIdUC } from "../useCases/getReportById";
import { getFeedUC } from "../useCases/getFeed";
import { voteUC } from "../useCases/vote";
import { updateReportPictureUC } from "../useCases/updateReportPicture";

import { BadRequestError } from "../errors";
import { UpdateReportPictureRequest } from "../dtos/requests/updateReportPictureRequest";

export const createReport = async (req: Request, res: Response, next: NextFunction) => {
    createReportUC(req.body as CreateReportRequest)
        .then((result) => {
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
        const result = await getReportForReviewUC(req.body as GetReportForReviewRequest)

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

import { Request, Response, NextFunction } from "express";
import { createReportUC } from "../useCases/createReport";
import { getReportByIdUC } from "../useCases/getReportById";
import { newReportDto } from "../dtos/responses/reportDto";
import { UploadReportPictureRequest } from "../dtos/requests/uploadReportPictureRequest";
import BaseResponse from "../dtos/responses/baseResponse";
import { ObjectId } from "mongodb";

import { uploadReportPictureUC } from "../useCases/uploadReportPicture";

export const createReport = async (req: Request, res: Response, next: NextFunction) => {
    createReportUC(req)
        .then((result) => {
            res.status(201).send({
                success: true,
                message: "Report created successfully",
                payload: newReportDto(result)
            } as BaseResponse);
        })
        .catch((error) => {
            next(error);
        });
};

export const getReportById = async (req: Request, res: Response, next: NextFunction) => {
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).send({
            success: false,
            message: "Invalid id"
        } as BaseResponse);
    }

    getReportByIdUC(req.params.id)
        .then((result) => {
            let code : number = 200
            let message : string = "Report found"
            if (!result) {
                code = 404
                message = "Report not found"
            }

            res.status(code).send({
                success: code === 200,
                message: message,
                payload: result
            } as BaseResponse);
        })
}

export const uploadPicture = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        return res.status(404).send({
            success: false,
            message: "Picture file was not in the request",
            payload: null,
        } as BaseResponse);
    }

    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).send({
            success: false,
            message: "Invalid report id"
        } as BaseResponse);
    }

    try {
        const reportId = ObjectId.createFromHexString(req.params.id);
        await uploadReportPictureUC(new UploadReportPictureRequest(req.file, reportId))
    } catch (error) {
        return next(error);
    }

    res.status(200).send({
        success: true,
        message: "Picture uploaded successfully",
        payload: null,
    } as BaseResponse);
}

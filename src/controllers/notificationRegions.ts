import { Request, Response, NextFunction } from 'express';
import { createRegionUC } from '../useCases/createRegion';
import { updateRegionUC } from '../useCases/updateRegion';
import { deleteRegionUC } from '../useCases/deleteRegionUC';
import { getRegionsUC } from '../useCases/getRegions';
import type BaseResponse from '../dtos/responses/baseResponse';
import { CreateRegionRequest } from '../dtos/requests/createRegionRequest';
import { UpdateRegionRequest } from '../dtos/requests/updateRegionRequest';
import { DeleteRegionRequest } from '../dtos/requests/deleteRegionRequest';

export const createRegion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).send({
            success: true,
            message: "Região criada com sucesso",
            payload: await createRegionUC(req.body as CreateRegionRequest)
        } as BaseResponse)
    } catch (error) {
        next(error);
    }
}

export const updateRegion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).send({
            success: true,
            message: "Região editada com sucesso",
            payload: await updateRegionUC(req.body as UpdateRegionRequest)
        } as BaseResponse)
    } catch (error) {
        next(error);
    }
}

export const deleteRegion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).send({
            success: true,
            message: "Região apagada com sucesso",
            payload: await deleteRegionUC(req.body as DeleteRegionRequest)
        } as BaseResponse)
    } catch (error) {
        next(error);
    }
}

export const getRegions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).send({
            success: true,
            message: "Regiões obtidas com sucesso",
            payload: await getRegionsUC()
        } as BaseResponse)
    } catch (error) {
        next(error);
    }
}

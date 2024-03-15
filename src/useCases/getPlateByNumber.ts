import type { GetPlateByNumberRequest } from "../dtos/requests/getPlateByNumberRequest";
import { type PlateDto, newPlateDto } from "../dtos/responses/plateDto";
import { getPlateByNumberAndCountry } from "../models/plate";
import { NotFoundError } from "../errors";

export const getPlateByNumberUC = async (request: GetPlateByNumberRequest): Promise<PlateDto | null> => {
    const plate = await getPlateByNumberAndCountry(request.number, request.country);
    if (!plate) {
        throw new NotFoundError('Plate not found');
    }

    const dto = newPlateDto(plate);
    if (!dto) {
        return null;
    }

    return dto;
}

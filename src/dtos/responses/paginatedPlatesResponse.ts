import { PlateDto, newPlateDto } from './plateDto';
import { PaginatedPlates } from '../../models/plate';

export interface PaginatedPlatesResponse {
    plates: PlateDto[];
    page: number;
    total: number;
}

export const newPaginatedPlatesResponse = (paginatedPlateModel : PaginatedPlates): PaginatedPlatesResponse => {
    return {
        page: paginatedPlateModel.page,
        total: paginatedPlateModel.total,
        plates: paginatedPlateModel.plates.map(plate => newPlateDto(plate))
    } as PaginatedPlatesResponse
}

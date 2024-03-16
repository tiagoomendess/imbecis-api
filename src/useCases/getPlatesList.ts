import type { GetPlatesListRequest } from "../dtos/requests/getPlatesListRequest"
import { getPlatesOfConfirmedImbeciles } from "../models/plate"
import { PaginatedPlatesResponse } from "../dtos/responses/paginatedPlatesResponse"
import { newPaginatedPlatesResponse} from "../dtos/responses/paginatedPlatesResponse"

export const getPlatesListUC = async (request : GetPlatesListRequest): Promise<PaginatedPlatesResponse> => {
    const platesModel = await getPlatesOfConfirmedImbeciles(request.page)
    return newPaginatedPlatesResponse(platesModel)
}

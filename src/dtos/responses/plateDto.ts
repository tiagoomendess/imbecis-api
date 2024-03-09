import type { Plate } from '../../models/plate';

export interface PlateDto {
    id: string;
    country: string;
    number: string;
}

export const newPlateDto = (plate?: Plate): PlateDto | undefined => {
    if (!plate) {
        return undefined;
    }

    return {
        id: plate?._id.toString(),
        country: plate?.country,
        number: plate?.number
    };
}

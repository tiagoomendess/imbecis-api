import db from '../database/mongo'
import { ObjectId } from 'mongodb';
import { STATUS } from './report';

export interface Plate {
    _id: ObjectId;
    country: string;
    number: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaginatedPlates {
    plates: Plate[];
    page: number;
    total: number;
}

const collection = 'plates';

export const createPlate =
    async (plate: Plate): Promise<ObjectId | null> => {
        plate.createdAt = new Date()
        plate.updatedAt = new Date()

        const result = await db
            .collection<Plate>(collection)
            .insertOne(plate);
        return result.insertedId ? result.insertedId : null
    };

export const getPlateById =
    async (id: ObjectId): Promise<Plate | null> => {
        const plate = await db
            .collection<Plate>(collection)
            .findOne({ _id: id })
        return plate;
    };

export const getPlateByNumberAndCountry =
    async (number: string, country: string): Promise<Plate | null> => {
        const plate = await db
            .collection<Plate>(collection)
            .findOne({ number, country })
        return plate
    };

export const deletePlateById =
    async (id: ObjectId): Promise<boolean> => {
        const result = await db
            .collection<Plate>(collection)
            .deleteOne({ _id: id })
        return result.deletedCount > 0
    }

export const getOrCreatePlate =
    async (number: string, country: string): Promise<Plate> => {
        let plate = await getPlateByNumberAndCountry(number, country)
        if (!plate) {
            const now = new Date()
            plate = {
                country,
                number,
                createdAt: now,
                updatedAt: now,
            } as Plate;
            const newId = await createPlate(plate)
            if (!newId)
                throw new Error('Erro ao criar matrícula')
            plate._id = newId;
        }
        return plate;
    }

export const getPlatesOfConfirmedImbeciles = async (page: number = 1): Promise<PaginatedPlates> => {
    const totalResult = await db
        .collection<Plate>(collection)
        .aggregate([
            {
                $lookup: {
                    from: "reports",
                    localField: "_id",
                    foreignField: "plateId",
                    as: "reports"
                }
            },
            {
                $match: {
                    "reports.status": STATUS.CONFIRMED
                }
            },
            {
                $count: 'count'
            },
        ]).toArray();

        const total = totalResult.length > 0 ? totalResult[0].count : 0;

        const plates = await db
        .collection<Plate>(collection)
        .aggregate<Plate>([
            {
                $lookup: {
                    from: "reports",
                    localField: "_id",
                    foreignField: "plateId",
                    as: "reports"
                }
            },
            {
                $match: {
                    "reports.status": STATUS.CONFIRMED
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: (page - 1) * 10
            },
            {
                $limit: 10
            }
        ])
        .toArray();

    return {
        plates: plates,
        page: page,
        total: total
    }
}

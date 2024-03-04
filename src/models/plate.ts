import db from '../database/mongo'
import { ObjectId } from 'mongodb';

export interface Plate {
    _id: ObjectId;
    country: string;
    number: string;
    createdAt: Date;
    updatedAt: Date;
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
            .findOne({ _id: id})
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
                throw new Error('Error creating plate')
            plate._id = newId;
        }
        return plate;
    }

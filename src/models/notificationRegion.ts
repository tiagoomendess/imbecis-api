import { ObjectId } from 'mongodb';
import db from '../database/mongo'
import { Coordinate } from './coordinate';
import Logger from '../utils/logger';

export interface NotificationRecipient {
    type: "email" | "reddit" | "none"
    target: string
}

export interface NotificationRegion {
    _id: ObjectId
    name: string
    priority: number
    color: string
    polygon: {
        type: "Polygon";
        coordinates: number[][][]
    };
    recipients: NotificationRecipient[]
    createdAt: Date
    updatedAt: Date
}

const collection = 'notificationRegions';

async function createIndex() {
    try {
        const notificationRegionsCollection = db.collection(collection);
        await notificationRegionsCollection.createIndex({ polygon: "2dsphere" });
        Logger.info("2dsphere index created on the polygon field.");
    } catch (err) {
        Logger.error(`Error creating the index: ${err}`);
    }
}

createIndex();

export const findRegionsByPoint = async (point: Coordinate): Promise<NotificationRegion[]> => {
    const notificationRegionsCollection = db.collection<NotificationRegion>(collection);
    const regions = await notificationRegionsCollection.find({
        polygon: {
            $geoIntersects: {
                $geometry: {
                    type: "Point",
                    coordinates: [point.longitude, point.latitude]
                }
            }
        }
    }).sort({
        priority: -1
    }).toArray();

    return regions;
}

export const createRegion = async (region: NotificationRegion): Promise<NotificationRegion | null> => {

    region.createdAt = new Date()
    region.updatedAt = region.createdAt

    const result = await db
        .collection<NotificationRegion>(collection)
        .insertOne(region);

    if (!result.insertedId) {
        return null;
    }

    region._id = result.insertedId;

    return region;
}

export const updateRegion = async (region: NotificationRegion): Promise<boolean> => {
    region.updatedAt = new Date();

    const result = await db
        .collection<NotificationRegion>(collection)
        .updateOne({ _id: region._id }, { $set: region });

    return result.modifiedCount > 0;
}

export const deleteRegion = async (id: ObjectId): Promise<boolean> => {
    const result = await db
        .collection<NotificationRegion>(collection)
        .deleteOne({ _id: id });

    return result.deletedCount > 0;
}

export const getRegion = async (id: ObjectId): Promise<NotificationRegion | null> => {
    const region = await db
        .collection<NotificationRegion>(collection)
        .findOne({ _id: id });

    return region;
}

export const getRegions = async (): Promise<NotificationRegion[]> => {
    const regions = await db
        .collection<NotificationRegion>(collection)
        .find()
        .toArray();

    return regions;
}

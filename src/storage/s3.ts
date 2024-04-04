import {
    S3Client,
    ListBucketsCommand,
    ListObjectsV2Command,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand
} from "@aws-sdk/client-s3";
import config from "../config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import Logger from "../utils/logger";

const S3 = new S3Client({
    region: config.storage.s3.region,
    endpoint: config.storage.s3.endpoint,
    credentials: {
        accessKeyId: config.storage.s3.accessKeyId,
        secretAccessKey: config.storage.s3.secretAccessKey,
    },
});

async function listBuckets() {
    try {
        const data = await S3.send(new ListBucketsCommand({}));
        return data.Buckets;
    } catch (err) {
        console.error("Error listing buckets: ", err);
        throw err;
    }
}

async function listObjects(bucketName? : string) {
    // If no bucket name is provided, use the default bucket
    if (!bucketName) {
        bucketName = config.storage.s3.bucket
    }

    try {
        const data = await S3.send(new ListObjectsV2Command({ Bucket: bucketName }));
        return data.Contents;
    } catch (err) {
        console.error("Error listing objects: ", err);
        throw err;
    }
}

async function uploadFile(fileName : string, fileContent : Buffer, contentType : string, bucketName? : string) {
    // If no bucket name is provided, use the default bucket
    if (!bucketName) {
        bucketName = config.storage.s3.bucket
    }

    try {
        const data = await S3.send(new PutObjectCommand({
            Bucket: bucketName,
            ContentType: contentType,
            Key: fileName,
            Body: fileContent
        }));
        return data;
    } catch (err) {
        console.error("Error Uploading file: ", err);
        throw err;
    }
}

async function getDownloadUrlSigned(fileName : string, bucketName? : string) : Promise<string | null> {
    // If no bucket name is provided, use the default bucket
    if (!bucketName) {
        bucketName = config.storage.s3.bucket
    }

    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: fileName
        });
        const url = await getSignedUrl(S3, command, { expiresIn: 3600 });
        return url
    } catch (err) {
        console.error("Error getting download URL: ", err)
        return null
    }
}

async function getPublicUrl(fileName : string, bucketName? : string) {
    if (!bucketName) {
        bucketName = config.storage.s3.bucket
    }

    let url = `https://${bucketName}.${config.storage.s3.endpoint}/${fileName}`
    if (config.app.isDevelopment) {
        url = `https://cdn-dev.imbecis.app/${fileName}`
    } else {
        url = `https://cdn.imbecis.app/${fileName}`
    }

    return url
}

async function deleteObject(fileName : string, bucketName? : string) {
    // If no bucket name is provided, use the default bucket
    if (!bucketName) {
        bucketName = config.storage.s3.bucket
    }
    
    try {
        const data = await S3.send(new DeleteObjectCommand({
            Bucket: bucketName,
            Key: fileName
        }));
        return data
    } catch (err) {
        Logger.error(`Error deleting object: ${err}`)
        throw err
    }
}

async function downloadFile(fileName : string, bucketName? : string) {
    // If no bucket name is provided, use the default bucket
    if (!bucketName) {
        bucketName = config.storage.s3.bucket
    }

    try {
        const data = await S3.send(new GetObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            ResponseContentType: "application/octet-stream"

        }));
        return data.Body?.transformToByteArray();
    } catch (err) {
        console.error("Error downloading file: ", err);
        throw err;
    }
}

export default {
    listBuckets,
    listObjects,
    uploadFile,
    getDownloadUrlSigned,
    getPublicUrl,
    deleteObject,
    downloadFile
}

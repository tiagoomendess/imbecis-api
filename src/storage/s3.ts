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

async function getDownloadUrl(fileName : string, bucketName? : string) : Promise<string | null> {
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
        console.log("Error", err)
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
    getDownloadUrl,
    deleteObject,
    downloadFile
}

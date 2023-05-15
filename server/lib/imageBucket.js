const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { AWS_CONFIG, AWS_S3_BUCKET_NAME } = require("./constants");

const client = new S3Client(AWS_CONFIG);

async function uploadImage() {
    // todo
}

const IMG_EXPIRY_TIME = 60; // in seconds
/**
 * Requests a signed URL for an image from the AWS S3 bucket. The URL expires
 * within a specified amonut of time.
 * 
 * @param { string } imageFolder    The folder path the image resides in
 * @param { string } imageKey       The name of the image
 * @returns { string }              The pre-signed url
 */
async function accessImage(imageFolder, imageKey) {
    const command = new GetObjectCommand({
        Bucket: AWS_S3_BUCKET_NAME,
        Key: `${imageFolder}/${imageKey}`,
    });

    return await getSignedUrl(client, command, { expiresIn: IMG_EXPIRY_TIME });
}

async function deleteImage() {
    // todo
}

module.exports = { 
    uploadImage, 
    accessImage, 
    deleteImage 
};

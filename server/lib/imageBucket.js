const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { AWS_CONFIG, AWS_S3_BUCKET_NAME } = require("./constants");

const client = new S3Client(AWS_CONFIG);

async function uploadImage() {
    // todo
}

const IMG_EXPIRY_TIME = 10;
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

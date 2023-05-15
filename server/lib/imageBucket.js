const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { AWS_CONFIG, AWS_S3_BUCKET_NAME } = require("./constants");
const client = new S3Client(AWS_CONFIG);

//required modules for uploading image to s3 bucket
const AWS = require("aws-sdk");
const e = require("express");
const fs = require("fs");

async function uploadImage(folderName, fileName, fileContent) {
    // the AWS configuration
    AWS.config.update({
        accessKeyId: "AKIAZ43AZF65ZWKZNK4U",
        secretAccessKey:"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",
        region: "us-west-2",
    })

    // the file to be uploaded
    const filePath = "../uploads/$(folderName)/$(fileName)"
    const fileContent = fs.readFileSync(filePath);

    // the parameters for uploading
    const s3 = new AWS.S3();
    const bucketName = "image-mylivingcity";
    const key = $(folderName)/$(fileName);
    const content = fileContent;

    const params = {
        Bucket: bucketName,
        Key: key,
        Body: content,
    };

    // uploading the file
    try{
        const response = await s3.upload(params).promise();
        console.log("Uploaded Successully", response);
    }catch(error){
        console.error("Uploading failed", error.message);
    }
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

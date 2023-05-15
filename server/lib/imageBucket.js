//required modules for uploading image to s3 bucket

const multer = require('multer');
const multerS3 = require('multer-s3');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { AWS_CONFIG, AWS_S3_BUCKET_NAME } = require("./constants");

const client = new S3Client(AWS_CONFIG);

const maxFileSize = 10485760;

const theFileFilter = (req, file, cb) => {
    console.log(file);
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/tiff' || file.mimetype === 'image/webp' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(new Error('file format not supported'), false);
    }
}

// make a multer variable 
function makeUpload(folderName){
    const upload = multer({
    storage: multerS3({
        s3: client,
        bucket: AWS_S3_BUCKET_NAME,
        key: function (req, file, cb) {
            const fileName = Date.now() + '-' + file.originalname;
            const fullPath = folderName + '/' + fileName;
            cb(null, fullPath);
        },
    }),
        limits: { fileSize: maxFileSize },
        fileFilter: theFileFilter,
    });
    return upload;
}

// upload image to s3 bucket
async function uploadImage(folderName, fileName, fileContent) {
    try {
        const params = {
            Bucket: AWS_S3_BUCKET_NAME,
            Key: `${folderName}/${fileName}`,
            Body: fileContent,
        };

        const command = new PutObjectCommand(params);
        const response = await client.send(command);
        console.log("Uploaded Successully", response);
    } catch(error) {
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
    try {
        const command = new GetObjectCommand({
            Bucket: AWS_S3_BUCKET_NAME,
            Key: `${imageFolder}/${imageKey}`,
        });

        return await getSignedUrl(client, command, { expiresIn: IMG_EXPIRY_TIME });
    } catch (err) {
        console.log("Error generating signed url for image: ", err);
    }
}

/**
 * Removes the image from the S3 bucket and inserts a delete marker where the image was.
 * Returns a "success" message regardless of whether something has been deleted.
 * 
 * @param { string } imageFolder            The folder path the image resides in
 * @param { string } imageKey               The name of the image
 * @returns { DeleteMarker: true || false, 
 *            VersionId: "STRING_VALUE", 
 *            RequestCharged: "requester" } The deletion response from AWS
 */
async function deleteImage(imageFolder, imageKey) {
    try {
        const command = new DeleteObjectCommand({
            Bucket: AWS_S3_BUCKET_NAME,
            Key: `${imageFolder}/${imageKey}`,
        });
        return await client.send(command);
    } catch (err) {
        console.log("Error deleting image: ", err);
    }
}

module.exports = { 
    uploadImage, 
    accessImage, 
    deleteImage,
    makeUpload
};

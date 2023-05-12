const argon2 = require('argon2');
const { accessImage } = require('./imageBucket');

/**
 * Hashes a plain text string using argon2 hashing algorithm.
 * 
 * @param { string } string Plain text string that will be converted into argon2 hash
 * @returns { string (hash) } Hashed version of the string.
 */
const argon2Hash = async (string) => {
  try {
    const hash = await argon2.hash(string);
    return hash;
  } catch (error) {
    console.log("argon2Hash: ", error);
  }
}

/**
 * Validates plain text string with the hashed string. Will return true or false
 * representing if the plain text is the same as hash.
 * 
 * @param { string } string Plain text string that will be compared to hash
 * @param { string (hash) } hash Hashed password that will be compared to plain text
 * @returns { boolean } True if string is same as hash, false otherwise.
 */
const argon2ConfirmHash = async (string, hash) => {
  try {
    const validPassword = await argon2.verify(hash, string);
    return validPassword
  } catch (error) {
    console.log("argon2ConfirmHash: ", error);
  }
}

/**
 * Reassigns the image paths of a list of objects to their AWS S3 bucket URLs.
 * Assumes that the item type is either "advertisement", "idea-proposal", or "avatar".
 * 
 * @param { Array } items     The list of items to re-assign image paths to
 * @param { string } itemType The item type we want to process
 */
const imagePathsToS3Url = async (items, itemType) => {
  const validPaths = Set(["advertisement", "idea-proposal", "avatar"]);
  if (!validPaths.has(itemType)) {
    console.log("Invalid item type for image path conversion.");
    return;
  }

  await Promise.all(items.map(async (item) => {
    if (item.imagePath) {
      item.imagePath = await accessImage(itemType, item.imagePath);
    }
  }));
}

module.exports = {
  argon2Hash,
  argon2ConfirmHash,
  imagePathsToS3Url
}
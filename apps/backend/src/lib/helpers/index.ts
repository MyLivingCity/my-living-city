import * as argon2 from "argon2";

/**
 * Hashes a plain text string using argon2 hashing algorithm.
 */
export const argon2Hash = async (input: string) => {
  return await argon2.hash(input);
};

/**
 * Validates plain text string with the hashed string. Will return true or false
 * representing if the plain text is the same as hash.
 */
export const argon2ConfirmHash = async (testString: string, hash: string) => {
  try {
    const validPassword = await argon2.verify(hash, testString);
    return validPassword;
  } catch (error) {
    console.log("argon2ConfirmHash: ", error);
  }

  return false;
};

/**
 * Reassigns the image paths of a list of objects to their AWS S3 bucket URLs.
 * Assumes that the item type is either "advertisement", "idea-proposal", or "avatar".
 *
 * @param { Array } items     The list of items to re-assign image paths to
 * @param { string } itemType The item type we want to process
 */
// TODO
// const imagePathsToS3Url = async (items, itemType) => {
//   const validPaths = new Set(["advertisement", "idea-proposal", "avatar"]);
//   if (!validPaths.has(itemType)) {
//     console.log("Invalid item type for image path conversion.");
//     return;
//   }
//
//   await Promise.all(
//     items.map(async (item) => {
//       if (item.imagePath) {
//         item.imagePath = await accessImage(itemType, item.imagePath);
//       }
//     }),
//   );
// };

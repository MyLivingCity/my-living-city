const argon2 = require('argon2');

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

module.exports = {
  argon2Hash,
  argon2ConfirmHash,
}
const prisma = require("../lib/prismaClient");
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../lib/constants");

/**
 * Middleware to check if user is logged in and parses database to check if user
 * actually exists in database.
 * 
 * @param {*} req Express Request Object
 * @param {*} res Express Response Object
 * @param {*} next Express next function
 */
const checkIfUserIsLoggedIn = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    console.log(token);
    if (!token) {
      req.user = null;
      return;
    }

    // Decode token
    const { user } = jwt.verify(token, JWT_SECRET);

    // Check if user is valid in database
    const foundUser = await prisma.user.findUnique({ where: { id: user.id }});
    if (!foundUser) {
      req.user = null;
      return;
    }

    req.user = user;
    return;
  } catch (error) {
    req.user = null;
  } finally {
    await prisma.$disconnect();
    next()
  }
}

module.exports = {
  checkIfUserIsLoggedIn
}
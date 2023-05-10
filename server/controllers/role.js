
const express = require('express');
const prisma = require('../lib/prismaClient');
const roleRouter = express.Router();

/* roleRouter.get(
	'/getall',
	async (req, res, next) => {
		try {
			const allRoles = await prisma.userRole.findMany();

			res.status(200).json(allRoles);
		} catch (error) {
			res.status(400).json({
				message: error.message,
        details: {
          errorMessage: error.message,
          errorStack: error.stack,
        }
			})
		}
	}
) */

module.exports = roleRouter;
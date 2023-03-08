const passport = require('passport');
const express = require('express');
const schoolDetailsRouter = express.Router();
const prisma = require('../lib/prismaClient');

schoolDetailsRouter.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const schoolDate = new Date(req.body.schoolDetails.programCompletionDate);
            const schoolDetails = await prisma.school_Details.create({
                data: {
                    streetAddress: req.body.schoolDetails.streetAddress,
                    postalCode: req.body.schoolDetails.postalCode,
                    faculty: req.body.schoolDetails.faculty,
                    programCompletionDate: schoolDate,
                    userId: req.body.userId,
                },
            });
            res.status(200).json(schoolDetails);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
)



module.exports = schoolDetailsRouter;
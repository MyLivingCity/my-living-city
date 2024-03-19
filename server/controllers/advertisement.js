const passport = require('passport');
const express = require('express');
const advertisementRouter = express.Router();
const prisma = require('../lib/prismaClient');
const { imagePathsToS3Url } = require('../lib/utilityFunctions');
const { isEmpty } = require('lodash');
const { makeUpload, deleteImage } = require('../lib/imageBucket');

require('dotenv').config();

const upload = makeUpload('advertisement').single('imagePath');

//For handling post request
advertisementRouter.post(
    '/create',
    [passport.authenticate('jwt', { session: false }), upload],
    async (req, res) => {

        //Error information holder
        let error = '';
        let errorMessage = '';
        let errorStack = '';
        try {
            let imagePath = req.file.key.substring(req.file.key.indexOf('/') + 1);
            //get email and user id from request
            const { email, id } = req.user;

            //find the requesting user in the database
            const theUser = await prisma.user.findUnique({
                where: { id: id },
                select: { userType: true }
            });

            //test to see if the user is an admin or business user
            if (
                theUser.userType == 'SUPER_ADMIN' ||
                theUser.userType == 'ADMIN' ||
                theUser.userType == 'BUSINESS' ||
                theUser.userType == 'COMMUNITY'
            ) {
                //if there's no object in the request body
                if (isEmpty(req.body)) {
                    return res.status(400).json({
                        message: 'The objects in the request body are missing',
                        details: {
                            errorMessage:
                                'Creating an advertisement must supply necessary fields explicitly.',
                            errorStack:
                                'necessary fields must be provided in the body with a valid id found in the database.',
                        },
                    });
                }

                //decompose necessary fields from request body
                const {
                    adType,
                    adTitle,
                    adDuration,
                    adPosition,
                    externalLink,
                    published,
                } = req.body;

                if (adType === 'BASIC') {
                    const theBasicAd = await prisma.advertisements.findFirst({
                        where: { ownerId: id, adType: 'BASIC' },
                    });

                    if (theBasicAd) {
                        await deleteImage('advertisement', imagePath);
                        return res
                            .status(400)
                            .json({
                                message: `You already created a basic advertisement, if you want to create more, please select type 'EXTRA'; you can edit or delete the current basic advertisement.`,
                            });
                    }
                }

                //if there's no adType in the request body
                if (!adType) {
                    error += 'An advertisement must has a type. ';
                    errorMessage +=
                        "Creating an advertisement must explicitly be supplied with a 'adType' field. ";
                    errorStack +=
                        'adType must be defined in the body with a predefined value. ';
                }

                //if adType is not valid
                if (adType && !(adType == 'BASIC' || adType == 'EXTRA')) {
                    error += 'adType is invalid. ';
                    errorMessage += 'adType must be predefined value. ';
                    errorStack += 'adType must be assigned with predfined value. ';
                }

                //if there's no adTitle field
                if (!adTitle) {
                    error += 'An advertisement needs a title. ';
                    errorMessage +=
                        'Creating an advertisement must explicitly supply a adTitle field. ';
                    errorStack +=
                        'adTitle must be defined in the body with a valid length. ';
                }

                //if the length of adTitle is not valid
                if (adTitle) {
                    if (adTitle.length <= 2 || adTitle.length >= 40) {
                        error += 'adTitle size is invalid. ';
                        errorMessage +=
                            'adTitle length must be longer than 2 and shorter than 40. ';
                        errorStack += 'adTitle content size must be valid ';
                    }
                }

                //if there's no published field in the reqeust body or published field is not valid
                if (!published) {
                    error += 'An published filed must be provided. ';
                    errorMessage +=
                        'Creating an advertisement must explicitly supply a published field. ';
                    errorStack +=
                        'Published must be defined in the body with a valid value. ';
                }

                //published value container variable
                let thePublished = false;
                //Transfer the published variable into boolean value, if value can't be transfered into boolean, push error into error stack.
                if (published && (published == 'false' || published == 'true')) {
                    if (published == 'true') {
                        thePublished = true;
                    } else {
                        thePublished = false;
                    }
                } else {
                    error += 'published must be predefined values. ';
                    errorMessage +=
                        'Creating an advertisement must explicitly supply a valid published value. ';
                    errorStack +=
                        'Published must be provided in the body with a valid value. ';
                }

                //if there's no adDuration field in the request body
                if (
                    (!adDuration && adType == 'EXTRA') ||
                    (parseInt(adDuration) <= 0 && adType == 'EXTRA')
                ) {
                    error += 'adDuration must be provided. ';
                    errorMessage +=
                        'adDuration must be provided in the body with a valid length. ';
                    errorStack +=
                        'adDuration must be provided in the body with a valid length. ';
                }

                //if there's no adPosition field in the
                if (!adPosition) {
                    error += 'adPosition is missing. ';
                    errorMessage +=
                        'Creating an advertisement must explicitly be supply a adPosition field. ';
                    errorStack +=
                        "'adPosition' must be provided in the body with a valid position found in the database. ";
                }

                if (!externalLink) {
                    error += 'externalLink is missing. ';
                    errorMessage +=
                        'Creating an advertisement must explicitly be supply a externalLink field. ';
                    errorStack +=
                        "'externalLink' must be provided in the body with a valid position found in the database. ";
                }

                //If there's error in error holder
                if (error && errorMessage && errorStack) {
                    // delete image if it already exists
                    await deleteImage('advertisement', imagePath);

                    let tempError = error;
                    let tempErrorMessage = errorMessage;
                    let tempErrorStack = errorStack;
                    error = '';
                    errorMessage = '';
                    errorStack = '';

                    return res.status(400).json({
                        message: tempError,
                        details: {
                            errorMessage: tempErrorMessage,
                            errorStack: tempErrorStack,
                        },
                    });
                }

                let createAnAdvertisement;

                //if advertisement type is extra, create one with duration date; if not, create one without duration.
                if (adType == 'EXTRA') {
                    //Calculate the ending date of advertisement based on duration field.
                    let theDate = new Date();
                    let endDate = new Date();
                    endDate.setDate(theDate.getDate() + parseInt(adDuration));

                    //create an advertisement object
                    createAnAdvertisement = await prisma.advertisements.create({
                        data: {
                            ownerId: id,
                            adTitle: adTitle,
                            duration: endDate,
                            adType: adType,
                            adPosition: adPosition,
                            imagePath: imagePath,
                            externalLink: externalLink,
                            published: thePublished,
                        },
                    });
                } else {
                    createAnAdvertisement = await prisma.advertisements.create({
                        data: {
                            ownerId: id,
                            adTitle: adTitle,
                            adType: adType,
                            adPosition: adPosition,
                            imagePath: imagePath,
                            externalLink: externalLink,
                            published: thePublished,
                        },
                    });
                }

                //sending user the successful status with created advertisement object
                res.status(200).json(createAnAdvertisement);
            } else {
                return res.status(403).json({
                    message: "You don't have the right to add an advertisement!",
                    details: {
                        errorMessage:
                            'In order to create an advertisement, you must be an admin or business user.',
                        errorStack:
                            'user must be an admin or business if they want to create an advertisement',
                    },
                });
            }
        }
        catch (error) {
            console.log(error);
            res.status(400).json({
                message: 'An error occured while trying to create an Advertisement.',
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        } finally {
            await prisma.$disconnect();
        }
    }
);
//for retriving all advertisement table item for user.
advertisementRouter.get(
    '/getAll',
    async (req, res) => {
        try {
            const allAd = await prisma.advertisements.findMany({});
            await imagePathsToS3Url(allAd, 'advertisement');
            if (allAd) {
                return res.status(200).json(allAd);
            } else {
                return res.status(404).send("there's no advertisement belongs to you!");
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: 'An error occured while trying to get advertisements.',
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        } finally {
            await prisma.$disconnect();
        }
    }
);

//for retriving all published advertisements.
advertisementRouter.get(
    '/getAllPublished',
    async (req, res) => {
        try {
            const allAd = await prisma.advertisements.findMany({
                where: {
                    OR: [{
                        adType: 'BASIC',
                    },
                    {
                        published: true,
                    }
                    ]

                }
            });
            if (allAd) {
                await imagePathsToS3Url(allAd, 'advertisement');
                return res.status(200).json(allAd);
            } else {
                return res.status(404).send("there's no advertisement belongs to you!");
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: 'An error occured while trying to get advertisements.',
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        } finally {
            await prisma.$disconnect();
        }
    }
);

advertisementRouter.get(
    '/getAllUser/:userId',
    async (req, res) => {
        try {
            const userId = req.params.userId;
            console.log('YELLOW');
            console.log(userId);
            const result = await prisma.advertisements.findMany({
                where: { ownerId: userId }

            })

            if (!result) {
                res.status(204).json('adsId not found!');
            }
            if (result) {
                await imagePathsToS3Url(result, 'advertisement');
                res.status(200).json(result);
            }
        } catch (err) {
            console.log(err);
            res.status(400).json({
                message: 'An error occured while trying to retrieve the adsId.',
                details: {
                    errorMessage: err.message,
                    errorStack: err.stack,
                }
            });
        } finally {
            await prisma.$disconnect();
        }
    }
)

advertisementRouter.get(
    '/get/:adsId',
    async (req, res) => {
        try {
            const { Int: adsId } = req.params;
            console.log(adsId);
            const result = await prisma.advertisements.findFirst({
                where: { id: adsId }
            })

            if (!result) {
                res.status(204).json('adsId not found!');
            }
            if (result) {
                await imagePathsToS3Url([result], 'advertisement');
                res.status(200).json(result);
            }
        } catch (err) {
            console.log(err);
            res.status(400).json({
                message: 'An error occured while trying to retrieve the adsId.',
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        } finally {
            await prisma.$disconnect();
        }
    }
)

// Get all ads created by an ownerId
advertisementRouter.get(
    '/getAdsByOwner/:ownerId',
    async (req, res) => {
        try {
            const { ownerId } = req.params;
            console.log(`Get ads by owner id: ${ownerId}`);
            const result = await prisma.advertisements.findMany({
                where: { ownerId: ownerId }
            })
            await imagePathsToS3Url(result, 'advertisement');
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({
                message: 'An error occured while trying to retrieve the adsId.',
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        } finally {
            await prisma.$disconnect();
        }
    }
)

advertisementRouter.put(
    '/update/:advertisementId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        //multer error handling method
        upload(req, res, function (err) {
            if (err) {
                console.log(err);
                error += err + ' ';
                errorMessage += err + ' ';
                errorStack += err + ' ';
            }
        });
        try {
            //get email and user id from request
            const { email, id: loggedInUserId } = req.user;
            //find the requesting user in the database
            const theUser = await prisma.user.findUnique({
                where: { id: loggedInUserId },
                select: { userType: true }
            });
            const { adType, adTitle, adDuration, adPosition, externalLink, published } = req.body;

            if (
                theUser.userType == 'SUPER_ADMIN' ||
                theUser.userType == 'ADMIN' ||
                theUser.userType == 'BUSINESS' ||
                theUser.userType == 'COMMUNITY'
            ) {
                const { advertisementId } = req.params;
                const parsedAdvertisementId = parseInt(advertisementId);

                let endDate;
                let thePublished;

                if (!advertisementId || !parsedAdvertisementId) {
                    return res.status(400).json({
                        message: `A valid advertisementId must be specified in the route paramater.`,
                    });
                }

                const theAdvertisement = await prisma.advertisements.findUnique({
                    where: { id: parsedAdvertisementId },
                });

                if (!theAdvertisement) {
                    return res.status(400).json({
                        message: `The advertisement with that listed ID (${advertisementId}) does not exist.`,
                    });
                }

                const advertisementOwnedByUser =
                    theAdvertisement.ownerId === loggedInUserId;

                if (!advertisementOwnedByUser) {
                    return res.status(401).json({
                        message: `The user ${email} is not the owner or an admin and therefore cannot edit this advertisement.`,
                    });
                }

                //if adType is not valid
                if (adType && !(adType == 'BASIC' || adType == 'EXTRA')) {
                    error += 'adType is invalid. ';
                    errorMessage += 'adType must be predefined value. ';
                    errorStack += 'adType must be assigned with predfined value. ';
                }

                //if the length of adTitle is not valid
                if (adTitle) {
                    if (adTitle.length < 2 || adTitle.length > 40) {
                        error += 'adTitle size is invalid. ';
                        errorMessage +=
                            'adTitle length must be longer than 2 and shorter than 40. ';
                        errorStack += 'adTitle content size must be valid ';
                    }
                }

                if (
                    theAdvertisement.duration == null &&
                    !adDuration &&
                    adType == 'EXTRA'
                ) {
                    error += 'adDuration must be provided. ';
                    errorMessage +=
                        "adDuration must be provided in the body with a valid length if there's no exisintg duration. ";
                    errorStack +=
                        'adDuration must be provided in the body with a valid lenght. ';
                }

                if (adDuration && theAdvertisement.adType == 'EXTRA') {
                    if (parseInt(adDuration) <= 0) {
                        error += 'adDuration must be provided. ';
                        errorMessage +=
                            'adDuration must be provided in the body with a valid length. ';
                        errorStack +=
                            'adDuration must be provided in the body with a valid lenght. ';
                    } else {
                        let theDate = new Date();
                        endDate = new Date();
                        endDate.setDate(theDate.getDate() + parseInt(adDuration));
                    }
                }

                if (published) {
                    if (published == 'false' || published == 'true') {
                        if (published == 'true') {
                            thePublished = true;
                        } else {
                            thePublished = false;
                        }
                    } else {
                        error += 'published must be predefined values. ';
                        errorMessage +=
                            'Updating an advertisement must explicitly supply a valid published value. ';
                        errorStack +=
                            'Published must be provided in the body with a valid value.';
                    }
                }

                //If there's error in error holder
                if (error && errorMessage && errorStack) {
                    if (req.file) {
                        await deleteImage('advertisement', req.file.path); // delete image if creation process errored
                    }
                    let tempError = error;
                    let tempErrorMessage = errorMessage;
                    let tempErrorStack = errorStack;
                    error = '';
                    errorMessage = '';
                    errorStack = '';

                    return res.status(400).json({
                        message: tempError,
                        details: {
                            errorMessage: tempErrorMessage,
                            errorStack: tempErrorStack,
                        },
                        reqBody: {
                            adType: adType,
                            adTitle: adTitle,
                            adDuration: adDuration,
                            externalLink: externalLink,
                            published: published,
                        },
                    });
                }
                let newImagePath;
                if (req.file) {
                    await deleteImage('advertisement', theAdvertisement.imagePath);
                    newImagePath = req.file.path;
                }

                const updatedAdvertisement = await prisma.advertisements.update({
                    where: { id: parsedAdvertisementId },
                    data: {
                        adType: adType,
                        adTitle: adTitle,
                        duration: adType == 'BASIC' ? null : endDate,
                        imagePath: newImagePath,
                        externalLink: externalLink,
                        published: published,
                    },
                });

                return res.status(200).send(updatedAdvertisement);
            } else {
                return res.status(403).json({
                    message: "You don't have the right to update an advertisement!",
                    details: {
                        errorMessage:
                            'In order to update an advertisement, you must be an admin or business user.',
                        errorStack:
                            'user must be an admin or business if they want to update an advertisement',
                    },
                });
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: 'An error occured while trying to update an Advertisement.',
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        } finally {
            await prisma.$disconnect()
        }
    }
)
advertisementRouter.delete(
    '/delete/:advertisementId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { id: loggedInUserId, email } = req.user;
            const parsedAdvertisementId = parseInt(req.params.advertisementId);

            console.log(email);
            // check if id is valid
            if (!parsedAdvertisementId) {
                return res.status(400).json({
                    message: `A valid advertisementId must be specified in the route paramater.`,
                });
            }

            const theUser = await prisma.user.findUnique({
                where: { id: loggedInUserId },
                select: { userType: true }
            });

            if (
                theUser.userType === 'SUPER_ADMIN' ||
                theUser.userType === 'ADMIN' ||
                theUser.userType === 'BUSINESS'
            ) {
                const theAdvertisement = await prisma.advertisements.findUnique({
                    where: { id: parsedAdvertisementId },
                });

                if (!theAdvertisement) {
                    res
                        .status(404)
                        .send('Advertisement which needs to be deleted not found!');
                } else {
                    if (theAdvertisement.ownerId === loggedInUserId) {
                        await deleteImage(
                            'advertisement',
                            theAdvertisement.imagePath
                        );

                        const deletedAd = await prisma.advertisements.delete({
                            where: {
                                id: parsedAdvertisementId,
                            },
                        });
                        res.status(200).json({
                            message: 'Advertisement succesfully deleted',
                            deletedAd: deletedAd,
                        });
                    } else {
                        return res.status(401).json({
                            message: `The user ${email} is not the author or an admin and therefore cannot delete this advertisement.`,
                        });
                    }
                }
            } else {
                return res.status(403).json({
                    message: "You don't have the right to add an advertisement!",
                    details: {
                        errorMessage:
                            'In order to delete an advertisement, you must be an admin or business user.',
                        errorStack:
                            'user must be an admin or business if they want to delete an advertisement',
                    },
                });
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: 'An error occured while trying to delete advertisement.',
                details: {
                    errorMessage: error.message,
                    errorStack: error.stack,
                }
            });
        } finally {
            await prisma.$disconnect()
        }
    }
)

// Experimental
advertisementRouter.get(
    '/pricing',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const segmentUserCounts = await prisma.userSegments.groupBy({
                by: ['homeSegmentId'],
                _count: {
                    userId: true
                },
                orderBy: {
                    homeSegmentId: 'asc'
                }
            });

            const segments = await prisma.segments.findMany({
                distinct: ['segId'],
                orderBy: {
                    segId: 'asc'
                }
            });

            const mapped = segmentUserCounts.map((segmentUserCount) => {
                return {
                    name: segments[segmentUserCount.homeSegmentId - 1].name,
                    segId: segments[segmentUserCount.homeSegmentId - 1].segId,
                    count: segmentUserCount._count.userId
                }
            });

            res.status(200).json(mapped)
        } catch (error) {
            console.log(error)
            res.status(400)
        } finally {
            await prisma.$disconnect();
        }
    }
)

module.exports = advertisementRouter;

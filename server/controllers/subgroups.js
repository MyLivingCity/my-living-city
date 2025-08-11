const passport = require('passport');
const express = require('express');
const subGroupManagerRouter = express.Router();
const prisma = require('../lib/prismaClient');

// Get if the user is a subgroup manager
subGroupManagerRouter.get(
	'/isSubGroupManager',
	passport.authenticate('jwt', { session: false }), 
	async (req, res) => {
		try {
			const {id: userId} = req.user;

			const managedSubgroups = await prisma.subGroup.findMany({
				where: { managerId: userId },
				select: { id: true },
			});

			res.json({ isSubGroupManager: managedSubgroups.length > 0 });
		} catch (error) {
			console.error("Error checking subgroup manager status:", error);
			res.status(500).json({
				message: 'Error checking subgroup manager status',
				details: {
					error: error.message,
					errorStack: error.stack
				}
			});
		} finally {
			await prisma.$disconnect();
		}
	}	
)

// GET Subgroups managed by the user
subGroupManagerRouter.get(
	'/',
	passport.authenticate('jwt', { session: false }), 
	async (req, res) => {
		try {
			const {id: userId} = req.user;

			const managedSubgroups = await prisma.subGroup.findMany({
				where: { managerId: userId },
				orderBy: { name: 'asc' },
				include: {
					region: { select: {name: true} },
					segment: { select: {name: true} },
					subSegment: { select: {name: true} },
				}
			});

			if (!managedSubgroups || managedSubgroups.length === 0) {
				return res.status(204).json({
					message: 'No subgroups managed by this user',
					data: []
				});
			};

			res.status(200).json(managedSubgroups);
		} catch (error) {
			console.error("Error fetching managed subgroups:", error);
			res.status(500).json({
				message: 'Error fetching subgroups',
				details: {
					error: error.message,
					errorStack: error.stack
				}
			});
		} finally {
			await prisma.$disconnect();
		}
	}
)

// GET Users in a specific subgroup
// This endpoint retrieves the current users in a subgroup by its ID
subGroupManagerRouter.get(
	'/:subGroupId/users',
	passport.authenticate('jwt', { session: false }), 
	async (req, res) => {
		try {
			const { subGroupId } = req.params;

			const currentUsers = await prisma.subGroupMember.findMany({
				where: { subGroupId },
				orderBy: { joinedAt: 'asc'},
				include: {
					user: {
						select: {
							id: true,
							email: true,
							organizationName: true,
							fname: true,
							lname: true,
							userType: true,
						}
					}
				}
			});

			res.status(200).json(currentUsers);
		} catch (error) {
			res.status(400).json({
				message: 'Error fetching current users',
				details: {
					error: error.message,
					errorStack: error.stack
				}
			});
		} finally {
			await prisma.$disconnect();
		}
	}
);

// GET Users who are not in a specific subgroup
// This endpoint retrieves users who are not currently in the specified subgroup
subGroupManagerRouter.get(
	'/:subGroupId/users/notInSubGroup',
	passport.authenticate('jwt', { session: false }), 
	async (req, res) => {
		try {
			const {id: userId} = req.user;
			const { subGroupId } = req.params;

			const currentUsers = await prisma.subGroupMember.findMany({
				where: { subGroupId },
				select: { userId: true },
			});

			const memberIds = currentUsers.map(member => member.userId);

			// Add current userId to the exclusion list
			const excludeIds = [...memberIds, userId];

			const usersNotInSubGroup = await prisma.user.findMany({
				where: {
					id: {
						notIn: excludeIds.length > 0 ? excludeIds : ['']
					}
				},
				select: {
					id: true,
					email: true,
					userType: true,
					fname: true,
					lname: true,
					organizationName: true,
				},
				orderBy: { fname: 'asc' },
			});

			res.status(200).json(usersNotInSubGroup);
		} catch (error) {
			res.status(400).json({
				message: 'Error fetching users not in subgroup',
				details: {
					error: error.message,
					errorStack: error.stack
				}
			});
		} finally {
			await prisma.$disconnect();
		}
	}
);

// POST Add a user to a subgroup
subGroupManagerRouter.post(
	'/:subGroupId/users/:userId',
	passport.authenticate('jwt', { session: false }), 
	async (req, res) => {
		try {
			const { subGroupId, userId } = req.params;

			const newMember = await prisma.user.findUnique({
				where: { id: userId },
			});

			if(!newMember) {
				return res.status(404).json({
					message: 'User not found'
				});
			}

			const existingMember = await prisma.subGroupMember.findFirst({
				where: {
					subGroupId: subGroupId,
					userId: userId,
				}
			});

			if (existingMember) {
				return res.status(400).json({
					message: 'User is already a member of this subgroup'
				});
			}

			const addedMember = await prisma.subGroupMember.create({
				data: {
					userId: userId,
					subGroupId: subGroupId,
					status: 'APPROVED', 
					joinedAt: new Date(),
				},
				include: {
					user: true,
					subGroup: true,
				}
			});

			res.status(201).json({
				message: `User ID ${userId} added to subgroup ID ${subGroupId} successfully`,
				data: addedMember,
				email: addedMember.user.email, 
				subGroupName: addedMember.subGroup.name,
			});
		} catch (error) {
			res.status(400).json({
				message: 'Error adding user to subgroup',
				details: {
					error: error.message,
					errorStack: error.stack
				}		
			});
		} finally {
			await prisma.$disconnect();
		}
	}
);	

// PATCH Update user request in a subgroup
subGroupManagerRouter.patch(
	'/:subGroupId/users/:userId',
	passport.authenticate('jwt', { session: false }), 
	async (req, res) => {
		try {
			const { subGroupId, userId } = req.params;
			const { action } = req.body; 

			if (!["APPROVED", "REJECTED", "PENDING"].includes(action)) {
				return res.status(400).json({
					message: 'Invalid action. Use "APPROVED" or "REJECTED".'
				});
			}

			const updateMember = await prisma.subGroupMember.update({
				where: {
					userId_subGroupId: {
						subGroupId: subGroupId,
						userId: userId,
					}
				}, 
				data: {
					status: action,
				},
				include: {
					user: true,
				}
			});

			if (updateMember.count === 0) {
				return res.status(404).json({
					message: 'User not found in the specified subgroup'
				});
			}

			res.status(200).json({
				message: `User ID ${userId} updated in subgroup ID ${subGroupId} successfully`,
				data: updateMember,
				email: updateMember.user.email,
			});

		} catch (error) {
			res.status(400).json({
				message: 'Error updating user in subgroup',
				details: {
					error: error.message,
					errorStack: error.stack
				}
			});
		} finally {
			await prisma.$disconnect();
		}
	}
);

// DELETE User from a subgroup
subGroupManagerRouter.delete(
	'/:subGroupId/users/:userId',
	passport.authenticate('jwt', { session: false }), 
	async (req, res) => {
		try {
			const { subGroupId, userId } = req.params;

			// Delete the user from the subgroup
			const deletedUser = await prisma.subGroupMember.deleteMany({
				where: {
					subGroupId: subGroupId,
					userId: userId,
				}
			})

			if (deletedUser.count === 0) {
				return res.status(404).json({
					message: 'User not found in the specified subgroup'
				});
			}

			res.status(200).json({
				message: `User ID ${userId} removed from subgroup ID ${subGroupId}`,
				data: deletedUser,
			});

		} catch (error) {
			res.status(400).json({
				message: 'Error removing user from subgroup',
				details: {
					error: error.message,
					errorStack: error.stack
				}
			});
		} finally {
			await prisma.$disconnect();
		}	
	}
);

// DELETE Rejected request from a subgroup
subGroupManagerRouter.delete(
	'/:subGroupId/users/rejected/:userId',
	passport.authenticate('jwt', { session: false }), 
	async (req, res) => {
		try {
			const { subGroupId, userId } = req.params;

			// Delete the rejected request from the subgroup
			const rejectedRequest = await prisma.subGroupMember.findUnique({
				where: {
					userId_subGroupId: {
						userId: userId,
						subGroupId: subGroupId,
					}
				}
			});

			if (!rejectedRequest || rejectedRequest.status !== 'REJECTED') {
				return res.status(404).json({
					message: 'Rejected request not found for the specified user in this subgroup'
				});
			}

			await prisma.subGroupMember.delete({
				where: {
					userId_subGroupId: {
						userId: userId,
						subGroupId: subGroupId,
					}
				}
			});

			res.status(200).json({
				message: `Rejected request for user ID ${userId} removed from subgroup ID ${subGroupId}`,
				data: rejectedRequest,
			});

		} catch (error) {
			res.status(400).json({
				message: 'Error removing rejected request from subgroup',
				details: {
					error: error.message,
					errorStack: error.stack
				}
			});
		} finally {
			await prisma.$disconnect();
		}	
	}
);

module.exports = subGroupManagerRouter;
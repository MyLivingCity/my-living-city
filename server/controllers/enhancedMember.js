const express = require('express');
const passport = require('passport');
const prisma = require('../lib/prismaClient');
const ADMIN_ROLES = require('../constants/AdminRoles');

const enhancedMemberRouter = express.Router();

enhancedMemberRouter.get(
  '/status/:userId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
      }

      const enhancedMember = await prisma.enhancedMember.findUnique({
        where: { userId },
        select: { id: true, userId: true },
      });

      return res.status(200).json({
        userId,
        isEnhancedMember: !!enhancedMember,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Unable to fetch enhanced member status',
        details: {
          errorMessage: error.message,
        },
      });
    } finally {
      await prisma.$disconnect();
    }
  }
);

enhancedMemberRouter.post(
  '/promote',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
      }

      const requestUser = req.user;
      const isSelfPromotion = requestUser?.id === userId;
      const isAdmin = ADMIN_ROLES.includes(requestUser?.userType);

      if (!isSelfPromotion && !isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const promoted = await prisma.enhancedMember.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });

      return res.status(200).json({
        message: 'User promoted to enhanced member',
        userId: promoted.userId,
        isEnhancedMember: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Unable to promote user to enhanced member',
        details: {
          errorMessage: error.message,
        },
      });
    } finally {
      await prisma.$disconnect();
    }
  }
);

module.exports = enhancedMemberRouter;

// =============================================================================
// features/users/handler.ts
// =============================================================================
// Source controllers to refactor into this file:
//
// controllers/user.js            → apiRouter.use('/user', userRouter)   (~1700+ lines)
//   - POST /signup                 register new user
//   - POST /login                  local login (returns JWT)
//   - GET  /                       get all users (admin)
//   - GET  /:userId                get user by ID
//   - GET  /me                     get current user (from token)
//   - PUT  /:userId                update user profile
//   - PUT  /:userId/ban            ban user (admin/mod)
//   - PATCH /:userId/patchHandle   update handle
//   - PATCH /:userId/...           various partial profile updates
//   - DELETE /:userId              delete user (admin)
//   - (+ segment/reach sub-routes currently inline)
//
// controllers/role.js            → apiRouter.use('/role', roleRouter)
//   - GET  /                       list all roles
//   - POST /                       create role
//   - PUT  /:roleId                update role
//   - DELETE /:roleId              delete role
//
// controllers/publicProfile.js   → apiRouter.use('/publicProfile', ...)
//   - GET  /all                    list public profiles
//   - GET  /:userId                get public profile by user
//
// controllers/avatar.js          → apiRouter.use('/avatar', avatarRouter)
//   - POST /upload                 upload avatar image (multer)
//   - GET  /:userId                get avatar for user
//   - DELETE /                     remove avatar
//
// controllers/userReach.js       → apiRouter.use('/reach', userReachRouter)
//   - GET  /:userId                get reach stats for user
//   - POST /update                 recalculate reach
//
// controllers/schoolDetails.js   → apiRouter.use('/schoolDetails', ...)
//   - POST /                       create/update school details for user
//   - GET  /:userId                get school details
//   - DELETE /:userId              remove school details
//
// controllers/workDetails.js     → apiRouter.use('/workDetails', ...)
//   - POST /                       create/update work details for user
//   - GET  /:userId                get work details
//   - DELETE /:userId              remove work details
//
// controllers/enhancedMember.js  → apiRouter.use('/enhanced-member', ...)
//   - POST /                       grant enhanced-member status
//   - GET  /:userId                check enhanced-member status
//   - DELETE /:userId              revoke enhanced-member status
// =============================================================================

import { Router, type Request, type Response } from 'express';

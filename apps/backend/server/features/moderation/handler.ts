// =============================================================================
// features/moderation/handler.ts
// =============================================================================
// Source controllers to refactor into this file:
//
// controllers/banUser.js         → apiRouter.use('/banUser', banUserRouter)
//   - POST /                       ban a user
//   - GET  /                       list active bans (admin)
//   - GET  /:userId                get bans for specific user
//   - DELETE /:banId               lift a ban
//
// controllers/banPost.js         → apiRouter.use('/banPost', banPostRouter)
//   - POST /                       ban/hide a post (idea)
//   - GET  /                       list banned posts (admin)
//   - DELETE /:banId               unban a post
//
// controllers/banComment.js      → apiRouter.use('/banComment', banCommentRouter)
//   - POST /                       ban/hide a comment
//   - GET  /                       list banned comments (admin)
//   - DELETE /:banId               unban a comment
//
// controllers/badPostingBehavior.js → apiRouter.use('/badPostingBehavior', ...)
//   - POST /                       record a bad-posting-behavior event
//   - GET  /:userId                get bad behavior history for user
//
// controllers/falseFlaggingBehavior.js → apiRouter.use('/falseFlaggingBehavior', ...)
//   - POST /                       record a false-flagging event
//   - GET  /:userId                get false-flagging history for user
//   NOTE: verify whether any routes are actually implemented before migrating
//
// controllers/report.js          → apiRouter.use('/report', reportRouter)
//   - POST /                       submit a report against a user/post/comment
//   - GET  /                       list reports (admin/mod)
//   - PUT  /:reportId              resolve/dismiss a report
//
// controllers/commentFlag.js     → apiRouter.use('/commentFlag', commentFlagRouter)
//   - POST /                       flag a comment
//   - GET  /                       get all comment flags (admin)
//   - GET  /:commentId             flags on a specific comment
//   - PUT  /:flagId                resolve a comment flag
// =============================================================================

//import { Router, type Request, type Response } from 'express';

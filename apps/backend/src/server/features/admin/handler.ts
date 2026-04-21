// =============================================================================
// features/admin/handler.ts
// =============================================================================
// Source controllers to refactor into this file:
//
// controllers/dashboard.js        → apiRouter.use('/dashboard', dashboardRouter)
//   - GET  /stats                   platform-wide aggregate stats
//   - GET  /users                   user counts / growth stats
//   - GET  /ideas                   idea counts / engagement stats
//   - GET  /moderation              moderation activity summary
//
// controllers/threshhold.js       → apiRouter.use('/threshhold', threshholdRouter)
//   - GET  /                        get current moderation thresholds
//   - PUT  /                        update thresholds (admin only)
//   - POST /reset                   reset thresholds to defaults
// =============================================================================

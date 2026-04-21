// =============================================================================
// features/auth/handler.ts
// =============================================================================
// Source controllers to refactor into this file:
//
// controllers/oauth.js          → apiRouter.use('/auth', oauthRouter)
//   - OAuth2 login/callback (Google etc.)
//   - Token refresh
//
// controllers/emailVerification.js  → apiRouter.use('/emailVerification', ...)
//   - POST /send    — send verification email
//   - POST /verify  — verify token
//
// controllers/sendEmailReset.js  → apiRouter.use('/sendEmail', ...) + apiRouter.use('/reset-password', ...)
//   - POST /        — send password-reset email
//   - POST /reset   — apply new password from token
//
// server/auth/auth.js            — passport-local strategy config (no routes)
//   → move strategy setup into an auth bootstrap helper called from server.ts
// =============================================================================

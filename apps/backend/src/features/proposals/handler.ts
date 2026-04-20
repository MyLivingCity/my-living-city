// =============================================================================
// features/proposals/handler.ts
// =============================================================================
// Source controllers to refactor into this file:
//
// controllers/proposal.js        → apiRouter.use('/proposal', proposalRouter)
//   - POST /                       create proposal from idea
//   - GET  /                       list proposals (paginated)
//   - GET  /:proposalId            get single proposal
//   - GET  /getall/:segmentId      proposals by segment
//   - POST /getall/...             filtered bulk fetches
//   - PUT  /:proposalId            update proposal
//   - DELETE /:proposalId          delete proposal
//
// controllers/extraProposalPricing/extraProposalPricing.js
//                                → apiRouter.use('/extra-proposal-pricing', ...)
//   - POST /                       add extra pricing to a proposal
//   - GET  /:proposalId            get extra pricing for proposal
//   - PUT  /:pricingId             update pricing entry
//   - DELETE /:pricingId           remove pricing entry
//
// controllers/pricingAndLimit/accountPricing.js
//                                → apiRouter.use('/pricing-and-limit', ...)
//   - GET  /pricing                get pricing tiers/config
//   - GET  /proposal-limits        get proposal submission limits per account
//   - POST /...                    update pricing or limits (admin)
// =============================================================================

//import { Router, type Request, type Response } from 'express';

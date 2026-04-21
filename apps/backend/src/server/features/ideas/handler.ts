// =============================================================================
// features/ideas/handler.ts
// =============================================================================
// Source controllers to refactor into this file:
//
// controllers/idea.js            → apiRouter.use('/idea', ideaRouter)   (~1700 lines)
//   - POST /                       create idea
//   - GET  /getall/aggregations    paginated idea list with aggregations
//   - GET  /:ideaId                get single idea
//   - GET  /getall/:segmentId      ideas by segment
//   - POST /getall/...             filtered bulk fetches
//   - PUT  /:ideaId                update idea
//   - PUT  /:ideaId/state          update idea state/status
//   - DELETE /:ideaId              delete idea
//   - POST /:ideaId/image          attach image to idea
//   - POST /similar                get similar ideas
//   - GET  /:ideaId/reach          idea reach stats
//   - (+ many more bulk/filter routes)
//
// controllers/rating.js          → apiRouter.use('/rating', ideaRatingRouter)
//   - POST /                       rate an idea
//   - GET  /:ideaId                get ratings for idea
//   - PUT  /:ratingId              update a rating
//   - DELETE /:ratingId            remove a rating
//
// controllers/flag.js            → apiRouter.use('/flag', ideaFlagRouter)
//   - POST /                       flag an idea
//   - GET  /                       get all flags (admin)
//   - GET  /:ideaId                flags for a specific idea
//   - PUT  /:flagId                resolve/dismiss a flag
//
// controllers/champion.js        → apiRouter.use('/champion', championRouter)
//   - POST /                       assign champion to idea
//   - GET  /:ideaId                get champion for idea
//   - DELETE /:ideaId              remove champion
//
// controllers/image.js           → apiRouter.use('/image', imageRouter)
//   - POST /idea                   upload idea image (multer)
//   - DELETE /:imageId             delete image
//
// controllers/feedbackRating.js  → apiRouter.use('/feedbackRating', feedbackRatingRouter)
//   - POST /                       submit feedback rating on an idea
//   - GET  /:ideaId                get feedback ratings for idea
// =============================================================================

//import { Router, type Request, type Response } from 'express';

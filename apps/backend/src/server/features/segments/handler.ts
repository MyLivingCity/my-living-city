// =============================================================================
// features/segments/handler.ts
// =============================================================================
// Source controllers to refactor into this file:
//
// controllers/segments/segment.js   → apiRouter.use('/segment', segmentRouter)
//   - POST /                          create segment
//   - GET  /                          list all segments
//   - GET  /:segmentId                get segment by ID
//   - GET  /geo/...                   geo-based segment lookup
//   - DELETE /:segmentId              delete segment
//   - POST /assign                    assign user to segment
//   - GET  /:segmentId/users          users in segment
//
// controllers/segments/subSegment.js → apiRouter.use('/subSegment', subSegmentRouter)
//   - POST /                          create sub-segment
//   - GET  /:segmentId                list sub-segments for a segment
//   - GET  /:subSegmentId             get single sub-segment
//   - DELETE /:subSegmentId           delete sub-segment
//
// controllers/segments/superSegment.js → apiRouter.use('/superSegment', ...)
//   - POST /                          create super-segment
//   - GET  /                          list super-segments
//   - GET  /:superSegmentId           get single super-segment
//   - DELETE /:superSegmentId         delete super-segment
//
// controllers/userSegment.js       → apiRouter.use('/userSegment', userSegmentRouter)
//   - GET  /:userId                   get segment membership for user
//   - POST /                          assign user to segment
//   - PATCH /:userId/patch            update user segment assignment
//   - DELETE /:userId                 remove user from segment
//
// controllers/userSegmentRequest.js → apiRouter.use('/userSegmentRequest', ...)
//   - POST /                          submit request to join segment
//   - GET  /                          list pending requests (admin)
//   - PUT  /:requestId/approve        approve request
//   - PUT  /:requestId/deny           deny request
//
// controllers/googleMap.js         → apiRouter.use('/location', googleLocationAPI)
//   - GET  /geocode                   forward geocode (address → lat/lng)
//   - GET  /reverse                   reverse geocode (lat/lng → address)
//   - GET  /autocomplete              place autocomplete
// =============================================================================

//import { Router, type Request, type Response } from 'express';

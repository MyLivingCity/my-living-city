// =============================================================================
// features/subgroups/handler.ts
// =============================================================================
// Source controllers to refactor into this file:
//
// controllers/subgroups.js         → apiRouter.use('/subGroups', subGroupManagerRouter)
//   - POST /                          create subgroup
//   - GET  /                          list all subgroups
//   - GET  /:subgroupId               get subgroup by ID
//   - PUT  /:subgroupId               update subgroup
//   - DELETE /:subgroupId             delete subgroup
//
// controllers/subgroup/subgroup.js → apiRouter.use('/subgroup', subgroupRouter)
//   - GET  /getAll                    list all subgroups (alternate endpoint)
//   - GET  /eligibleManagers          list users eligible to manage a subgroup
//   - POST /assign                    assign manager to subgroup
//   - PUT  /:subgroupId               update subgroup settings
//
// controllers/subgroupRequest.js   → apiRouter.use('/subgroupRequest', subGroupRequestRouter)
//   - POST /                          submit request to join subgroup
//   - GET  /                          list pending requests (admin/manager)
//   - PUT  /:requestId/approve        approve request
//   - PUT  /:requestId/deny           deny request
//
// controllers/publicSubgroup.js    → apiRouter.use('/publicSubgroup', publicSubgroupRouter)
//   - GET  /all                       list publicly visible subgroups
//   - GET  /:subgroupId               get public subgroup profile
// =============================================================================

//import { Router, type Request, type Response } from 'express';

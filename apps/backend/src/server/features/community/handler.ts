// =============================================================================
// features/community/handler.ts
// =============================================================================
// Source controllers to refactor into this file:
//
// controllers/community.js        → apiRouter.use('/community', communityRouter)
//   - POST /                        create community/group
//   - GET  /                        list communities
//   - GET  /:communityId            get community by ID
//   - PUT  /:communityId            update community
//   - DELETE /:communityId          delete community
//
// controllers/comment.js          → apiRouter.use('/comment', commentRouter)
//   - POST /                        create comment on idea/proposal
//   - GET  /:ideaId                 get comments for idea
//   - PUT  /:commentId              edit comment
//   - DELETE /:commentId            delete comment
//
// controllers/commentInteract.js  → apiRouter.use('/interact/comment', ...)
//   - POST /like                    like a comment
//   - POST /dislike                 dislike a comment
//   - DELETE /like/:commentId       undo like
//
// controllers/commentFunnel.js    — NOTE: not mounted in server.js; verify if active
//   - (routes unknown — audit before migrating)
//
// controllers/blog.js             → apiRouter.use('/blog', blogRouter)
//   - POST /                        create blog post
//   - GET  /                        list blog posts
//   - GET  /:blogId                 get blog post
//   - PUT  /:blogId                 update blog post
//   - DELETE /:blogId               delete blog post
//
// controllers/category.js         → apiRouter.use('/category', categoryRouter)
//   - POST /                        create category
//   - GET  /                        list all categories
//   - GET  /:categoryId             get category by ID
//   - PUT  /:categoryId             update category
//   - DELETE /:categoryId           delete category
//
// controllers/advertisement.js    → apiRouter.use('/advertisement', advertisementRouter)
//   - POST /                        create advertisement
//   - GET  /                        list advertisements
//   - GET  /:adId                   get advertisement by ID
//   - PUT  /:adId                   update advertisement
//   - DELETE /:adId                 delete advertisement
// =============================================================================

//import { Router, type Request, type Response } from 'express';

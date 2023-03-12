require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const { swaggerSpec } = require('./lib/swaggerConfig');
// TODO: May be reason why logout not working

// Constants
const {
	__prod__,
	PORT,
	CORS_ORIGIN
} = require('./lib/constants');


const main = async () => {
	// Initialize dependencies
	const app = express();
	// Apply middleware
	app.use(express.json());
	app.use(
		cors({
			credentials: true,
			origin: CORS_ORIGIN
		})
	);


	app.use('/uploads/AdImage', express.static(path.join(__dirname, 'uploads/AdImage')));
	app.use('/uploads/ideaImage', express.static(path.join(__dirname, 'uploads/ideaImage')));
	app.use('/uploads/avatarImages', express.static(path.join(__dirname, 'uploads/avatarImages')));
	// Swagger config
	app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

	require('./auth/auth');

	app.get('/', (req, res) => res.send('Welcome the My Living City API V2'));
	//app.use(express.static('/ads', express.static('uploads')));
	// Routing .js
	const userRouter = require('./controllers/user');
	const roleRouter = require('./controllers/role');
	const reportRouter = require('./controllers/report');
	const commentRouter = require('./controllers/comment');
	const blogRouter = require('./controllers/blog');
	const badPostingBehaviorRouter = require('./controllers/badPostingBehavior');
	const ideaRouter = require('./controllers/idea');
	const imageRouter = require('./controllers/image');
	const categoryRouter = require('./controllers/category');
	const ideaRatingRouter = require('./controllers/rating');
	const feedbackRatingRouter = require('./controllers/feedbackRating');
	const commentInteractRouter = require('./controllers/commentInteract');
	const championRouter = require('./controllers/champion');
	const advertisementRouter = require('./controllers/advertisement');
	const avatarRouter = require('./controllers/avatar');
	const sendEmailRouter = require('./controllers/sendEmailReset');
	const segmentRouter = require('./controllers/segment');
	const subSegmentRouter = require('./controllers/subSegment');
	const googleLocationAPI = require('./controllers/googleMap');
	const userSegmentRequestRouter = require('./controllers/userSegmentRequest');
	const superSegmentRouter = require('./controllers/superSegment');
	const userSegmentRouter = require('./controllers/userSegment');
	const proposalRouter = require('./controllers/proposal');
	const communityRouter = require('./controllers/community');
	const dashboardRouter = require('./controllers/dashboard');
	const userReachRouter = require('./controllers/userReach');
	const ideaFlagRouter = require('./controllers/flag');
	const commentFlagRouter = require('./controllers/commentFlag');
	const threshholdRouter = require('./controllers/threshhold');
	const accountRouter = require('./webhooks/account');
	const banUserRouter = require('./controllers/banUser.js');
	const banPostRouter = require('./controllers/banPost.js');
	const banCommentRouter = require('./controllers/banComment.js');
	const publicProfileRouter = require('./controllers/publicProfile.js');
	const falseFlaggingBehaviorRouter = require('./controllers/falseFlaggingBehavior.js');
	const schoolDetailsRouter = require('./controllers/schoolDetails.js');
	const workDetailsRouter = require('./controllers/workDetails.js');

	const apiRouter = express.Router();
	app.use('/', apiRouter);
	apiRouter.use('/user', userRouter);
	apiRouter.use('/role', roleRouter);
	apiRouter.use('/report', reportRouter);
	apiRouter.use('/comment', commentRouter);
	apiRouter.use('/blog', blogRouter);
	apiRouter.use('/badPostingBehavior', badPostingBehaviorRouter);
	apiRouter.use('/idea', ideaRouter);
	apiRouter.use('/image', imageRouter);
	apiRouter.use('/category', categoryRouter);
	apiRouter.use('/rating', ideaRatingRouter);
	apiRouter.use('/interact/comment', commentInteractRouter);
	apiRouter.use('/champion', championRouter);
	apiRouter.use('/advertisement', advertisementRouter);
	apiRouter.use('/avatar', avatarRouter);
	apiRouter.use('/sendEmail', sendEmailRouter);
	apiRouter.use('/reset-password', userRouter);
	apiRouter.use('/segment', segmentRouter);
	apiRouter.use('/subSegment', subSegmentRouter);
	apiRouter.use('/location', googleLocationAPI);
	apiRouter.use('/userSegment', userSegmentRouter);
	apiRouter.use('/userSegmentRequest', userSegmentRequestRouter);
	apiRouter.use('/superSegment', superSegmentRouter);
	apiRouter.use('/proposal', proposalRouter);
	apiRouter.use('/community', communityRouter);
	apiRouter.use('/dashboard', dashboardRouter);
	apiRouter.use('/account', accountRouter);
	apiRouter.use('/reach', userReachRouter);
	apiRouter.use('/account', accountRouter);
	apiRouter.use('/flag', ideaFlagRouter);
	apiRouter.use('/commentFlag', commentFlagRouter);
	apiRouter.use('/threshhold', threshholdRouter);
	apiRouter.use('/banUser', banUserRouter);
	apiRouter.use('/banPost', banPostRouter);
	apiRouter.use('/banComment', banCommentRouter);
	apiRouter.use('/publicProfile', publicProfileRouter);
	apiRouter.use('/falseFlaggingBehavior', falseFlaggingBehaviorRouter);
	apiRouter.use('/schoolDetails', schoolDetailsRouter);
	apiRouter.use('/feedbackRating', feedbackRatingRouter);
	apiRouter.use('/workDetails', workDetailsRouter);

	// Listen to server
	app.listen(PORT, console.log(`Server running on PORT:${PORT}\n\n`));
};


main().catch((error) => {
	console.log(error);
});

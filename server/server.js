require('dotenv').config();
const express = require('express');
const cors = require('cors');
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
  
	// Swagger config
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

	require('./auth/auth');

	app.get('/', (req, res) => res.send('Welcome the My Living City API V2'));

	// Routing
	const userRouter = require('./controllers/user');
	const roleRouter = require('./controllers/role');
	const reportRouter = require('./controllers/report');
	const commentRouter = require('./controllers/comment');
	const blogRouter = require('./controllers/blog');
	const ideaRouter = require('./controllers/idea');
	const imageRouter = require('./controllers/image');
	const categoryRouter = require('./controllers/category');
	const ideaRatingRouter = require('./controllers/rating');
	const commentInteractRouter = require('./controllers/commentInteract');
  const championRouter = require('./controllers/champion');
  const advertisementRouter = require('./controllers/advertisement');
	const sendEmailRouter = require('./controllers/sendEmailReset');

	const apiRouter = express.Router();
	app.use('/', apiRouter);
	apiRouter.use('/user', userRouter);
	apiRouter.use('/role', roleRouter);
	apiRouter.use('/report', reportRouter);
	apiRouter.use('/comment', commentRouter);
	apiRouter.use('/blog', blogRouter);
	apiRouter.use('/idea', ideaRouter);
	apiRouter.use('/image', imageRouter);
	apiRouter.use('/category', categoryRouter);
	apiRouter.use('/rating', ideaRatingRouter);
	apiRouter.use('/interact/comment', commentInteractRouter);
  apiRouter.use('/champion', championRouter);
  apiRouter.use('/advertisement',advertisementRouter);
	apiRouter.use('/sendEmail',sendEmailRouter);
	apiRouter.use('/reset-password', userRouter);


	// Listen to server
	app.listen(PORT, console.log(`Server running on PORT:${PORT}\n\n`));
};


main().catch((error) => {
	console.log(error);
});
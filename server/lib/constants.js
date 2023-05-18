// Production NECESSARY application configuration
const __prod__ = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY;
const CORS_ORIGIN = process.env.CORS_ORIGIN;
const PORT = parseInt(process.env.EXPRESS_PORT ?? 3001);
//This is for the googlePlaces api not the map.
const GOOGLE_MAP_API_KEY = process.env.GOOGLE_MAP_API_KEY;

// Rating Thresholds to advance
// Retrieve from environment and set defaults if not set
const env_proposal_rating_count = process.env.PROPOSAL_RATING_COUNT || 25;
const env_proposal_rating_avg = process.env.PROPOSAL_RATING_AVG || 1;
const env_project_rating_count = process.env.PROJECT_RATING_COUNT || 50;
const env_project_rating_avg = process.env.PROJECT_RATING_AVG || 1.5;

// Export as constants to be used in application
const PROPOSAL_RATING_COUNT = parseInt(env_proposal_rating_count);
const PROPOSAL_RATING_AVG = parseInt(env_proposal_rating_avg);
const PROJECT_RATING_COUNT = parseInt(env_project_rating_count);
const PROJECT_RATING_AVG = parseInt(env_project_rating_avg);

// Dictionary of userTypes to subscription stripe product key
const STRIPE_PRODUCTS = {
  "BUSINESS":process.env.STRIPE_BUSINESS_PRODUCT_KEY,
  "COMMUNITY":process.env.STRIPE_COMMUNITY_PRODUCT_KEY
}

// AWS configuration settings for our images bucket
const AWS_CONFIG = {
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY, // store it in .env file to keep it safe
      secretAccessKey: process.env.AWS_SECRET_KEY
  },
  region: process.env.AWS_REGION // this is the region that you select in AWS account
};
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

module.exports = {
  // mandatory application configuration
  __prod__,
  JWT_SECRET,
  JWT_EXPIRY,
  CORS_ORIGIN,
  PORT,
  // application configuration
  PROPOSAL_RATING_AVG,
  PROPOSAL_RATING_COUNT,
  PROJECT_RATING_AVG,
  PROJECT_RATING_COUNT,
  STRIPE_PRODUCTS,
  // aws configuration
  AWS_CONFIG,
  AWS_S3_BUCKET_NAME,
}


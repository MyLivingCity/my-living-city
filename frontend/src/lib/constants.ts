export const __prod__ = process.env.NODE_ENV === 'production';
export const API_BASE_URL =
  process.env.REACT_APP_BASE_API_URL || 'http://localhost:3001';
export const MAP_KEY = String(
    process.env.REACT_APP_GOOGLE_PHYSICAL_MAP_API_KEY
);
// UTILITY defaults
export const UTIL_FUNCTIONS = {
    delayDefault: Number(process.env.REACT_APP_UTIL_FUNC_DELAY ?? 2000),
};
export const STRIPE_PUBLIC_KEY = String(process.env.REACT_APP_STRIPE_KEY);
export const STRIPE_PRODUCT_40 = 'price_1KyU20Dabqllr9PHxIInGgjr';

// Basic styles
export const MLC_COLOUR_THEME = {
    mainDark: '#549762',
    mainLight: '#A0C65F',
    shadeGray: '#F1F2F2',
    redWarning: '#F93943',
};
export const COUNTRIES = ['Canada'];
export const PROVINCES = [
    'British Columbia',
    'Alberta',
    'Manitoba',
    'New Brunswick',
    'Newfoundland and Labrador',
    'Northwest Territories',
    'Nova Scotia',
    'Nunavut',
    'Ontario',
    'Prince Edward Island',
    'Quebec',
    'Saskatchewan',
    'Yukon',
];
// Token expiry in minutes
export const TOKEN_EXPIRY = Number(process.env.REACT_APP_TOKEN_EXPIRY || 60);
export enum USER_TYPES {
  ADMIN = 'ADMIN',
  MOD = 'MOD',
  SEG_ADMIN = 'SEG_ADMIN',
  SEG_MOD = 'SEG_MOD',
  MUNICIPAL_SEG_ADMIN = 'MUNICIPAL_SEG_ADMIN',
  BUSINESS = 'BUSINESS',
  MUNICIPAL = 'MUNICIPAL',
  ASSOCIATE = 'ASSOCIATE',
  DEVELOPER = 'DEVELOPER',
  RESIDENTIAL = 'RESIDENTIAL',
  COMMUNITY = 'COMMUNITY',
  IN_PROGRESS = 'IN_PROGRESS',
}
// Routes should be placed here and called into "path" in Route component
export const ROUTES = {
    LANDING: '/',
    CONVERSATIONS: '/ideas',
    SINGLE_IDEA: '/ideas/:ideaId',
    SINGLE_PROPOSAL: '/proposals/:proposalId',
    SUBMIT_IDEA: '/submit',
    LOGIN: '/login',
    CHECKEMAIL: '/check-email',
    REGISTER: '/register',
    USER_PROFILE: '/profile',
    TEST_PAGE: '/test',
    TEAM404: '/*',
    ADMIN_MOD_EMAIL_GENERATE: '/adminmod-email-generate',
    SUBMIT_ADVERTISEMENT: '/advertisement/submit',
    ALL_ADVERTISEMENT: '/advertisement/all', //
    USER_ADVERTISEMENTS: '/advertisement/user', //
    EDIT_ADVERTISEMENT: '/advertisement/edit',
    SEND_EMAIL: '/sendEmail',
    RESET_PASSWORD: '/user/reset-password',
    SEGMENT_MANAGEMENT: '/segment/management',
    USER_MANAGEMENT: '/user/management',
    ADMIN_MANAGEMENT: '/admin/management',
    SUBMIT_DIRECT_PROPOSAL: '/submit-direct-proposal',
    DASHBOARD: '/dashboard',
    My_POSTS: '/dashboard/my-posts',
    MY_ADVERTISMENT: '/advertisement/my-ads',
    COMMUNITY_DASHBOARD: '/community-dashboard/:segId',
    MUNICIPAL_DASHBOARD: '/municipal-dashboard/:segId',
    MOD_MANAGEMENT: '/mod/management',
};

export enum BAN_USER_TYPES {
  WARNING = 'WARNING',
  POST_BAN = 'POST_BAN',
  SYS_BAN = 'SYS_BAN',
}

export enum SOCIAL_MEDIA_TYPES {
  FACEBOOK = 'FACEBOOK',
  TWITTER = 'TWITTER',
  WHATSAPP = 'WHATSAPP',
  LINE = 'LINE',
  REDDIT = 'REDDIT',
  EMAIL = 'EMAIL',
  OTHER = 'OTHER',
}

export const TEXT_INPUT_LIMIT = {
    TITLE: 100,
    DESCRIPTION: 400,
    IMPACT_AREAS: 100,
    COMMENT: 280,
    MISSION_STATEMENT: 100,
    LOCATION: 46,
    MIN_AD_TITLE: 2,
    MAX_AD_TITLE: 50,
    EXTERNAL_LINK: 2000,
    NAME: 50,
    STREET_NAME: 28,
};

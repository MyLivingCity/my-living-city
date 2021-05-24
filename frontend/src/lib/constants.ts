export const __prod__ = process.env.NODE_ENV === 'production';
export const API_BASE_URL = process.env.REACT_APP_BASE_API_URL || 'http://localhost:3001'

// UTILITY defaults
export const UTIL_FUNCTIONS = {
  delayDefault: Number(process.env.REACT_APP_UTIL_FUNC_DELAY ?? 2000)
}

// Basic styles
export const MLC_COLOUR_THEME = {
  mainDark: '#549762',
  mainLight: '#A0C65F',
  shadeGray: '#F1F2F2',
  redWarning: '#F93943'
}

// Token expiry in minutes
export const TOKEN_EXPIRY = Number(process.env.REACT_APP_TOKEN_EXPIRY || 60);

// Routes should be placed here and called into "path" in Route component
export const ROUTES = {
  LANDING: '/',
  CONVERSATIONS: '/ideas',
  SINGLE_IDEA: '/ideas/:ideaId',
  SUBMIT_IDEA: '/submit',
  LOGIN: '/login',
  REGISTER: '/register',
  USER_PROFILE: '/profile',
  TEST_PAGE: '/test',
  TEAM404: '/*',
  SUBMIT_ADVERTISEMENT: '/advertisement/submit',
  SEND_EMAIL: '/sendEmail',
  RESET_PASSWORD:'/user/reset-password'
}
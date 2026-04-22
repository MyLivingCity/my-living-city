export const API_BASE_URL = "http://localhost:4000";

// Basic styles
export const MLC_COLOUR_THEME = {
  mainDark: "#549762",
  mainLight: "#A0C65F",
  shadeGray: "#F1F2F2",
  redWarning: "#F93943",
};
export const COUNTRIES = ["Canada", "US"];
export const PROVINCES = [
  "British Columbia",
  "Alberta",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
];

export const USER_TYPES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MOD: "MOD",
  SEG_ADMIN: "SEG_ADMIN",
  SEG_MOD: "SEG_MOD",
  MUNICIPAL_SEG_ADMIN: "MUNICIPAL_SEG_ADMIN",
  BUSINESS: "BUSINESS",
  MUNICIPAL: "MUNICIPAL",
  ASSOCIATE: "ASSOCIATE",
  DEVELOPER: "DEVELOPER",
  RESIDENTIAL: "RESIDENTIAL",
  COMMUNITY: "COMMUNITY",
  IN_PROGRESS: "IN_PROGRESS",
} as const;
// Routes should be placed here and called into "path" in Route component
export const ROUTES = {
  LANDING: "/",
  CONVERSATIONS: "/ideas",
  SINGLE_IDEA: "/ideas/:ideaId",
  SINGLE_PROPOSAL: "/proposals/:proposalId",
  SUBMIT_IDEA: "/submit",
  LOGIN: "/login",
  CHECKEMAIL: "/check-email",
  REGISTER: "/register",
  USER_PROFILE: "/profile",
  TEST_PAGE: "/test",
  TEAM404: "/*",
  ADMIN_MOD_EMAIL_GENERATE: "/adminmod-email-generate",
  SUBMIT_ADVERTISEMENT: "/advertisement/submit",
  SUBMIT_ADVERTISEMENT_COMPLIMENTARY: "/advertisement/complimentary",
  ALL_ADVERTISEMENT: "/advertisement/all",
  USER_ADVERTISEMENTS: "/advertisement/user",
  EDIT_ADVERTISEMENT: "/advertisement/edit",
  EDIT_AD_PRICING: "/advertisement/pricing",
  SEND_EMAIL: "/sendEmail",
  RESET_PASSWORD: "/user/reset-password",
  SEGMENT_MANAGEMENT_OVERVIEW: "/segment/management/all",
  SEGMENT_MANAGEMENT: "/segment/management/:segId",
  USER_MANAGEMENT: "/user/management",
  ADMIN_MANAGEMENT: "/admin/management",
  ADMIN_PRICING_AND_LIMIT: "/admin/pricing-and-limit",
  SUBMIT_DIRECT_PROPOSAL: "/submit-direct-proposal",
  DASHBOARD: "/dashboard",
  My_POSTS: "/dashboard/my-posts",
  MY_ADVERTISMENT: "/advertisement/my-ads",
  COMMUNITY_DASHBOARD: "/community-dashboard/:segId",
  MUNICIPAL_DASHBOARD: "/municipal-dashboard/:segId",
  MOD_MANAGEMENT: "/mod/management",
  SUBGROUP_MANAGEMENT: "/subgroup-management",
  PUBLIC_PROFILES: "/public-profiles",
  SUBGROUP_MANAGEMENT_CREATION: "/subgroup/management",
};

export const BAN_USER_TYPES = {
  WARNING: "WARNING",
  POST_BAN: "POST_BAN",
  SYS_BAN: "SYS_BAN",
} as const;

export const SOCIAL_MEDIA_TYPES = {
  FACEBOOK: "FACEBOOK",
  TWITTER: "TWITTER",
  WHATSAPP: "WHATSAPP",
  LINE: "LINE",
  REDDIT: "REDDIT",
  EMAIL: "EMAIL",
  OTHER: "OTHER",
} as const;

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

export const PrivacyField = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
  TEST: "TEST",
} as const;

export const MembershipStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const TypeField = {
  VIRTUAL: "VIRTUAL",
  NESTED: "NESTED",
} as const;

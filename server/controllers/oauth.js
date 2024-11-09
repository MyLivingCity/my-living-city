const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Step 1: Initiate Google OAuth Flow
router.get('/auth/google', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://mail.google.com/'],
  });
  res.redirect(authUrl);
});

// Step 2: Handle Google Callback
router.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  
  try {
    // Exchange authorization code for access token 
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    res.send('Authorization successful! Refresh token saved for testing.');
  } catch (error) {
    console.error('Error during Google OAuth callback:', error);
    res.status(500).send('Error during authorization.');
  }
});

module.exports = router;

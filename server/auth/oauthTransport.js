/* Uses OAuth to send an email verification, should be used at some point in the future
    however, this requires some work to verify the application with Google as until then 
    refresh tokens will only last 7 days*/

const { google } = require('googleapis');
const nodemailer = require('nodemailer');


    
const createOAuthTransport = async () => {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.REDIRECT_URI,
    );

    oAuth2Client.setCredentials({refresh_token: process.env.GOOGLE_REFRESH_TOKEN});

    try {
      const accessToken = await oAuth2Client.getAccessToken();

      const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              type: 'OAuth2',
              user: process.env.EMAIL,
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
              accessToken: accessToken.token,
            },
      });
      return transport;
    } catch (error) {
      console.error('Error creating OAuth transport:', error);
      throw new Error('Failed to create OAuth transport');
    }
};
  
module.exports = createOAuthTransport;
const nodemailer = require('nodemailer');

  // Function to create App Password transport
const createAppPasswordTransport = () => {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL, 
        pass: process.env.APPLICATION_PASSWORD,
      },
    });
  
    return transport;
  };
  
  module.exports = createAppPasswordTransport;
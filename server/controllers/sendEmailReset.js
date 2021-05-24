var nodemailer = require('nodemailer');
const express = require('express');
const sendEmailRouter = express.Router();
const prisma = require('../lib/prismaClient');
sendEmailRouter.post(
    '/',
    async (req, res) => {
        const{email}=req.body;
        try {
            const foundUser = await prisma.user.findUnique({
				where: { email }
			});
            //console.log(foundUser);
            if (foundUser){
                var mailOptions = {
                    from: process.env.EMAIL_USERNAME,
                    to: email,
                    subject: 'MyLivingCity Password Reset',
                    //text: `Confirmation code: ${foundUser.id.substr(foundUser.id.length-6)}`
                    text: `${process.env.CORS_ORIGIN}/user/reset-password?passCode=${foundUser.passCode}`
                };
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USERNAME,
                        pass: process.env.EMAIL_PASSWORD
                    }
                    });
            
                    transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                    });
                    res.send("Sent password reset email");
            }
            
        
    } catch (error) {
        res.status(400);
        res.json({
            message: error.message,
    details: {
      errorMessage: error.message,
      errorStack: error.stack,
    }
        })
    } finally {
        await prisma.$disconnect();
    }
    }
)


module.exports = sendEmailRouter;
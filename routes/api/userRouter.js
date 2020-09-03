const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const config = require('config');


function routes(User, verifyToken) {
const userRouter = express.Router();
const MAILGUN_USER = config.get('MAILGUN_USER');
const MAILGUN_PW = config.get('MAILGUN_PW');


  userRouter.route('/users')
    .get((req, res) => {
      const response = { hello: "This is my user API" };
      res.json(response);
    })
    .post((req, res) => {
      // Make sure this account doesn't already exist
      User.findOne({ email: req.body.email }, function (err, user) {
        if (user) {
          return res.status(400).send(
            { msg: 'The email address you have entered is already associated with another account.' }
          );
        }
        user = new User(req.body);
        user.save();

        // Create a verification token for this user
        var token = new verifyToken({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
        token.save(function (err) {
          if (err) {
            return res.status(500).send({
              //msg: err.message 
              msg: "token not saved"
            });
          }

          // Send the email
          /*
          var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });

           var transporter = nodemailer.createTransport({ 
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: { user: "fbf373ec368386", pass: "6931f68f50a1a9" } });
          */

          var transporter = nodemailer.createTransport({
            host: "smtp.mailgun.org",
            port: 587,
            auth: {
              user: MAILGUN_USER,
              pass: MAILGUN_PW
            }
          });

          var mailOptions = {
            from: 'wisdomjudeson@gmail.com',
            to: user.email,
            subject: 'Account Verification Token',
            text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/api\/user\/emailconfirmation' + '?token=' + token.token + '&email=' + user.email + '\n'
          };
          transporter.sendMail(mailOptions, function (err) {
            if (err) {
              return res.status(500).send({
                msg: err.message,
                msg2: "mail not sent"
              });
            }
            return res.status(200).send('A verification email has been sent to ' + user.email + '.');
          });
        });
        // return res.send('something happened');
        // return res.status(201).json(user);
      })
    });


  userRouter.route('/user/emailconfirmation')
    .get((req, res) => {
      // Find a matching token

      verifyToken.findOne({ token: req.query.token }, function (err, token) {
        if (!token) return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token. Your token my have expired.' });
        

        // If we found a token, find a matching user
        User.findOne({ _id: token._userId, email: req.query.email }, function (err, user) {
          if (!user) return res.status(400).send({ msg: 'We were unable to find a user for this token.' });

          if (user.email_status) res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.' });

          // Verify and save the user
          user.email_status = true;
          user.save(function (err) {
            if (err) { return res.status(500).send({ msg: err.message }); }
            return res.redirect('login?mesg=emailverifysuccess');
          });
        });
      });
      

      // return res.send(req.query.token);

    });

    userRouter.route('/user/login')
    .get((req, res) => {
      res.send('This is User Login Page!!')
    });

  return userRouter;

}
module.exports = routes;
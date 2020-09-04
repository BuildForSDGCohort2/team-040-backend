const crypto = require('crypto');
const nodemailer = require('nodemailer');
const config = require('config');

function usersController(User, verifyToken) {

    const MAILGUN_USER = config.get('MAILGUN_USER');
    const MAILGUN_PW = config.get('MAILGUN_PW');

    function get(req, res) {
        const response = { hello: "This is my user API!! /n Should be displaying List of Users but not yet!." };
        res.json(response);
    }

    function post(req, res) {
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
                var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });

                var transporter = nodemailer.createTransport({
                    host: "smtp.mailtrap.io",
                    port: 2525,
                    auth: { user: "fbf373ec368386", pass: "6931f68f50a1a9" }
                });


                /*var transporter = nodemailer.createTransport({
                  host: "smtp.mailgun.org",
                  port: 587,
                  auth: {
                    user: MAILGUN_USER,
                    pass: MAILGUN_PW
                  }
                });*/

                var mailOptions = {
                    from: 'no-reply@propertease.com',
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
    }

    return { get, post };
}

module.exports = usersController;
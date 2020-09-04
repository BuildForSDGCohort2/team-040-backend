const express = require('express');
const usersController = require('../../controllers/usersController');


function routes(User, verifyToken) {
  const userRouter = express.Router();
  const controller = usersController(User, verifyToken);
 


  userRouter.route('/users')
    .get(controller.get)
    .post(controller.post);


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
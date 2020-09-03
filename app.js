/* eslint-disable indent */
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const connectDB = require('./config/db');

// importing my database models
const User = require('./models/userModel');
const verifyToken = require('./models/verifyTokenModel');


const app = express();
app.use(cors());

connectDB();

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// importing my routers
const userRouter = require('./routes/api/userRouter')(User, verifyToken);
app.use('/api', userRouter);



app.get('/', (req, res) => {
  res.send('Welcome to Propertease API!!');
});

app.server = app.listen(port, () => {
  console.log(`Running on port ${port}`);
});

module.exports = app;
const express = require('express');
const dotenv = require('dotenv');
const app = express();
const mongoose = require('mongoose');
dotenv.config();

// import routes
const authRoute = require('./routes/auth');
const postRoute = require('./routes/posts');

//coonect to DB
mongoose.connect(process.env.DB_CONNECT,
    { useNewUrlParser: true },
    () => console.log('connected to Db'));

// Middleware
app.use(express.json());

// Route Middleware
app.use('/api/user', authRoute);
app.use('/api/posts', postRoute);

app.listen(3000, () => console.log('Server Up and Running'));


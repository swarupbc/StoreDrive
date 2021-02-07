const router = require('express').Router();
const User = require('../model/User');
const Joi = require('@hapi/joi');
const { registerValidation, loginValidation, updatePasswordValidation } = require('../validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {

    // Validate the data before save
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //checking if user exist
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).send('Email already exists');

    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    //create new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword,
    });
    try {
        const savedUser = await user.save();
        res.send({ user: user._id });
    } catch (e) {
        res.status(400).send(e);
    }
});



// Login
router.post('/login', async (req, res) => {
    // Validate the data 
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //checking is user exist
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Email or Password is wrong');

    //Password is Correct
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Email or Password is wrong');

    // create and assign a token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);


});

router.post('/updatePassword', async (req, res) => {
    // Validate the data 
    const { error } = updatePasswordValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //checking is user exist
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Email or Password is wrong');

    //Password is Correct
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Email or Password is wrong');

    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    // Update Password
    try {
        User.findOneAndUpdate({ password }, hashPassword);
        res.send('password updated');
    } catch (e) {
        res.status(400).send(e);
    }
});


module.exports = router;
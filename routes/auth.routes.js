const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const fileUploader = require('../config/cloudinary.config');

const {isAuthenticated} = require('../middleware/jwt.middleware')

const router = express.Router()
const saltRounds = 10;

////// POST  /auth/signup

router.post("/signup", fileUploader.single('avatarURL'), async (req, res, next) =>{

    // if (!req.file) {
    //     next(new Error("No file uploaded!"));
    //     return;
    // }

    const {name, email, password, registrationDate, about} = req.body;

    if(name === '' || email === '' || password === '') {
        res.status(400).json({message: "Provide email, password and name"})
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if(!emailRegex.test(email)){
        res.status(400).json({message: "Provide a valid email address"})
        return;
    }

    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if(!passwordRegex.test(password)){
        res.status(400).json({message: "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter"})
        return;
    }

    let user = await User.findOne({email})
    //console.log(user)
    if(user) {
        res.status(400).json({message: 'User already exists'})
        return;
    }

    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    try {
        // create a new user in the database
        user = await User.create({name, email, password: hashedPassword, registrationDate, about, avatarURL: req?.file?.path, trips: [], reviews: []})
        // deconstruct the user object to omit the password & send the JSON response that includes the newly created user object, without the password
        res.status(201).json({ name, email, registrationDate, about, avatarURL: req?.file?.path, _id: user._id, trips: [], reviews: []})
     }
    catch (err) {
         console.log(err);
        res.status(500).json({ message: "Internal Server Error" })
    }

})
 
////// POST  /auth/login

router.post("/login", async (req, res, next) =>{
    const {email, password} = req.body;

    if(!email || !password) {
        res.status(400).json({message:'Please provide email and password'})
        return;
    }

    const user = await User.findOne({email})
    if(!user) {
        res.status(400).json ({message: 'User not found'})
        return;
    }

    if(!bcrypt.compareSync(password, user.password)) {
        res.status(401).json({ message: "Unable to authenticate the user" });
        return;
    }

    const payload = {email, name: user.name, _id: user._id}

    const authToken = jwt.sign( 
        payload,
        process.env.TOKEN_SECRET,
        { algorithm: 'HS256', expiresIn: "6h" }
      );

      res.status(201).json({token: authToken})

})

////// GET  /auth/verify

router.get('/verify', isAuthenticated, (req, res) => {
    // console.log("req.payload ", req.payload)
    res.status(200).json(req.payload);
})

module.exports = router;
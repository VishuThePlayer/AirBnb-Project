const express = require('express');
const router = express.Router();
const ExpressError = require('../ExpressError/ExpressError');
const userSchema = require("../models/userSchema");
const passport = require('passport');

function asyncWrap(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', asyncWrap(async(req, res) => {
    // Extract data from the request body
    const formData = req.body;
    let {username, email, password} = req.body;
    // Log the data to the console
    console.log("Form Data Received:");
    console.log(formData);

    //registering the user 
    const newUser = new userSchema({email, username});
    const registeredUser = await userSchema.register(newUser, password);
    console.log(registeredUser);

    if(!registeredUser){
        req.flash("error","Error Occurred");
        res.redirect("/signup");
    }
    // Send a response back to the client
    req.flash("Success", "User Registered Succefully")
    res.redirect("/listings");
}));

router.get('/login', (req, res) => {
    res.render('login');
})

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("Success", "Logged Out Successfuly")
        res.redirect('/login');
    })
})

router.post('/login', passport.authenticate("local", {failureRedirect: '/login', failureFlash: true}), asyncWrap(async(req, res) => {
    req.flash("Success", "Welcome" + " " + req.user.username);
    console.log(req.user);
    res.redirect("/listings");
}))

module.exports = router;
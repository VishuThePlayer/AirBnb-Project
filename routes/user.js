const express = require('express');
const router = express.Router();
const ExpressError = require('../ExpressError/ExpressError');
const userSchema = require("../models/userSchema");
const passport = require('passport');
const { saveRedirectUrl } = require('../loginCheck');


function asyncWrap(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

router.get('/signup', (req, res) => {
    res.render('signup', {req: req});
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
    req.login(registeredUser, (err) => {
        if (err) {
            return next(err);
        }
        req.flash("Success", "Welcome" + " " + req.user.username);
        console.log(req.user);
        res.redirect("/listings");
    })
    // Send a response back to the client
    
}));

router.get('/login', (req, res) => {
    res.render('login', {req: req});
})

router.post('/login', saveRedirectUrl, passport.authenticate("local", { 
    failureRedirect: '/login', 
    failureFlash: true 
}), asyncWrap(async(req, res) => {
    req.flash("Success", "Welcome " + req.user.username);
    
    // Check if redirectUrl exists, if not, default to '/listings'
    const redirectUrl = res.locals.redirectUrl || '/listings';
    
    console.log("Redirecting to:", redirectUrl);
    res.redirect(redirectUrl);
}));



router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("Success", "Logged Out Successfuly")
        console.log(`User made a logout request ${req.user}`);
        res.redirect('/login');
    })
})



module.exports = router;
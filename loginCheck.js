module.exports.isLoggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;  // Fix the typo here
        req.flash("error", "You must be logged in to StayNJoy");
        return res.redirect('/login');
    }
    next();
};



module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        console.log("Redirect URL found and saved to res.locals:", res.locals.redirectUrl);
        delete req.session.redirectUrl;  // Clear the session variable after saving it to res.locals
    }
    next();
};

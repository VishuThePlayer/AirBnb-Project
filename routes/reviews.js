const express = require('express');
const router = express.Router({mergeParams: true});
const ExpressError = require('../ExpressError/ExpressError');
const listing = require('../models/staynenjoy_schema'); // Ensure this path is correct
const reviewSchema = require('../models/reviewSchema'); // Ensure this path is correct
const {ReviewSchemaList } = require('../schema'); // Ensure this path is correct
const {isLoggedin, isReviewAuthor} = require("../loginCheck");

// Helper function to handle async errors
function asyncWrap(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}



// Middleware to validate Review Schema
const validateReview = (req, res, next) => {
    const { error } = ReviewSchemaList.validate(req.body);
    if (error) {
        return next(new ExpressError(400, error.details.map(e => e.message).join(",")));
    }
    next();
};

router.get('/:reviewid', isLoggedin, asyncWrap((req, res, next) => {
    const { id, reviewid } = req.params;
    req.flash("error", "Error Occurred");
    res.redirect(`/listings/${id}`);
}))

router.post('/', isLoggedin, validateReview, asyncWrap(async (req, res, next) => {
    const { rating, comment } = req.body;
    const { id } = req.params;

    const review = new reviewSchema({ comment, rating });
    review.author = req.user._id;
    // console.log("author " + review.author);
    const result = await review.save();
    if (!result){ 
        throw new ExpressError(401, "Error occurred");
    }

    const listingFind = await listing.findById(id);
    if (!listingFind){
        req.flash("error", "listing wasnt found")
        res.redirect("/listings");
        throw new ExpressError(404, "listings doesnt exist");
    }

    listingFind.reviews.push(result._id);
    await listingFind.save();
    req.flash("Success", "Listing Created Successfuly");
    res.redirect(`/listings/${id}`);
}));

router.delete('/:reviewid', isLoggedin, isReviewAuthor, asyncWrap(async (req, res, next) => {
    const { id, reviewid } = req.params;
    await reviewSchema.findByIdAndDelete(reviewid);
    await listing.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
    req.flash("Success", "Review Deleted Successfuly");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;
const express = require('express');
const router = express.Router({mergeParams: true});
const ExpressError = require('../ExpressError/ExpressError');
const listing = require('../models/staynenjoy_schema'); // Ensure this path is correct
const reviewSchema = require('../models/reviewSchema'); // Ensure this path is correct
const {ReviewSchemaList } = require('../schema'); // Ensure this path is correct

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


router.post('/', validateReview, asyncWrap(async (req, res, next) => {
    const { rating, comment } = req.body;
    const { id } = req.params;

    try {
        const review = new reviewSchema({ comment, rating });
        const result = await review.save();
        if (!result) throw new ExpressError(401, "Error occurred");

        const listingFind = await listing.findById(id);
        if (!listingFind) throw new ExpressError(404, "Listing not found");

        listingFind.reviews.push(result._id);
        await listingFind.save();

        res.redirect(`/listings/${id}`);
    } catch (err) {
        next(err);
    }
}));

router.delete('/:reviewid', asyncWrap(async (req, res, next) => {
    const { id, reviewid } = req.params;
    try {
        await reviewSchema.findByIdAndDelete(reviewid);
        await listing.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
        res.redirect(`/listings/${id}`);
    } catch (err) {
        next(err);
    }
}));

module.exports = router;
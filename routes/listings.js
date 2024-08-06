const express = require('express');
const router = express.Router();
const ExpressError = require('../ExpressError/ExpressError');
const listing = require('../models/staynenjoy_schema'); // Ensure this path is correct
const reviewSchema = require('../models/reviewSchema'); // Ensure this path is correct
const { SchemaList, ReviewSchemaList } = require('../schema'); // Ensure this path is correct

// Helper function to handle async errors
function asyncWrap(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

// Middleware to validate Schema
const validateSchema = (req, res, next) => {
    const { error } = SchemaList.validate(req.body);
    if (error) {
        let errmessage = error.details.map((e) => e.message).join(",");
        return next(new ExpressError(400, errmessage));
    }
    next();
};

// Middleware to validate Review Schema
const validateReview = (req, res, next) => {
    const { error } = ReviewSchemaList.validate(req.body);
    if (error) {
        return next(new ExpressError(400, error.details.map(e => e.message).join(",")));
    }
    next();
};

// Define your routes
router.get('/', asyncWrap(async (req, res, next) => {
    const allListings = await listing.find({});
    if (!allListings) {
        return next(new ExpressError(500, 'No listings found'));
    }
    res.render('main', { data: allListings });
}));

router.get('/new', (req, res) => {
    res.render('new_listings');
});

router.post('/new', validateSchema, asyncWrap(async (req, res, next) => {
    const newListing = new listing(req.body.listing);
    await newListing.save();
    res.redirect('/listings');
}));



router.get('/edit/:id', asyncWrap(async (req, res, next) => {
    const { id } = req.params;
    const listingFound = await listing.findById(id);
    if (!listingFound) {
        return next(new ExpressError(404, 'Listing Not Found'));
    }
    res.render('edit_hotels', { data: listingFound });
}));

router.put('/edit/:id', asyncWrap(async (req, res, next) => {
    const { id } = req.params;
    const { title, description, image_url, price, location, country } = req.body;

    try {
        const updatedListing = await listing.findByIdAndUpdate(id, {
            title,
            description,
            image: { url: image_url },
            price,
            location,
            country
        }, { new: true });

        if (!updatedListing) return next(new ExpressError(404, 'Listing Not Found'));

        res.redirect(`/listings/${id}`);
    } catch (err) {
        next(err);
    }
}));

router.get('/:id', asyncWrap(async (req, res, next) => {
    const { id } = req.params;
    const listingFound = await listing.findById(id).populate("reviews");
    if (!listingFound) return next(new ExpressError(404, 'Listing Not Found'));
    res.render('hotels', { data: listingFound });
}));

router.delete('/:id', asyncWrap(async (req, res, next) => {
    const { id } = req.params;
    try {
        await listing.findByIdAndDelete(id);
        res.redirect('/listings');
    } catch (err) {
        next(err);
    }
}));


// Export the router
module.exports = router;

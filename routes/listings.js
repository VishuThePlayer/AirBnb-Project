const express = require('express');
const router = express.Router();
const ExpressError = require('../ExpressError/ExpressError');
const listing = require('../models/staynenjoy_schema'); // Ensure this path is correct
const { SchemaList } = require('../schema'); // Ensure this path is correct
const flash = require('connect-flash');
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
    req.flash("Success", "New Listing Created Successfuly")
    res.redirect('/listings');
}));



router.get('/edit/:id', asyncWrap(async (req, res, next) => {
    const { id } = req.params;
    const listingFound = await listing.findById(id);
    if (!listingFound) {
        req.flash("error", "Listing Doesnt Found");
        res.redirect('/listings');
    };
    res.render('edit_hotels', { data: listingFound });
}));

router.put('/edit/:id', asyncWrap(async (req, res, next) => {
    const { id } = req.params;
    const { title, description, image_url, price, location, country } = req.body;

    const updatedListing = await listing.findByIdAndUpdate(id, {
        title,
        description,
        image: { url: image_url },
        price,
        location,
        country
    }, { new: true });

    if (!updatedListing) {
        req.flash("error", "Listing Doesnt Found");
        res.redirect('/listings');
    };
    req.flash("Success", "Listing Modified Successfuly");
    res.redirect(`/listings/${id}`);

}));

router.get('/:id', asyncWrap(async (req, res, next) => {
    const { id } = req.params;
    const listingFound = await listing.findById(id).populate("reviews");
    if (!listingFound) {
        req.flash("error", "Listing Doesnt Found");
        res.redirect('/listings');
    };
    res.render('hotels', { data: listingFound });
}));

router.delete('/:id', asyncWrap(async (req, res, next) => {
    const { id } = req.params;
    try {
        await listing.findByIdAndDelete(id);
        req.flash("Success", "Listing Deleted Successfuly");
        res.redirect('/listings');
    } catch (err) {
        next(err);
    }
}));


// Export the router
module.exports = router;

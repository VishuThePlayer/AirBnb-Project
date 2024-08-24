const express = require('express');
const router = express.Router();
const listing = require('../models/staynenjoy_schema'); // Ensure this path is correct
const { isLoggedin, isOwner, validateSchema } = require("../loginCheck");
const listingController = require('../controllers/listings.js');

// Helper function to handle async errors
function asyncWrap(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

// Routes
router.route('/new')
    .get(isLoggedin, listingController.newForm)
    .post(isLoggedin, validateSchema, asyncWrap(listingController.newFormPublish));

router.route('/')
    .get(asyncWrap(listingController.index));

router.route('/edit/:id')
    .get(isLoggedin, asyncWrap(listingController.editForm))
    .put(isLoggedin, isOwner, asyncWrap(listingController.editFormUpload));

router.route('/:id')
    .get(asyncWrap(listingController.showListing))
    .delete(isLoggedin, asyncWrap(listingController.deleteListing));

// Export the router
module.exports = router;

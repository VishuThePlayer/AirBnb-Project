const express = require('express');
const router = express.Router();
const listing = require('../models/staynenjoy_schema'); // Ensure this path is correct
const {isLoggedin, isOwner, validateSchema} = require("../loginCheck");
const listingController = require('../controllers/listings.js')


// Helper function to handle async errors
function asyncWrap(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

// Middleware to validate Schema


// Define your routes
router.get('/', asyncWrap(listingController.index));

router.get('/new', isLoggedin, listingController.newForm);

router.post('/new', isLoggedin, validateSchema, asyncWrap(listingController.newFormPublish));



router.get('/edit/:id', isLoggedin, asyncWrap(listingController.editForm));

router.put('/edit/:id', isLoggedin, isOwner, asyncWrap(listingController.editFormUpload));

router.get('/:id', asyncWrap(listingController.showListing));

router.delete('/:id', isLoggedin, asyncWrap(listingController.deleteListing));


// Export the router
module.exports = router;

const listing = require('../models/staynenjoy_schema'); // Ensure this path is correct

module.exports.index = async (req, res, next) => {
    const allListings = await listing.find({});
    if (!allListings) {
        req.flash("error", "No listing Found");
    }
    res.render('main', { data: allListings });
};

module.exports.newForm = (req, res) => {
    // console.log(req.user); //CONSOLE LOG USERS
    res.render('new_listings');
};

module.exports.newFormPublish = async (req, res, next) => {
    if(!req.isAuthenticated()){
        req.flash("error", "You must be loggged in to StayNJoy")
        return res.redirect('/login');
    }
    let newListing = new listing(req.body.listing);

    newListing.owner = req.user._id
    await newListing.save();

    req.flash("Success", "New Listing Created Successfuly")
    res.redirect('/listings');
};

module.exports.editForm = async (req, res, next) => {
    const { id } = req.params;
    const listingFound = await listing.findById(id);
    if (!listingFound) {
        req.flash("error", "Listing Doesnt Found");
        res.redirect('/listings');
    };
    res.render('edit_hotels', { data: listingFound });
};

module.exports.editFormUpload = async (req, res, next) => {
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

};

module.exports.showListing = async (req, res, next) => {
    const { id } = req.params;
    const listingFound = await listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");
    if (!listingFound) {
        req.flash("error", "Listing Doesnt Found");
        res.redirect('/listings');
    };
    res.render('hotels', { data: listingFound });
};

module.exports.deleteListing = async (req, res, next) => {
    const { id } = req.params;
    try {
        await listing.findByIdAndDelete(id);
        req.flash("Success", "Listing Deleted Successfuly");
        res.redirect('/listings');
    } catch (err) {
        next(err);
    }
};
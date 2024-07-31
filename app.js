//--------------------------------- Importing Libraries and Defining Constants ---------------------------------//

const express = require('express');
const mongoose = require('mongoose');
const listing = require('./models/staynenjoy_schema'); // Ensure this path is correct
const { data } = require('./models/random_gen_data/data'); // Ensure this path is correct
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const SchemaList = require('./schema'); // Ensure this path is correct
require('dotenv').config();

const PORT = 3000;
const ExpressError = require('./ExpressError/ExpressError');
const MONGO_URL = process.env.MONGO_URL;

//--------------------------------- Initializing Express App ---------------------------------//

const app = express();

// Setting up view engine and middleware
app.set('view engine', 'ejs');
app.set('trust proxy', true);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'views/public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

const validateSchena = (req, res, next) => {
    const { error } = SchemaList.validate(req.body);
    let errmessage = error.details.map((e) => e.message).join(",");
    if(error){
        next(new ExpressError(400, errmessage));
    }else{
        next()
    }
};

//--------------------------------- Establishing MongoDB Connection ---------------------------------//

const main = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('Successfully connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

main();

//--------------------------------- Utility Functions ---------------------------------//

function asyncWrap(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

//--------------------------------- Routes ---------------------------------//


app.use((req, res, next) => {
    try {
        req.time = new Date().toDateString();
        console.log(`[${req.time}] ${req.method} ${req.url} - Host: ${req.hostname}`);
        next();
    } catch (error) {
        console.error('Error processing request:', error);
        next(error);
    }
});


app.get('/listings', asyncWrap(async (req, res, next) => {
    const allListings = await listing.find({});
    if (!allListings) {
        return next(new ExpressError(500, 'Validation Error'));
    }
    res.render('main', { data: allListings });
}));

app.get('/listings/new', (req, res) => {
    res.render('new_listings');
});

app.post('/listings/new', validateSchena, asyncWrap(async (req, res, next) => {

    const newListing = new listing(req.body.listing);
    await newListing.save();
    res.redirect('/listings');
}));

app.get('/listings/edit/:id', asyncWrap(async (req, res, next) => {
    const { id } = req.params;
    const listingFound = await listing.findById(id);
    if (!listingFound) {
        return next(new ExpressError(404, 'Listing Not Found Kindly Return Back'));
    }
    res.render('edit_hotels', { data: listingFound });
}));

app.put('/listings/edit/:id', asyncWrap(async (req, res, next) => {
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

        if (!updatedListing) {
            return next(new ExpressError(404, 'Listing Not Found'));
        }

        res.redirect(`/listings/${id}`);
    } catch (err) {
        res.status(500).send(`Error Occurred While Updating: ${err.message}`);
    }
}));

app.get('/listings/:id', asyncWrap(async (req, res, next) => {
    const { id } = req.params;
    const listingFound = await listing.findById(id);
    if (!listingFound) {
        return next(new ExpressError(404, 'Listing Not Found'));
    }
    res.render('hotels', { data: listingFound });
}));

app.delete('/listings/:id', asyncWrap(async (req, res, next) => {
    const { id } = req.params;
    try {
        await listing.findByIdAndDelete(id);
        res.redirect('/listings');
    } catch (err) {
        res.status(500).send(`Error Occurred While Deleting: ${err.message}`);
    }
}));

app.get('/testing', asyncWrap(async (req, res) => {
    try {
        await listing.deleteMany({});
        await listing.insertMany(data);
        res.status(200).send('Entries successfully saved');
    } catch (err) {
        res.status(500).send(`An error occurred while saving the entries: ${err.message}`);
    }
}));

app.get('/', (req, res) => {
    res.send('Welcome to Stay & Enjoy!');
});

//--------------------------------- Error Handling Middleware ---------------------------------//

// app.all('*', (req, res, next) => {
//     next(new ExpressError(404, 'Page Not Found'));
// });

app.use((err, req, res, next) => {
    const { statusCode = 500, message } = err;
    console.error('Error Occurred:', err);
    res.render('error', {message});
});

//--------------------------------- Start the Server ---------------------------------//

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

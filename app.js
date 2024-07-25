//------------------------------- Importing Libraries and defining them ----------------------//

//adding the required tools / library
const express = require('express');
const mongoose = require('mongoose');
const listing = require('./models/staynenjoy_schema'); //for testing and making schema mainly
const { data: data } = require('./models/random_gen_data/data');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
require('dotenv').config();
const PORT = 3000;

// ------------------------------------rules---------------------------------------------
 
const app = express();  
app.set('view engine', 'ejs');
app.set('trust proxy', true);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '/views/public')))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

//---------------------------- Establishing Mongo Connection ------------------------------

// 1) defining asynchronous function to establish the mongo server
const MONGO_URL = process.env.MONGO_URL;
const main = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
  }
};

// 2) calling the asynchronous function to connect to database
main();

//----------------------------------- Routes ---------------------------------------------//

app.use((req, res, next) => {
    req.time = new Date(Date.now()).toDateString();
    const ip = req.ip; // Express handles this well with trust proxy
    console.log(req.method, req.hostname, req.path, req.time, ip);
    next();
});

// Defining routes and the logic
app.get('/', (req, res) => {
    res.send("Server is running Successfully");
});

app.get('/listings', async (req, res) => {
    const alllisting = await listing.find({});
    res.render('main', { data: alllisting });
});

app.get('/listings/new', (req, res) => {
    res.render('new_listings');
});

app.post('/listings/new', async (req, res) => {
    try {
        const data = req.body.listing;
        console.log(data);
        const newListing = await listing.create(data);
        res.redirect('/listings');
    } catch (err) {
        res.status(500).send("Error Occurred While Storing: " + err.message);
    }
});

app.put('/listings/edit/:id', async (req, res) => {
    const id = req.params.id;
    const { title, description, image_url, price, location, country } = req.body;

    try {
        const updatedListing = await listing.findByIdAndUpdate(id, {
            title,
            description,
            image: { url: image_url },  // Update the nested image URL
            price,
            location,
            country
        }, { new: true });  // Return the updated document

        console.log(updatedListing);
        res.redirect(`/listings/${id}`);  // Redirect to the updated listing's page
    } catch (err) {
        res.status(500).send("Error Occurred While Updating: " + err.message);
    }
});

app.get('/listings/edit/:id', async (req, res) => {
    const id = req.params.id;
    console.log(`/listings/edit/${id}`);
    const listing_found = await listing.findById(id);
    res.render('edit_hotels', { data: listing_found });
});

app.delete('/listings/:id', async (req, res) => {
    const id = req.params.id;  // Correctly access the id from req.params
    console.log(`id to be deleted is ${id}`);

    try {
        await listing.findByIdAndDelete(id);  // Delete the listing by ID
        res.redirect('/listings');  // Redirect to the listings page
    } catch (err) {
        res.status(500).send("Error Occurred While Deleting: " + err.message);
    }
});

app.get('/listings/:id', async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const listing_found = await listing.findById(id);
    console.log(listing_found);
    res.render('hotels', { data: listing_found });
});

// Adding data to the database / for testing or can be used to debug here
app.get('/testing', async (req, res) => {
    try {
        // First, clear the collection
        await listing.deleteMany({});

        // Then, insert new data
        await listing.insertMany(data);
        
        console.log("Successfully saved");
        res.status(200).send("Entries successfully saved");
    } catch (err) {
        console.error("Error saving entries", err);
        res.status(500).send("An error occurred while saving the entries");
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.log("Error Occurred", err);
    res.status(err.status || 500).send("An error occurred: " + err.message);
});

// Catch-all route for undefined routes
app.use((req, res) => {
    res.status(404).send("Sorry, we can't find that!");
});

// Running the server on port 3000
app.listen(PORT, () => {
    console.log(`Server Running on ${PORT} port`);
});

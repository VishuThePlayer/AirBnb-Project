//--------------------------------- Importing Libraries and Defining Constants ---------------------------------//

const express = require('express');
const mongoose = require('mongoose');
const listing = require('./models/staynenjoy_schema'); // Ensure this path is correct
const { data } = require('./models/random_gen_data/data'); // Ensure this path is correct
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const reviewSchema = require('./models/reviewSchema');
require('dotenv').config();
const PORT = 3000;
const MONGO_URL = process.env.MONGO_URL;
const listingsRouter = require('./routes/listings');
const reviewsRouter = require('./routes/reviews');
const userRouter = require("./routes/user");
const session = require('express-session'); //implements session
const flash = require('connect-flash'); //flash cards for errors
const passport = require('passport');
const passportlocal = require('passport-local');
const userSchema = require("./models/userSchema")
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

//--------------------------------- Routes ---------------------------------//

function asyncWrap(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

const sessionsSetting = {
    secret : 'secretcodeisyash',
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:  7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}

app.use(session(sessionsSetting));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportlocal(userSchema.authenticate()));

passport.serializeUser(userSchema.serializeUser());
passport.deserializeUser(userSchema.deserializeUser());

app.use((req, res, next) => {
    res.locals.Success = req.flash('Success');
    res.locals.error = req.flash('error');
    res.locals.req = req;
    res.locals.currUser = req.user;
    next();
})


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

app.use('/listings', listingsRouter);
app.use('/listings/:id/review', reviewsRouter);
app.use('/', userRouter);

app.get('/demouser', async(req, res) => {
    let fakeUser = new userSchema({
        email: "vishubissa.s@gmail.com",
        username: "Vishu",
    });

    let registeredUser = await userSchema.register(fakeUser, "Hello World");
    res.send(registeredUser);
})

app.get('/testing', asyncWrap(async (req, res) => {
    try {
        await listing.deleteMany({});
        await reviewSchema.deleteMany({});
        let updatedData = data.map((obj) => ({...obj, owner: "66c38bcba715cdf95ba727e7"}));
        let result = await listing.insertMany(updatedData);
        res.status(200).send(result);
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

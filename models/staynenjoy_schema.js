const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const reviewSchema = require('./reviewSchema')

const StayNJoySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        url: String,
        filename: String,
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "review"
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

StayNJoySchema.pre('findOneAndDelete', function (next) {
    console.log("Starting Deletion Process");
    next();
});

// Post-hook for findOneAndDelete
StayNJoySchema.post('findOneAndDelete', async function (doc) {
    if (doc && doc.reviews && doc.reviews.length) {
        try {
            await reviewSchema.deleteMany({
                _id: { $in: doc.reviews }
            });
            console.log("Deleted reviews:", doc.reviews);
        } catch (err) {
            console.error("Error deleting reviews:", err);
        }
    }
});

// Create the model from the schema
const StayNJoy = model('StayNJoy', StayNJoySchema);

// Export the model
module.exports = StayNJoy;
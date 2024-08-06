const mongoose = require('mongoose');
const { Schema, model } = mongoose;

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
        filename: {
            type: String,
            default: "default.jpg",
            set: (v) => v === "" ? "default.jpg" : v
        },
        url: {
            type: String,
                default: "",
            set: (v) => v === "" ? "https://media.cntraveller.in/wp-content/uploads/2017/02/1-alsisar-haveli-866x649.jpg" : v
        }
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
    }]
});


// Create the model from the schema
const StayNJoy = model('StayNJoy', StayNJoySchema);

StayNJoySchema.pre('findOneAndDelete', async function (next) {
    console.log("Starting Deletion Process");
    next();  // Ensure to call next() to proceed with the deletion process
});

StayNJoySchema.post('findOneAndDelete', async function (doc) {
    console.log("Deletion Process Completed");
    setTimeout(async () => {
        if (doc.reviews && doc.reviews.length) {
            try {
                let res = await reviews.deleteMany({
                    _id: { $in: doc.reviews }
                });
                console.log("Deleted orders:", res);
            } catch (err) {
                console.error("Error deleting orders:", err);
            }
        }
    }, 2000);
});

// Export the model
module.exports = StayNJoy;

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
    }
});


// Create the model from the schema
const StayNJoy = model('StayNJoy', StayNJoySchema);

// Export the model
module.exports = StayNJoy;

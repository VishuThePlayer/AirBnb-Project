const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const reviewSchemamodel = Schema({
    comment: String,
    rating: {
        min: 1,
        max: 5,
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

const reviewSchema = model('review', reviewSchemamodel);

module.exports = reviewSchema;
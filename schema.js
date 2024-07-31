const Joi = require('joi');
const { ObjectId } = require('mongodb');

const SchemaList = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required(),
        image: Joi.object({
            url: Joi.string().required().allow("",null),
            name: Joi.string(),
        }),
        location: Joi.string().required(),
        country: Joi.string().required(),
    }).required()
});

module.exports = SchemaList;

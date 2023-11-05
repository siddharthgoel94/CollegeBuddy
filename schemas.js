const Joi=require('joi');
module.exports.opportunitySchema=Joi.object({
    opportunity: Joi.object({
        title: Joi.string().required(),
        link: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string()
    }).required()
})

module.exports.commentSchema=Joi.object({
    comment:Joi.object({
        rating:Joi.number().required(),
        body:Joi.string().required()
    }).required()
});
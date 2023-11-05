const mongoose=require('mongoose');
const { opportunitySchemadSchema } = require('../schemas');
const Schema=mongoose.Schema;
const Comment=require('./comments');

const OpportunitySchema= new Schema({
    title:String,
    description:String,
    location:String,
    link:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    
    //one to many relationship
    comments:[
        {
            type:Schema.Types.ObjectId,
            ref:"Comment"
        }
    ]
});

//mongoose middleware for cascade dlete of reviews
OpportunitySchema.post('findOneAndDelete',async function(doc){
    if(doc){
        await Review.deleteMany({ _id: {$in :doc.reviews}});
    }
})

module.exports=new mongoose.model('Opportunity',OpportunitySchema);
const mongoose=require('mongoose');
const passport=require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema=mongoose.Schema;

const ListingSchema=new Schema({

    category:{
        type:String,
        enum:['Hackathon',"Project","Study Group"],
        required:true
    },
    skillSetReq:{
        type:[{
            type:String
        }]

    },
    skillSetHave:{
        type:[
            {type:String}
        ]
    },
    title:{
        type:String,
        required:true,

    },
    description:{
        type:String,
        required:true
    },
    author:{
            type:Schema.Types.ObjectId,
            ref:"UserSchema"
    },
    vacancy:{
        type:Number
        // required:true
    },
    requestArr:{
        type:[
            {type:Schema.Types.ObjectId,
            ref:"UserSchema"}
        ]
    },
    acceptedArr:{
        type:[
            {type:Schema.Types.ObjectId,
            ref:"UserSchema"}
        ]
    },
    isActive:{
        type:Boolean,
        required:true,
        default:1
    }



});
// userSchema.plugin(passportLocalMongoose)
module.exports=mongoose.model("ListingSchema",ListingSchema);

//category
    //description
    // skill set required
    // skill set we have
    // title
    // ref to user
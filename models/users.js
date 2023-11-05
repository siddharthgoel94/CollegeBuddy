const mongoose=require('mongoose');
const passport=require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema=mongoose.Schema;
const userSchema= new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,    
        required:true,
        unique:true
    },
    
    college:{
        type:String,    
        required:true
       
    },
    linkedinUrl:{
        type:String,    
        required:true,
        unique:true
    },
    contact:{
        type:String,    
        required:true
    },
    username:{
        type:String,    
        required:true
    },
    description:{
        type:String,    
        required:true
        
    },
    link1:{
        type:String
    },
    link2:{
        type:String
    },
    year:{
        type:String,
        enum:['1','2','3','4','5']
    },
    course:{
        type:String,
        enum:['B.Tech','M.Tech','BBA','MBA','B.Des','M.Sc','B.Sc','B.Comm']

    },
    branch:{
        type:String
    },
    skillSet:{
        type:[
            {
                type:String
            }
        ]
    },
    listings:[
        {
        type:Schema.Types.ObjectId,
        ref:"ListingSchema"

    }
]

})
userSchema.plugin(passportLocalMongoose)
module.exports=mongoose.model("UserSchema",userSchema)
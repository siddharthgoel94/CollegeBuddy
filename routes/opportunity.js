const express=require("express");
const router=express.Router();
const catchAsync=require('../utils/catchAsync');
const ExpressError=require('../utils/ExpressError');
const Opportunity= require('../models/opportunity');
const {opportunitySchema}=require('../schemas.js');
const flash=require("connect-flash");
const { isLoggedIn } = require("../middleware");

//requie all app components and change their paths

const validateOpportunity=(req,res,next)=>{
    //middleware format req,res,next
    const result=opportunitySchema.validate(req.body);
    console.log(result);
    if(result.error){
        throw new ExpressError(result.error,400);
        // return res.send("ERROR");
    }else{
        next();
    }
}

router.get('/', catchAsync(async(req,res)=>{
    const opportunity= await Opportunity.find({});
    res.render('opportunity/index',{opportunity});
}));

router.get('/new', isLoggedIn,(req,res)=>{
    res.render('opportunity/new');
})

router.post('/',isLoggedIn,validateOpportunity,catchAsync(async (req,res)=>{
    //parse req.body 
    // {"campground":{"title":"hvs","location":"sjs"}}
    const opportunity=await new Opportunity(req.body.opportunity);
    await opportunity.save();
    req.flash('success','Successfully made a new opportunity!');
    res.redirect(`/opportunity/${opportunity._id}`);
}));



//new route before id
router.get('/:id', catchAsync(async(req,res)=>{
    const opportunity=await Opportunity.findById(req.params.id).populate('comments').populate('author');
    // console.log(campground);
    if(!opportunity){
        req.flash("error","Cannot find that opportunity");
        return res.redirect("/opportunity");
    }
    res.render('opportunity/show',{opportunity});
}));

router.get('/:id/edit',isLoggedIn,catchAsync(async(req,res)=>{
    const opportunity=await Opportunity.findById(req.params.id);
    console.log(opportunity);
    res.render('opportunity/edit',{opportunity});
}))

//method override for put patch request
//method in qeury string _method
router.put('/:id',isLoggedIn,validateOpportunity,catchAsync(async(req,res)=>{
    const {id}=req.params;
    const opportunity=await Opportunity.findByIdAndUpdate(id,{...req.body.opportunity});
    req.flash('success','Successfully updated opportunity!');
    res.redirect(`/opportunity/${opportunity._id}`);
}))

router.delete('/:id',isLoggedIn,catchAsync(async(req,res)=>{
    const {id}=req.params;
    await Opportunity.findByIdAndDelete(id);
    req.flash('success','Successfully deleted opportunity!');
    res.redirect('/opportunity');
}))

//export is necessary to use it in another file
module.exports=router;

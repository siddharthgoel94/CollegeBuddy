const express=require("express");
const router=express.Router({mergeParams:true});
const catchAsync=require('../utils/catchAsync.js');
const Opportunity= require('../models/opportunity.js');
const Comment=require('../models/comments.js');

const {commentSchema}=require('../schemas.js')

const validateComment=(req,res,next)=>{
    const result=commentSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(result.error,400);
    }else{
        next();
    }
}

router.post('/',validateComment,catchAsync(async(req,res)=>{
    const opportunity=await Opportunity.findById(req.params.id);
    const comment=new Comment(req.body.comment);
    opportunity.comments.push(comment);
    await opportunity.save();
    await comment.save();
    req.flash("success","Created new comment");
    res.redirect(`/opportunity/${opportunity._id}`);
}))

router.delete('/:commentId',catchAsync(async(req,res)=>{
    const{id,commentId}=req.params;
    await Opportunity.findByIdAndUpdate(id,{$pull:{comments:commentId}});
    await Comment.findByIdAndDelete(commentId);
    req.flash("success","Successfully deleted comment");
    res.redirect(`/opportunity/${id}`);
}))

module.exports=router;
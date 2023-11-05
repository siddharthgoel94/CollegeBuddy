module.exports=func=>{
    return (req,res,next)=>{
        console.log("catch async is called");
        func(req,res,next).catch(next);
    }
}


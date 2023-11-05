module.exports.isLoggedIn =(req,res,next)=>{
    if(!req.isAuthenticated()){
        //store requested URL for Return Back fuctionality
        // req.session.returnTo=req.originalUrl;
        req.flash('error','you must be signed in!');
        return res.redirect('/login');
    }
    next();
}
const express = require("express"); //done
const bodyParser = require("body-parser"); //done
const mongoose = require("mongoose"); //done
const ejs = require("ejs"); //done
const passport = require("passport"); //done
const passportLocalMongoose = require("passport-local-mongoose"); //done
const ejsMate = require("ejs-mate"); //done
const LocalStrategy = require("passport-local");
const path = require("path");
const UserSchema=require('./models/users')
const session = require("express-session"); //done
const ListingSchema=require('./models/listing');
const MethodOverride=require('method-override');
const catchAsync=require('./utils/catchAsync');
const ExpressError=require('./utils/ExpressError');
// const { log } = require("console");

const app = express();
app.use(
  session({
    secret: "thisisasecret",
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
  })
);
// passport initializations
passport.use(UserSchema.createStrategy());
passport.use(new LocalStrategy(UserSchema.authenticate()));


passport.serializeUser(UserSchema.serializeUser());
passport.deserializeUser(UserSchema.deserializeUser());
app.use(passport.session());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname,'public')));

app.engine("ejs", ejsMate);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(MethodOverride('_method'));


app.use(express.static("public"));
// useUnifiedTopology: true;

// the isLoggedIn middleware
const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.redirect('/login')
  } else {
    next();
  }
};

// This middleware would store the user in locals
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// connecting database

mongoose.connect(
    "mongodb+srv://siddharthgoel2105:sidd2105@cluster0.jmer3iz.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  );
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connectioon error:"));
  db.once("open", () => { 
    console.log("Database connected");
  });

  app.listen(3000, function () {
    console.log("Server started on port 3000");
  });

  app.get('/',(req,res)=>{
    // console.log(res.locals);
    res.render('home');
  })

  app.get('/listings',async(req,res)=>{
    // console.log(req.query);
    let {category, skillSetReq}=req.query;
    if(!category) category="All";
    if(!skillSetReq) skillSetReq="NA";
    const obj={};
    if(category!="All")obj.category=category;
    if(skillSetReq!="NA") obj.skillSetReq=skillSetReq;
    let listings=await ListingSchema.find().populate('author');
    console.log(obj);
    // console.log(listings);
    if(obj.skillSetReq){
    listings=listings.filter((list)=>{
      let arr=list.skillSetReq;
      // let count=0;
      console.log("inside filter");
      for(let i=0;i<arr.length;i++){
        let flag=false;
        
        for(let j=0;j<skillSetReq.length;j++){
          if(arr[i]==skillSetReq[j]) flag=true;
        }
        // if(flag) count++;
        if(!flag) return false;
      }

      // if(count>=arr.length())return true;
      // else return false;
      return true;
    })

    }
    // const newlistings=newListings;
    console.log(listings);
    res.render('listing/index',{listings});
  })

  app.get('/login',(req,res)=>{
    res.render('users/login');  
  })

  app.get('/signup',(req,res)=>{
    res.render('users/signup');
  })

  app.get('/user/:id',async (req,res)=>{
    const {id}= req.params;
    const user=await UserSchema.findById(id);
    // console.log(user);
    //dashboard
    res.render('users/profile',{user});
  })

  app.get('/listings/new',(req,res)=>{
    res.render('listing/new');
  })

  app.post('/listings',isLoggedIn ,async(req,res)=>{
    const newlist=await new ListingSchema(req.body.listing);
    // console.log(req.body);
    const user=await UserSchema.findById(res.locals.currentUser._id);
    newlist.author=user;
    
    user.listings.push(newlist);
    // console.log(user);
    await newlist.save();
    await user.save();
    res.redirect(`/listings/${newlist._id}`);
    // return res.redirect('/');
  })

  app.get('/listings/:id',async(req,res)=>{
    const{id}=req.params;
    const listing=await ListingSchema.findById(id).populate('requestArr').populate('author');
    console.log(listing);
    // listing.requestArr.map(async (user_id)=>{
    //     await listing.populate(user_id);
    //   })
    // console.log(listing);
    res.render('listing/show',{listing});
    // console.log(currentUser);
  })

  app.get('/listings/:id/edit',isLoggedIn,async(req,res)=>{
    const {id}=req.params;
    const listing=await ListingSchema.findById(id);
    res.render('listing/edit',{listing});
  })
  app.post("/listings/:id/apply",isLoggedIn,async (req,res)=>{
    const {id}=req.params;
    const list=await ListingSchema.findById(id);
    list.requestArr.push(res.locals.currentUser._id);
    await list.save();
    res.redirect("/listings");
    // res.send(list);
  })
  app.get("/listings/:id/accept/:userId",isLoggedIn,async (req,res)=>{
    const {id,userId}=req.params;
    const list=await ListingSchema.findById(id);
    const index=list.requestArr.indexOf(userId);
    if(list.isActive){
      list.requestArr.splice(index,1);
      list.acceptedArr.push(userId);
      list.vacancy--;
      if(list.vacancy==0){
        list.isActive=0;
      }
      await list.save();
    }
    res.redirect(`/listings/${id}`);
  })
  app.get("/listings/:id/reject/:userId",isLoggedIn,async (req,res)=>{
    const {id,userId}=req.params;
    const list=await ListingSchema.findById(id);
    const index=list.requestArr.indexOf(userId);
    list.requestArr.splice(index,1);
    await list.save();
    res.redirect(`/listings/${id}`);
  })
  app.get('/user/:id/listings',isLoggedIn,async(req,res)=>{
    const {id}=req.params;
    const user=await UserSchema.findById(id).populate({path:"listings"});
    res.render('users/allUserListings',{user});
    
  })
  app.get("/logout", function (req, res) {
    req.logout(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  });

  app.put('/listings/:id',isLoggedIn,async(req,res)=>{
    const {id}=req.params;
    const listing =await ListingSchema.findByIdAndUpdate(id,req.body.listing);
    res.redirect(`/listings/${listing._id}`);
  })

  app.delete('/listings/:id',isLoggedIn,async(req,res)=>{
    const {id}=req.params;
    const list=await ListingSchema.findByIdAndDelete(id);
    const user=await UserSchema.findById(res.locals.currentUser._id);
    // console.log(user.listings);
    const index = user.listings.indexOf(id);
    user.listings.splice(index, 1);
    // console.log(user.listings);
    // console.log(index);
    // console.log(id,"deleted");
    await user.save()
    res.redirect('/listings');
  })

// creating post request to register a user
  app.post("/register", catchAsync(async(req, res) =>{
    // console.log(req.body);
    const {password,password2}=req.body;
    if(password!==password2){
      console.log("The Passwords do not match");
      // return res.redirect("/signup");
      return res.send("Please enter same password in both fields")
    }
try{
    const user = await new UserSchema(req.body.user);
    const newUser = await UserSchema.register(user, req.body.password);
    await newUser.save();
    // req.login(newUser);
    req.login(newUser,(err)=>{
      if(err){
          return next(err);
      }
      res.redirect('/listings');
  })

}catch(e){
  return res.render('error',{e})
}
    // res.redirect("/login");
  }));
  app.post(
    "/login",
    passport.authenticate("local", { failureFlash: false, failureRedirect:'/' }),
    catchAsync(async (req, res) => {
      try{
        const user = await UserSchema.findOne({ username: req.body.username });
      }catch(e){
        return res.render('error',{e})  
      }
     
      // console.log(user);
      // console.log(req.body.username);
      // console.log(req.body.password);
  
      // res.redirect(`new/${user.username}`);
      res.redirect('/')
    }
  ));

  app.get("*",(req,res)=>{
    res.send("error");
  })
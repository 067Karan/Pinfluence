const express = require('express');
const router = express.Router();
const usermodel = require('./users');
const postmodel = require('./post');
const passport = require('passport');
const localStrategy = require('passport-local');
const upload = require('./multer');

passport.use(new localStrategy(usermodel.authenticate()));

router.get("/", (req, res) => {
  res.render("index", { userIsLoggedIn: req.isAuthenticated() });
});


// Sign-in/Login Page
router.get("/login", (req, res) => {
  res.render("login");
});
router.get("/profile", isLoggedIn, async (req, res) => {
  const user = await usermodel.findOne({username:req.session.passport.user}).populate("posts");
  res.render("profile", {user});
});

router.get("/register", (req, res) => {
  res.render("register"); // Render the register view
});

router.get("/add", isLoggedIn, async (req, res) => {
  const user = await usermodel.findOne({username:req.session.passport.user})
  res.render("add" ,{user});
});
router.post("/createpost", upload.single("postimage"), isLoggedIn, async (req, res) => {
  const user = await usermodel.findOne({username:req.session.passport.user});
  const post = await postmodel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

router.get("/show/posts", isLoggedIn, async (req, res) => {
  const user = await usermodel
    .findOne({username:req.session.passport.user})
    .populate("posts")
  console.log("User:", user);
  res.render("show", {user: user});
});
router.get("/feed", isLoggedIn, async (req, res) => {
  const user = await usermodel.findOne({username:req.session.passport.user});
  const posts = await postmodel.find().populate("user")
    res.render("feed",{user,posts});
});
 

router.post("/fileupload", isLoggedIn, upload.single("image"), async (req, res, next) => {
  const user = await usermodel.findOne({ username: req.session.passport.user });
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect("/profile");
});
router.post("/register", (req, res,next) => {
  const data = new usermodel({
    username:req.body.username,
    email:req.body.email,
    name:req.body.fullname
  })
  usermodel.register(data,req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile");
    })
  })
});

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  successRedirect: '/profile'
}));

router.get("/logout" , function (req,res,next) {
  req.logout(function(err){
    if(err) {return next(err) }
    res.redirect('/')
  })
})

router.get("/pages/quotes", async (req, res) => {
  res.render("pages/quotes");
});

router.get("/pages/sports", async (req, res) => {
  res.render("pages/sports");
});

router.get("/pages/fashion", async (req, res) => {
  res.render("pages/fashion");
});

router.get("/pages/weeding", async (req, res) => {
  res.render("pages/weeding");
});

router.get("/pages/tech", async (req, res) => {
  res.render("pages/tech");
});

router.get("/pages/outfit", async (req, res) => {
  res.render("pages/outfit");
});
router.get("/pages/breakfast", async (req, res) => {
 
  res.render("pages/breakfast");
});



function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/")
}

module.exports = router;
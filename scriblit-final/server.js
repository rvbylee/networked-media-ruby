/*********************************************
library imports
*********************************************/
const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const nedb = require("@seald-io/nedb");
/// NEW LIBRARIES FOR TODAY
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const nedbSessionStore = require("nedb-promises-session-store");
const bcrypt = require("bcrypt");

/*********************************************
library configurations:
- setting up express server via app
- setting up how the parser interprets data
- setting up where multer stores images
- setting up database files
*********************************************/
const app = express();
const urlEncodedParser = bodyParser.urlencoded({ extended: true });
const upload = multer({
  dest: "public/uploads",
});

let database = new nedb({
  filename: "database.txt",
  autoload: true,
});

// user database (accounts)
let userdb = new nedb({
  filename: "userdb.txt",
  autoload: true,
});

//// NEW LIBRARY CONFIGURATIONS
app.use(cookieParser());

// setting up the session db creation
const nedbSessionInit = nedbSessionStore({
  connect: expressSession,
  filename: "sessions.txt",
});

// linking app to use session db
app.use(
  expressSession({
    store: nedbSessionInit,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365, // after a year, delete the session
    },
    secret: "thisismysecretkey",
  })
);

/*********************************************
middleware setup
*********************************************/
app.use(express.static("public"));
app.use(urlEncodedParser);
app.set("view engine", "ejs");

/*********************************************
scriblit word-of-the-day setup
*********************************************/
const words = [
  "the thing standing in my room during sleep paralysis",
  "friend: whats the big idea? the big idea",
  "grandma at a rave",
  "monster under the bed",
  "my art professor looking at my 'piece'",
  "friend: whats the problem? the problem",
  "what the last potato chip in the bag sees",
  "dad at coachella",
  "librarian at a mosh pit",
  "how my parents got to school",
  "what heaven actually looks like",
  "cat judging you across the room",
  "fish forgetting how to swim",
  "fish in a suit",
  "sandwich",
  "pizza in love",
];

// pick a new word daily based on the day of the year
function getWordOfTheDay() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / 86400000
  );
  const index = dayOfYear % words.length;
  return words[index];
}

/*********************************************
ROUTES: determining what locations are accessible via URL
*********************************************/

// landing page: first thing people see
app.get("/", (req, res) => {
  res.render("landing.ejs");
});

// home / explore page all scribbles for today's word
app.get("/home", (req, res) => {
  const word = getWordOfTheDay();
  let query = { word: word };

  database
    .find(query)
    .sort({ timestamp: -1 })   // newest post first
    .exec((err, data) => {
      let templateData = {
        wordOfTheDay: word,
        allPosts: data,
        loggedInUser: req.session.loggedInUser || null,
      };
      res.render("index.ejs", templateData);
    });
});

// submission page p5 canvas and form
app.get("/submit", (req, res) => {
  res.render("submit.ejs");
});

// handle image upload and new submission
app.post("/submit", upload.single("artwork"), (req, res) => {
  console.log("received upload");
  const word = getWordOfTheDay();
  let currentDate = new Date();

  let newPost = {
    artist: req.body.artist,
    caption: req.body.caption,
    word: word,
    date: currentDate.toLocaleString(),
    timestamp: currentDate.getTime(),
    likes: 0,
  };

  // attach username if someone is logged in
  if (req.session && req.session.loggedInUser) {
    newPost.username = req.session.loggedInUser.username;
  }

  // attach the p5 canvas image file 
  if (req.file) {
    console.log("file uploaded:", req.file.filename);
    newPost.image = "/uploads/" + req.file.filename;
  } else {
    console.log("no file uploaded");
  }

  database.insert(newPost, (err, insertedData) => {
    console.log(insertedData);
    res.redirect("/home");
  });
});

//group all submissions by word
app.get("/my-archive", (req, res) => {
  if (!req.session || !req.session.loggedInUser) {
    return res.redirect("/login");
  }

  const username = req.session.loggedInUser.username;
  let query = { username: username };

  database
    .find(query)
    .sort({ timestamp: -1 })    
    .exec((err, data) => {
      const grouped = {};

      data.forEach((post) => {
        if (!grouped[post.word]) grouped[post.word] = [];
        grouped[post.word].push(post);
      });

      res.render("archive.ejs", { grouped });
    });
});


// like unlike a post one per post 
app.post("/like", function (req, res) {
  let postId = req.body.postId;
  let query = { _id: postId };

  // if this user already liked the post, unlike it
  if (req.cookies[postId] === "liked") {
    let update = { $inc: { likes: -1 } };

    res.clearCookie(postId);

    database.update(query, update, {}, function (err, numUpdated) {
      if (err) {
        console.log("error decrementing like", err);
      }
      // go back to the specific post on the page
      res.redirect("/home#" + postId);
    });
  } else {
    // otherwise like the post
    let update = { $inc: { likes: 1 } };

    res.cookie(postId, "liked", {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    });

    database.update(query, update, {}, function (err, numUpdated) {
      if (err) {
        console.log("error incrementing like", err);
      }
      res.redirect("/home#" + postId);
    });
  }
});

/////////////////////////////////////////////////
//        add new routes below this line!      //
/////////////////////////////////////////////////

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/signup", upload.single("profilePicture"), (req, res) => {
  let hashedPassword = bcrypt.hashSync(req.body.password, 10);

  let newUser = {
    username: req.body.username,
    fullname: req.body.fullname,
    password: hashedPassword,
  };

  // store profile picture path if one was uploaded
  if (req.file) {
    newUser.profilePic = "/uploads/" + req.file.filename;
  }

  userdb.insert(newUser, (err, insertedData) => {
    res.redirect("/login");
  });
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/authenticate", (req, res) => {
  let loginAttempt = {
    username: req.body.username,
    password: req.body.password,
  };

  let searchUser = {
    username: loginAttempt.username,
  };

  userdb.findOne(searchUser, (err, foundUser) => {
    if (foundUser == null || err) {
      console.log("username not found");
      res.redirect("/login?user=null");
    } else {
      let encPass = foundUser.password;
      if (bcrypt.compareSync(loginAttempt.password, encPass)) {
        let session = req.session;
        // store full user info in the session
        session.loggedInUser = {
          username: foundUser.username,
          fullname: foundUser.fullname,
          profilePic: foundUser.profilePic,
        };
        res.redirect("/home");
      } else {
        res.redirect("/login?password=invalid");
      }
    }
  });
});


// logout clear session
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

/*********************************************
server listener for when requests are made 
to the server
- we don't really need to modify this
- needs to go at the end
*********************************************/
app.listen(4000, () => {
  console.log("Scriblit running at http://localhost:4000");
});


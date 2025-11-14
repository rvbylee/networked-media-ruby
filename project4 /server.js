const express = require("express");
// added body parser and nedb libraries
const bodyParser = require("body-parser");
const multer = require('multer')
const nedb = require("@seald-io/nedb");

const app = express();

app.use(express.static("public"));
// adding middleware to be able to parse body data from the fetch requests
app.use(bodyParser.json());
const uploadProcessor = multer( {dest: 'assets/upload/' })
const encodedParser = bodyParser.urlencoded( {extended: true });
app.use(encodedParser)

// setting view engine
app.set('view engine', 'ejs')

// set up the database file
const database = new nedb({
  filename: "database.txt",
  autoload: true,
});

// route to get the /add url
// this renders the form.ejs
app.get('/add', (req, res)=>{

  let query = {}  // give us everything in db
  let sortQuery = {
    timestamp: -1  // sorts in reverse-chronological order
  }
  database.find(query).sort(sortQuery).exec( (err, dataInDB)=>{
    console.log(dataInDB)
    if(err){
      res.render('form.ejs', {})
    }
    res.render('form.ejs', { posts: dataInDB })
  })
})

app.post('/post', uploadProcessor.single('image'), (req, res)=>{
  let currentTime = new Date()

  console.log(req.body)

  let postToBeAddedToDB = {
    date: currentTime.toLocaleString(),
    text: req.body.text,
    timestamp: currentTime.getTime()
  }

  // insert the data into the db
  database.insert(postToBeAddedToDB, (err, dataThatHasBeenAdded)=>{
    if(err){
      console.log(err)
      res.redirect('/add')
    } else {
      console.log(dataThatHasBeenAdded)
      res.redirect('/add')
    }
  })
})

app.get("/all-posts", (req, res) => {
  // let allPosts = [
  //     {text: "post 1"},
  //     {text: "post 2"},
  //     {text: "post 3"},
  // ]

  let query = {}; // this is empty because we don't want to get any specific thing

  database.find(query).exec((err, data) => {
    // send data back as json
    res.json({ posts: data });
  });
});

app.listen(7001, () => {
  console.log("server running on http://127.0.0.1:7001");
});
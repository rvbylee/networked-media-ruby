const express = require('express')
const parser = require('body-parser')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const app = express()
const encodedParser = parser.urlencoded({ extended: true })


app.use(express.static('public'))            
app.use(encodedParser)                       
app.set('view engine', 'ejs')                

//multer
const uploadProcessor = multer({ dest: 'public/uploads/' })


const DATA_PATH = path.join(__dirname, 'data.json')
if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, '[]') 
let submissions = JSON.parse(fs.readFileSync(DATA_PATH))          

//word of the day cycle
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
  "pizza in love"
]

// pick a new word daily based on the day of the year and then divide by length and remainder picks
function getWordOfTheDay() {
  const today = new Date()
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000)
  const index = dayOfYear % words.length
  return words[index]
}


app.get('/', (req, res) => {
  const word = getWordOfTheDay()
  const todaysPosts = submissions.filter(p => p.word === word)

  const data = {
    wordOfTheDay: word,
    allPosts: todaysPosts
  }

  res.render('index.ejs', data)
})

// submission 
app.get('/submit', (req, res) => {
  res.render('submit.ejs')
})

app.post('/submit', uploadProcessor.single('artwork'), (req, res) => {
  console.log('recieved upload')
  const word = getWordOfTheDay()
  
  const newPost = {
    artist: req.body.artist,
    caption: req.body.caption,
    word: word,
    date: new Date().toLocaleString()
  }
  if (req.file) {
    console.log('file uploaded:', req.file.filename)
    newPost.image = '/uploads/' + req.file.filename
  } else {
    console.log('no file uploaded')
  }

  // newest on top
  submissions.unshift(newPost)

  
  fs.writeFileSync(DATA_PATH, JSON.stringify(submissions, null, 2))


  res.redirect('/?t=' + Date.now()) // cache-busting query so image loads immediately
})

// archive
app.get('/archive', (req, res) => {
  const grouped = {}
  submissions.forEach(post => {
    if (!grouped[post.word]) grouped[post.word] = []
    grouped[post.word].push(post)
  })

  res.render('archive.ejs', { grouped })
})


app.listen(3000, () => {
  console.log('Word Canvas running at http://localhost:3000')
})

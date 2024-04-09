import express from 'express';
import path from 'path';
import fs from 'fs';
import {MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import multer from 'multer';
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import bodyParser from 'body-parser'
import mongoose from 'mongoose';
import Customer from './customerModel.js';
dotenv.config()

const jsonParser = bodyParser.json()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)
console.log(__dirname);

const app = express()
const port = 8000
app.use(express.json());
//here is a change
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../build')));

app.use(express.static(path.join(__dirname, '../posters')));
//app.use(express.static("posters"));

const upload = multer({ dest: 'posters/' })

app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'))
});

// const movieData = JSON.parse(fs.readFileSync('./movies.json'));
// console.log(movieData);
// let movieData = [
//     {"title":"Terminator 2"},
//     {"title":"Rocky IV"},
//     {"title":"Titanic"},
//     {"title":"Die Hard"}
// ];

// Connect to MongoDB
mongoose.connect(process.env.MONGO_CONNECT, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

app.get('/api/movies', async (req, res) => {
  
  //res.json(movieData)
  const client = new MongoClient(process.env.MONGO_CONNECT);
  
  await client.connect();

  const db = client.db('movie');

  const movieData = await db.collection('reviews').find({}).toArray();
  console.log(movieData);
  res.json(movieData);
})

// Add a new route to the backend which uses the mongoose connection named /api/addInfo. This route will accept json data called movies.json and save it to a collection named “Infos” using mongoose.
app.post('/api/addInfo', async (req, res) => {
  try {
    const { name, movie, email } = req.body;

    // Validate email presence
    if (!email) {
      return res.status(206).json({ error: '206 error: Email is required' });
    }

    const customer = new Customer({ name, movie, email });
    await customer.save();

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});


app.post('/api/removeMovie', async (req, res) => {
   console.log(req.body.title);
   
   const client = new MongoClient(process.env.MONGO_CONNECT);
   await client.connect();

   const db = client.db('movies');
   const result = await db.collection('reviews').deleteOne({ title: req.body.title})
  
   res.sendStatus(200);
})

app.post('/api/overwrite', jsonParser, async (req, res) => {
  const client = new MongoClient(process.env.MONGO_CONNECT);
  await client.connect();

  const db = client.db('movies');

  //console.log(req.body);
  /*for( let index in req.body ) {
    console.log(req.body[index].title + " " + req.body[index].poster);
  }*/

  const deleteResult = await db.collection('reviews').deleteMany({});
  console.log('Deleted documents =>', deleteResult);

  const insertResult = await db.collection('reviews').insertMany(req.body);
  console.log('Inserted documents =>', insertResult);

  res.sendStatus(200);


})

app.post('/api/review', upload.single('movie_poster'),  async (req,res) => {
  const client = new MongoClient(process.env.MONGO_CONNECT);
  await client.connect();

  const db = client.db('movies');


  const insertOperation = await db.collection('reviews').insertOne( {'title':req.body.title, 'poster':req.file.filename});
  console.log(insertOperation);
  res.redirect('/');

    /*movieData.push( { "title":req.body.title })
    saveData();
    console.log("update movies called");
    console.log(req.body);
    res.redirect('/');*/
})


const saveData = () => {
  const jsonContent = JSON.stringify(movieData);
  fs.writeFile("./movies.json", jsonContent, 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
    }
    console.log("JSON file has been saved.");
  });
}



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

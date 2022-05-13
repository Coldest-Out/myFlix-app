const mongoose = require('mongoose');
const Models = require('./models.js')
  express = require('express');
  bodyParser = require('body-parser');
  morgan = require('morgan');
  fs = require('fs');
  path = require('path');

const Movies = Models.Movie;
const Users = Models.User;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });


//middleware | logging
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.static('public'));

app.get('/', (_req, res) => {
  res.send('Welcome to the myFlix App!');
});

//Gets list of all movies
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/documentation', (_req, res) => {
  res.sendfile(_dirname + '/public/documentation.html');
});

//Gets the list of data/details about movies (titles)
app.get('/movies/:title', (req, res) => {
  Movies.findOne({ Title: req.params.title }).then((movie) => {
    if (movie) {
      res.status(200).json(movie);
    } else {
      res.status(400).send('Movie not Found');
    }
  });
});

//Gets the data about movies genre
app.get('/movies/genre/:title', (req, res) => {
  Movies.findOne({ Title: req.params.title }).then((movie) => {
    if (movie) {
      res.status(200).send(`${req.params.title} is a ${movie.Genre.Name}`)
    } else {
      res.status(400).send('Movie not Found');
    }
  });
});

//Gets Directors name of movie
app.get('/directors/:name', (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.name }).then((movie) => {
    if (movie) {
      res.status(200).json(movie.Director);
    } else {
      res.status(400).send('Director Not Found');
    }
  });
});

//Allows user to register
/* We`ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
} */
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create ({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) => { res.status(200).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error:' + error);
          })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error:' + error);
    });
});

//Get all users
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Get a user by username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Update a user's info, by username
/* We'll expect JSON in this format
{
  Username: String, (required)
  Password: String, (required)
  Email: String, (required)
  Birthday: Date (required)
} */
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//Allows users to delete movie from favorites
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// Delete a user by username
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).send('something is broken here');
});

app.listen(8080, () => {
  console.log('listening on port 8080')
});

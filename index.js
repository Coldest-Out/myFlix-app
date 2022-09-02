const mongoose = require('mongoose');
const Models = require('./models.js')
express = require('express');
bodyParser = require('body-parser');
morgan = require('morgan');
fs = require('fs');
path = require('path');
const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');

//let allowedOrigins = ['http://localhost:52929', 'https://cold-myflix-app.herokuapp.com', 'http://localhost:62802/', 'http://localhost:60417'];

/* app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { //If a specific origin isn't found on the list of allowed origins
      let message = 'The CORS policy for this application does not allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
})); */
app.use(cors());

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })

mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });


//middleware | logging
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.static('public'));

app.get('/', (_req, res) => {
  res.send('Welcome to the myFlix App!');
});

/**
 * API GET Endpoint. ('/movies')
 * Retrieves the list of all the movies found in the database.
 * @function [path]/movies
 * @returns {Object[]} movies
 * @requires token
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * API GET Endpoint ('/documentation')
 * Retrieves the documentation that presents all the endpoints
 * Shows what format is accepted to receive
 * Shows the databases response
 */
app.get('/documentation', (_req, res) => {
  res.sendfile(_dirname + '/public/documentation.html');
});

/**
 * API GET Endpoint ('/movies/:title')
 * Retrieves a specific movies details depending on the movie selected
 * @function [path]/movies/:title
 * @param title
 * @returns {Object} movie
 * @requires token
 */
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.title }).then((movie) => {
    if (movie) {
      res.status(200).json(movie);
    } else {
      res.status(404).send('Movie not Found');
    }
  });
});

/**
 * API GET Endpoint ('/movies/genres/:title')
 * Retrieves a specific movie's genre by the movies title
 * Gives details about the specific genre
 * @function [path]/movies/genres/:title
 * @param movie_title
 * @returns {Object} genre
 * @requires token
 */
app.get('/movies/genres/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.title }).then((movie) => {
    if (movie) {
      res.status(200).send(`${req.params.title} is a ${movie.Genre.Name}`)
    } else {
      res.status(404).send('Movie not Found');
    }
  });
});

/**
 * API GET Endpoint ('/directors/:name')
 * Retrieves details about a director by their name
 * @function [path]/directors/:name
 * @param director_id
 * @returns {Object} director
 * @requires token
 */
app.get('/directors/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.name }).then((movie) => {
    if (movie) {
      res.status(200).json(movie.Director);
    } else {
      res.status(404).send('Director Not Found');
    }
  });
});

/**
 * API POST Endpoint ('/register')
 * Allows users to register and create an account
 * @function [path]/register
 * @param {JSON} data from registration form
 * @returns user object
 */
app.post('/register',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
    // Birthday Validation
    //check('Birthday', 'Please enter a birthday before todays date.').custom((value, { req }) => value <= new Date().getTime())
  ], (req, res) => {

    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    //Hash any password when registering and storing it in the MongoDB database
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
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

/**
 * API GET Endpoint ('/users')
 * Retrieves a list of all users within the application/database
 * @function [path]/users
 * @param {string} username
 * @returns {Object[]} users 
 */
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(404).send('Error: ' + err);
    });
});

/**
 * API GET Endpoint ('/users/:Username')
 * Retrieves data of a specific user by their username
 * @function [path]/users/:username
 * @param {string} username
 * @returns {Object} user
 * @requires passport
 */
app.get(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        if (user) {
          respData = {
            Username: user.Username,
            Email: user.Email,
            Birthday: user.Birthday,
            FavoriteMovies: user.FavoriteMovies,
          };
          res.status(201).json(respData);
        } else {
          res.status(404).send('User Not Found');
        }
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send(`Error: ${error}`);
      });
  }
);


/**
 * API PUT Endpoint ('/users/:Username')
 * Allows users to update their current user information by their username
 * @function [path]/users/:Username
 * @param {string} Username
 * @returns {Object} user with new information
 */
app.put('/users/:Username', [
  check('Username', 'Username is required').isLength({ min: 5 }),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $set:
    {
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  }).then((updatedUser) => {
    if (updatedUser === null) {
      res.status(404).send("no user found");
    } else {
      res.status(201).json(updatedUser)
    }
  })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err)
    });
});

/**
 * API POST Endpoint ('/users/:Username/movies/:MovieID')
 * Allows users to add a movie to their favorite movies list
 * @function [path]/users/:Username/movies/:MovieID
 * @param {string} username
 * @param {any} movieID
 * @returns {any} movieID
 * @requires token
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
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

/**
 * API DELETE Endpoint ('/users/:Username/movies/:MovieID')
 * Allows users to delete a movies from their favorite movies list
 * @function [path]/users/:Username/movies/:MovieID
 * @param {string} username
 * @param {any} movieID
 * @returns {any} movieID
 * @requires token
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
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

/**
 * API DELETE Endpoint ('/users/:Username')
 * Allows users to delete their accounts
 * @function [path]/users/:username
 * @param {string} username
 * @returns {string} success or failure message
 * @requires passport
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});

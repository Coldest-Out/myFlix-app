const mongoose = require('mongoose');
const Models = require('./models.js')
  express = require('express');
  morgan = require('morgan');
  fs = require('fs');
  path = require('path');

const Movies = Models.Movie;
const Users = Models.User;
const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

mongoose.connect('mongodb://localhost:27017/myFlixDB', { userNewUrlParser: true, useUnifiedTopology: true });


/*
//Bonus Task my topMovies
const topMovies = [
  {
    title: 'Silence of the Lambs',
    directors: 'Jonathan Demme',
    stars: ['Jodie Foster', 'Anthony Hopkins', 'Lawrence A. Bonney', 'Kasi Lemmons'],
    genre: 'Drama',
    ratings: 8.6,
  },
  {
    title: 'Interstellar',
    directors: 'Christopher Nolan',
    stars: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Machenzie Foy', 'Ellen Burstyn'],
    genre: 'Sci-Fi',
    ratings: 8.6,
  },
  {
    title: 'The Dark Knight',
    directors: 'Christopher Nolan',
    stars: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine', 'Maggie Gyllenhaal', 'Gary Oldman'],
    genre: 'Action',
    ratings: 9.0,
  },
  {
    title: 'Spirited Away',
    directors: 'Hayao Miyazaki',
    stars: ['Daveigh Chase', 'Suzanne Pleshette', 'Miyu Irino', 'Rumi Hiiragi', 'Mari Natsuki'],
    genre: 'Animation',
    ratings: 8.6,
  },
  {
    title: 'Spider-Man: No Way Home',
    directors: 'Jon Watts',
    stars: ['Tom Holland', 'Zendaya', 'Benedict Cumberbatch', 'Jacob Batalon', 'Andrew Garfield', 'Tobey Maguire'],
    genre: 'Action',
    ratings: 8.4,
  },
  {
    title: 'Inception',
    directors: 'Christopher Nolan',
    stars: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Ken Watanabe', 'Tom Hardy', 'Dileep Rao'],
    genre: 'Thriller',
    ratings: 8.8
  },
  {
    title: 'The Matrix',
    directors: 'Lana Wachowski',
    stars: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss', 'Hugo Weaving'],
    genre: 'Sci-Fi',
    ratings: 8.7,
  },
  {
    title: 'Back to the Future',
    directors: 'Robert Zemeckis',
    stars: ['Michael J. Fox', 'Christopher Lloyd', 'Lea Thompson', 'Crispin Glover'],
    genre: 'Adventure',
    ratings: 8.5,
  },
  {
    title: 'Parasite',
    directors: 'Bong Joon Ho',
    stars: ['Kang-ho Song', 'Sun-kyun Lee', 'Yeo-jeong Cho', 'Choi Woo-sik'],
    genre: 'Thriller',
    ratings: 8.5,
  },
  {
    title: 'Alien',
    directors: 'Ridley Scott',
    stars: ['Sigourney Weaver', 'Tom Skerritt', 'John Hurt', 'Veronica Cartwright'],
    genre: 'Horror',
    ratings: 8.5,
  }
] */

//middleware | logging
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.static('public'));

app.get('/', (_req, res) => {
  res.send('Welcome to the myFlix App!');
});

//Gets list of all movies
app.get('/movies', (_req, res) => {
  Movies.find().then((movies) => {
    res.status(200).json(movies);
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
      res.status(200).send(`${req.params.titlee} is a ${movie.Genre.Name}`)
    } else {
      res.status(400).send('Movie not Found');
    }
  });
});

//Gets Directors name of movie
app.get('/directors/:name', (req, res) => {
  res.status(200).send(`This is the information found for ${req.params.name}`);
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

//Pre-2.8
/*
//Update user information
app.put('/users/:name', (req, res) => {
  res.status(200).send(`Request received to update name for ${req.params.name}`);
});

//Adding favorites
app.post('/users/:id/favorites/:title', (req, res) => {
  res.status(200).send(`Adding ${req.params.title} to favorites for ${req.params.id}`);
});

//Removing favorites
app.delete('/users/:user/favorites', (req, res) => {
    res.send('The movie has been removed from your favorites list');
});

//Deletes user
app.delete('/users/:name', (req, res) => {
  res.status(200).send(`Deleting user ${req.params.name}`);
}); */

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).send('something is broken here');
});

app.listen(8080, () => {
  console.log('listening on port 8080')
});

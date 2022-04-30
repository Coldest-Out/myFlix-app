const express = require('express');
  morgan = require('morgan');
  fs = require('fs');
  path = require('path');

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})


//Bonus Task my topMovies
const topMovies = [
  {
    title: 'Interstellar',
    director: 'Christopher Nolan',
    stars: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Machenzie Foy', 'Ellen Burstyn'],
    genre: ['Adventure', 'Drama', 'Sci-Fi'],
    ratings: 8.6,
  },
  {
    title: 'The Dark Knight',
    director: 'Christopher Nolan',
    stars: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine', 'Maggie Gyllenhaal', 'Gary Oldman'],
    genre: ['Action', 'Crime', 'Drama'],
    ratings: 9.0,
  },
  {
    title: 'Spirited Away',
    director: 'Hayao Miyazaki',
    stars: ['Daveigh Chase', 'Suzanne Pleshette', 'Miyu Irino', 'Rumi Hiiragi', 'Mari Natsuki'],
    genre: 'Anime',
    ratings: 8.6,
  },
  {
    title: 'Spider-Man: Into the Spider-Verse',
    director: ['Bob Persichetti', 'Peter Ramsey', 'Rodney Rothman'],
    stars: ['Shameik Moore', 'Jake Johnson', 'Hailee Steinfeld', 'Mahershala Ali', 'Brian Tyree Henry', 'Lily Tomlin'],
    genre: ['Animation', 'Action', 'Adventure', 'Comedy'],
    ratings: 8.3,
  },
  {
    title: 'Inception',
    director: 'Christopher Nolan',
    stars: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Ken Watanabe', 'Tom Hardy', 'Dileep Rao'],
    genre: ['Action', 'Adventure', 'Sci-Fi', 'Thriller'],
    ratings: 8.8
  }
]

//middleware | logging
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.static('public'));

app.get('/', (_req, res) => {
  res.send('Welcome to the myFlix App!');
});

//Gets list of all movies
app.get('/movies', (_req, res) => {
  res.json(topMovies);
});

app.get('/documentation', (_req, res) => {
  res.sendfile(_dirname + '/public/documentation.html');
});

//Gets the list of data/details about movies (titles)
app.get('/movies/:title', (_req, res) => {
  res.json(
    topMovies.find((movie) => {
      return movie.title === req.params.title;
    })
  );
});

//Gets the data about movies genre
app.get('/movies/genre/:title', (_req, res) => {
  let movie = topMovies.find((movie) => {
    return movie.title === req.params.title;
  });
  if (movie) {
    res.status(200).send(`${req.params.title} is a ${movie.genre}`);
  } else {
    res.status(400).send('Movie not found');
  }
});

//Gets Directors name of movie
app.get('/directors/:name', (_req, res) => {
  res.status(200).send(`Request received for ${req.params.name}`);
});

//Allows user to register
app.post('/users', (_req, res) => {
  res.send(200).send('Request received for new user');
});

//Update user information
app.put('/users/:name', (_req, res) => {
  res.status(200).send(`Request received to update name for ${req.params.name}`);
});

//Adding favorites
app.put('/favorites/:id/:title', (_req, res) => {
  res.status(200).send(`Adding ${req.params.title} to favorites for ${req.params.name}`);
});

//Removing favorites
app.delete('/favorites/:id/favorites/:title', (_req, res) => {
  res.status(200).send(`Removing ${req.params.title} from favorites for ${req.params.title}`);
});

//Deletes user
app.delete('/users/:name', (_req, res) => {
  res.status(200).send(`Deleting user ${req.params.name}`);
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).send('something is broken here');
});

app.listen(8080, () => {
  console.log('listening on port 8080')
});

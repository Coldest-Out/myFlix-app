const express = require('express');
  morgan = require('morgan');
  fs = require('fs');
  path = require('path');

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})


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
app.get('/movies/:title', (req, res) => {
  res.json(
    topMovies.find((movie) => {
      return movie.title === req.params.title;
    })
  );
});

//Gets the data about movies genre
app.get('/movies/genre/:title', (req, res) => {
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
app.get('/directors/:name', (req, res) => {
  res.status(200).send(`This is the information found for ${req.params.name}`);
});

//Allows user to register
app.post('/users', (_req, res) => {
  res.status(200).send(`New user has been created!`);
});

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
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).send('something is broken here');
});

app.listen(8080, () => {
  console.log('listening on port 8080')
});

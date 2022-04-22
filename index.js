const express = require('express');
  morgan = require('morgan');
  fs = require('fs');
  path = require('path');

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

//middleware | logging
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.static('public'));

app.get('/', (_req, res) => {
  res.send('Welcome to the myFlix App!');
});

app.get('/movies', (_req, res) => {
  res.json(topMovies);
});

app.get('/documentation', (_req, res) => {
  res.sendfile(_dirname + '/public/documentation.html');
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).send('something is broken here');
});

app.listen(8080, () => {
  console.log('listening on port 8080')
});

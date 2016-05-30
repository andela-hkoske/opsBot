var env = process.env.NODE_ENV || 'development',
  express = require('express'),
  bodyParser = require('body-parser'),
  bot = require('./bot'),
  config = require('./server/config'),
  app = express(),
  morgan = require('morgan'),
  path = require('path'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose');

mongoose.connect(config.db, function(err) {
  if (err) {
    console.log('Error connecting to the database', err);
  } else {
    console.log('Connected to the database...');
  }
});

// Parse body in requests sent to node server
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

// Set views and views engine variables
app.set('views', path.join(__dirname, 'server/views'));
app.set('view engine', 'jade');

//  Log HTTP requests with error responses
app.use(morgan('dev', {
  skip: function(req, res) {
    return res.statusCode < 400;
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, './public')));

// Serve api
var apiRouter = express.Router(),
  api = require('./server/routes')(app, apiRouter);
app.use('/api', api);

// Set home request route
app.get('/*', function(req, res) {
  res.sendFile('index.html', {
    root: './public'
  });
});

// Set port that server and app are listening to
app.listen(config.port, function(err) {

  console.log('config ', config);
  if (err) {
    console.log(err);
  } else {
    console.log('Server running on port %s...', config.port);
    console.log('Ops bot running on port %s...', config.port);
  }
});

// spawn the bot
var opsBot = bot.spawn(config.slack_token);

// connect the bot to slack
bot.start(opsBot);

bot.register();

//so the program will not close instantly
process.stdin.resume();

function exitHandler(options, err) {
  bot.destroy(opsBot);
  if (err) {
    console.log(err.stack);
  }
  if (options.exit) {
    process.exit();
  }
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

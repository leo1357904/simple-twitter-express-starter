const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const dotenv = require('dotenv');
const helpers = require('./_helpers');
const db = require('./models');


const app = express();
const port = 3000;

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

app.use('/upload', express.static(__dirname + '/upload')); // eslint-disable-line

app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  helpers,
}));
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
}));

// use helpers.getUser(req) to replace req.user
// use helpers.ensureAuthenticated(req) to replace req.isAuthenticated()
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages');
  res.locals.error_messages = req.flash('error_messages');
  res.locals.user = helpers.getUser(req);
  next();
});

app.listen(port, () => {
  db.sequelize.sync();
  console.log(`Example app listening on port ${port}!`); // eslint-disable-line
});

require('./routes')(app);

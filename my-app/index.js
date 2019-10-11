const express = require('express')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const User = require('./server/models/user');

const FacebookStrategy = require('./server/passport/facebook-statergy');
const LocalStrategy = require('./server/passport/local-statergy');


mongoose.connect('mongodb:prisma:prisma@//localhost:27917/auth-demo');
var db = mongoose.connection;




const next = require('next')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express();



  // BodyParser Middleware
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(cookieParser());

// Express Session
  server.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
  }));

// Passport init
  server.use(passport.initialize());
  server.use(passport.session());


  passport.use(LocalStrategy);
  passport.use(FacebookStrategy);


  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
  });

  // Endpoint to login
  server.post('/login',
      passport.authenticate('local'),
      function(req, res) {
        res.send(req.user);
      }
  );

// Endpoint to get current user
  server.get('/user', function(req, res){
    res.send(req.user);
  });


// Endpoint to logout
  server.get('/logout', function(req, res){
    req.logout();
    res.send(null)
  });


  server.get('/auth/facebook',
      passport.authenticate('facebook'));

  server.get('/auth/facebook/callback',
      passport.authenticate('facebook', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        console.log(req.user)
        res.redirect('/');
      }
  );

// Register User
  server.post('/register', function(req, res){
    var password = req.body.password;
    var password2 = req.body.password2;

    if (password == password2){
      var newUser = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
      });

      User.createUser(newUser, function(err, user){
        if(err) throw err;
        res.send(user).end()
      });
    } else{
      res.status(500).send("{erros: \"Passwords don't match\"}").end()
    }
  });



  server.get('/a', (req, res) => {
    return app.render(req, res, '/a', req.query)
  });

  server.get('/b', (req, res) => {
    return app.render(req, res, '/b', req.query)
  });

  server.get('/posts/:id', (req, res) => {
    return app.render(req, res, '/posts', { id: req.params.id })
  });

  server.all('*', (req, res) => {
    return handle(req, res)
  });

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
});

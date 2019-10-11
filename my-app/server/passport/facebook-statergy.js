
var FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../../server/models/user');


// passport.use(new FacebookStrategy({
//         clientID: "APP_ID",
//         clientSecret: "SECRET_KEY",
//         callbackURL: "http://localhost:3000/auth/facebook/callback"
//     },
//     function(accessToken, refreshToken, profile, done) {
//         console.log(profile)
//         // TODO: do sth with returned values
//     }));


module.exports = new FacebookStrategy({
        clientID: "145658462755484",
        clientSecret: "ed6555b4e3c8b42764659a2b9c861825",
        callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        console.log(profile)
        User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
            if (err) return done(err);
            if (user) return done(null, user);
            else {
                // if there is no user found with that facebook id, create them
                var newUser = new User();

                // set all of the facebook information in our user model
                newUser.facebook.id = profile.id;
                newUser.facebook.token = accessToken;
                newUser.facebook.name  = profile.displayName;
                if (typeof profile.emails != 'undefined' && profile.emails.length > 0)
                    newUser.facebook.email = profile.emails[0].value;

                // save our user to the database
                newUser.save(function(err) {
                    if (err) throw err;
                    return done(null, newUser);
                });
            }
        });
    }
)
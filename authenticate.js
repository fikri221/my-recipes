let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let User = require('./models/users');
let JwtStrategy = require('passport-jwt').Strategy;
let ExtractJwt = require('passport-jwt').ExtractJwt;
let jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
let FacebookTokenStrategy = require('passport-facebook-token');

let config = require('./config.js');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey,
        { expiresIn: 3600 });
};

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('Bearer'); //or 'bearer' but then use same case while making requests
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({ _id: jwt_payload._id }, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

// Facebook Authentication
exports.facebookPassport = passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({ facebookId: profile.id }, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (!err && user !== null) {
            return done(null, user);
        }
        else {
            user = new User({ username: profile.displayName });
            user.facebookId = profile.id;
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            user.save((err, user) => {
                if (err) {
                    return done(err, false)
                } else {
                    return done(null, user);
                }
            })
        }
    })
}))

exports.verifyUser = passport.authenticate('jwt', { session: false });

exports.verifyAdmin = function (req, res, next) {
    if (req.user.admin) {
        next();
    } else {
        let err = new Error('You are not privileged to perform this operation!');
        err.status = 403;
        return next(err);
    }
}
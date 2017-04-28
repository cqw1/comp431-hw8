let express = require('express')
let bodyParser = require('body-parser')
let cookieParser = require('cookie-parser')
let passport = require('passport')
let GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

if (process.env.NODE_ENV !== 'production') {
    require('dot-env');
}

var exports = module.exports = {};

var sessions =  {}
exports.sessions = sessions;

exports.passport = passport;

const GOOGLE_CLIENT_ID = '204622054772-55ccni4rg7ikq1kpso8l2uai0r639id7.apps.googleusercontent.com';
exports.GOOGLE_CLIENT_ID = GOOGLE_CLIENT_ID;

const GOOGLE_CLIENT_SECRET = 'AoPEzTAVsqQ1q0aD0TIfdjGk';
exports.GOOGLE_CLIENT_SECRET = GOOGLE_CLIENT_SECRET;

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
//   passport.use(new GoogleStrategy({})
passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    /** 
     * NOTE :
     * Carefull ! and avoid usage of Private IP, otherwise you will get the 
     * device_id device_name issue for Private IP during authenticationa
     * The workaround is to set up thru the google cloud console a fully 
     * qualified domain name such as http://mydomain:3000/ then edit your 
     * /etc/hosts local file to point on your private IP.  Also both sign-in 
     * button + callbackURL has to be share the same url, otherwise two 
     * cookies will be created and lead to lost your session
     * if you use it.}))
     */
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback   : true
},
function(request, accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
        // To keep the example simple, the user's Google profile is returned to
        // represent the logged-in user.  In a typical application, you would want
        // to associate the Google account with a user record in your database,
        // and return that user instead.
        return done(null, profile);
    });
  }
));

const resource = (method, endpoint, payload) => {
	const url = `http://localhost:3000/${endpoint}`
	const options = { method, headers: { 'Content-Type': 'application/json' }}
	if (payload) options.body = JSON.stringify(payload)
	return fetch(url, options).then(r => {
        if (r.status == 200) {
            return r.json()
        } else {	
            const msg = `ERROR ${method} ${endpoint} returned ${r.status}`
            console.error(msg)
            throw new Error(msg)
        }
    })
}
exports.resource = resource;

const app = express();

var cors = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', req.get('origin'));
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    if (req.method == 'OPTIONS') {
        res.status(200);
    }    
    return next();
}

app.use(cors);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

require('./src/profile').endpoints(app);
require('./src/articles').endpoints(app);
require('./src/auth').endpoints(app);
require('./src/following').endpoints(app);

if (process.env.NODE_ENV !== 'production') {
    require('dot-env')
}

// Get the port from the environment, i.e., Heroku sets it
const port = process.env.PORT || 3000
const server = app.listen(port, () => {
     const addr = server.address()
     console.log(`Server listening at http://${addr.address}:${addr.port}`)
})



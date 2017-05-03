let md5 = require('md5');
let index = require('../index');
let models = require('./db/models.js');
if (!process.env.REDIS_URL) {
    process.env.REDIS_URL = 'redis://h:pbe9de9be7a74cb9babb53fcd0fe5f291a0aa702eb0a7340f2c91c60cf1d81729@ec2-34-206-56-163.compute-1.amazonaws.com:40819'
}
let redis = require('redis').createClient(process.env.REDIS_URL)

let passport = index.passport;

let secretMessage = 'oi183u4ms12on';

var exports = module.exports = {};

const isLoggedIn = (req, res, next) => {

    if (req.cookies['sessionId']) {
        let sessionId = req.cookies['sessionId'];

        redis.hgetall(sessionId, function(err, userObj) {
            if (!err) {
                /* req.user looks like:
                 *  {
                 *      username,
                 *      salt,
                 *      hash
                 *  }
                 */
                req.user = userObj;
                return next();
            }
        })
    } else {
        return res.sendStatus(401);
    }
}
exports.isLoggedIn = isLoggedIn;

const postLogin = (req, res) => {

    if (!req.body.username || !req.body.password) {
        return res.sendStatus(400);
    }

    models.User.find({username: req.body.username}).exec(function(err, users) {

        if (users.length > 0) {
            let hash = md5(req.body.password + users[0].salt);

            if (users[0].hash == hash) {
                //loginSuccess(req, res);
                let sessionId = md5(secretMessage + req.body.username + Date.now());

                redis.hmset(sessionId, users[0]);

                // cookie lasts for 1 hour
                res.cookie('sessionId', sessionId,
                        {maxAge: 3600 * 1000, httpOnly: true});

                let msg = {username: req.body.username, result: 'success'};
                return res.send(msg);

            } else {
                return res.sendStatus(401);
            }
        } else {
            return res.sendStatus(401);
        }
    });
}

const postRegister = (req, res) => {
    let salt = md5(req.body.username + Date.now());

    // Create a user and profile object to save to db.
    let newUser = new models.User({
        username: req.body.username,
        salt: salt,
        hash: md5(req.body.password + salt)
    })

    let newProfile = new models.Profile({
        username: req.body.username,
        headline: '<headline>',
        following: [],
        email: req.body.email,
        zipcode: req.body.zipcode,
        dob: new Date(Date.now(req.body.dob)), // milliseconds
        avatar: 'https://parade.com/wp-content/uploads/2014/03/Why-Do-Stars-All-Look-Almost-the-Same-Size-ftr.jpg'
    })

    newUser.save((err, newUser) => {
        if (err) {
            return console.error(err);
        }

        newProfile.save((err, newProfile) => {
            if (err) {
                return console.error(err);
            }

            return res.send({username: newUser.username, result: 'success'});
        })
    })
}

const putLogout = (req, res) => {
    // Clear session and cookie

    redis.del(req.cookies['sessionId'], function(err, count) {});



    res.clearCookie('sessionId');

    return res.send('OK');
}

const putPassword = (req, res) => {
    let newSalt = md5(req.user.username + Date.now());
    let newHash = md5(req.body.password + newSalt);

    // Clean up old db objects and save new ones
    models.User.remove({username: req.user.username})
        .exec(function(err, result) {
            if (err) {
                return console.error(err);
            }

            let newUser = new models.User({
                username: req.user.username,
                salt: newSalt,
                hash: newHash
            })

            newUser.save(function(err, newUser) {
                if (err) {
                    return console.error(err);
                }

                redis.hmset(req.cookies['sessionId'], newUser);
                return res.send({
                    username: req.user.username, 
                    result: 'success'
                });
            })
        });
}


// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
const authGoogle = passport.authenticate('google', { scope: [
   'https://www.googleapis.com/auth/plus.login',
   'https://www.googleapis.com/auth/plus.profile.emails.read'] 
})

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
const authGoogleCallback = passport.authenticate('google', { 
    //successRedirect: '/login/success',
    failureRedirect: '/login'
});

const getUsername = (req) => {
    let username;

    if (req.body.username) {
        username = req.body.username;
    } else if (req.user.username) {
        username = req.user.username;
    }

    return username;
}

const loginSuccess = (req, res) => {

    let user = req.user;
    let sessionId = user.username;

    models.User.find({username: user.username}).exec(function(err, users) {
        if (users.length > 0) {
            redis.hmset(sessionId, users[0]);

            // cookie lasts for 1 hour
            res.cookie('sessionId', sessionId,
                    {maxAge: 3600 * 1000, httpOnly: true});

            let msg = {username: user.username, result: 'success'};
            return res.redirect('http://difficult-income.surge.sh');
            //return res.redirect('http://localhost:8080');

        } else {
            return res.sendStatus(401);
        }
    });
}

const checkLoggedIn = (req, res) => {

    if (req.cookies['sessionId']) {
        let sessionId = req.cookies['sessionId'];

        redis.hgetall(sessionId, function(err, userObj) {
            if (!err) {
                return res.send({
                    isLoggedIn: true,
                    username: userObj.username,
                })
            } else {
                return res.send({isLoggedIn: false});
            }
        })
    } else {
        return res.send({isLoggedIn: false});
    }
}

exports.endpoints = function(app) {
    app.post('/register', postRegister),
    app.post('/login', postLogin),
    app.put('/logout', isLoggedIn, putLogout),
    app.put('/password', isLoggedIn, putPassword),
    app.get('/auth/google', authGoogle),
    app.get('/auth/google/callback', authGoogleCallback, loginSuccess),
    app.get('/login/success', loginSuccess),
    app.get('/checkLoggedIn', checkLoggedIn)
}

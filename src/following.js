let index = require('../index');
let models = require('./db/models.js');
let isLoggedIn = require('./auth.js').isLoggedIn;

const getFollowing = (req, res) => {
    let username = req.user.username;
    if (req.params.user) {
        username = req.params.user;
    }

    models.Profile.find({username}).exec((err, profiles) => {
        if (err) {
            return console.error(err);
        } else {
            return res.send({username, following: profiles[0].following});
        }
    })
}

const putFollowing = (req, res) => {
    models.Profile.find({username: req.user.username})
        .exec((err, profiles) => {
            if (err) {
                return console.error(err);
            } else {
                // Make sure the user we're trying to follow exists.
                models.Profile.find({username: req.params.user})
                    .exec((err, following) => {
                        if (err) {
                            return console.error(err);
                        } else if (following.length < 1) {
                            // If user doesn't exist, then send bad request.
                            return res.send(400);
                        }

                        // Add user to following
                        profiles[0].following.push(req.params.user);

                        // Save changes and return
                        profiles[0].save((err, profile) => {
                            if (err) {
                                return console.error(err);
                            } 

                            return res.send({
                                username: req.user.username, 
                                following: profile.following
                            });
                        })
                    })
            }
        })
}

const deleteFollowing = (req, res) => {
    models.Profile.find({username: req.user.username})
        .exec((err, profiles) => {
            if (err) {
                return console.error(err);
            } else {
                // Filter out deleted user id.
                profiles[0].following = 
                    profiles[0].following.filter((follower) => {
                        return follower != req.params.user;
                    })

                // Save changes and return
                profiles[0].save((err, profile) => {
                    if (err) {
                        return console.error(err);
                    } 

                    return res.send({
                        username: req.user.username, 
                        following: profile.following
                    });
                })
            }
        })
}

var exports =  module.exports = {};

exports.endpoints = function(app) {
	app.get('/following/:user?', isLoggedIn, getFollowing),
	app.put('/following/:user', isLoggedIn, putFollowing),
	app.delete('/following/:user', isLoggedIn, deleteFollowing)
}

let index = require('../index');
let models = require('./db/models.js');
let isLoggedIn = require('./auth.js').isLoggedIn;
let mongoose = require('mongoose')
let md5 = require('md5');

const getArticles = (req, res) => {
    /*
     * Returns articles by the user or anyone the user is following. 
     * Returns 10 at first, and the rest is mamanged by pagination.
     */

    let query;

    if (req.params.id) {
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            // Returns articles with the id or by the author
            query = models.Article.find().or([
                {author: req.params.id}, 
                {_id: mongoose.Types.ObjectId(req.params.id)}
            ]);
        } else {
            // Returns articles by the user specified by the id.
            query = models.Article.find({author: req.params.id});
        }

        query.exec(function(err, articles) {
            res.send({articles});
        })

    } else {
        // Return all owned or following articles.
        
        models.Profile.find({username: req.user.username}).exec((err, profiles) => {
            if (err) {
                return console.error(err);
            } else {
                let authors = [req.user.username, ...profiles[0].following];

                models.Article.find()
                    .where('author')
                    .in(authors)
                    .exec((err, articles) => {
                        res.send({articles});
                })
            }
        })
    } 
}

const createComment = (req, res, articleId) => {
    models.Article.find({_id: articleId}).exec((err, articles) => {
        articles[0].comments.push({
            commentId: md5(req.body.text + Date.now()),
            author: req.user.username,
            date: new Date(),
            text: req.body.text
        })

        return saveAndSendArticle(res, articles[0]);
    });
}

const editComment = (req, res, articleId) => {
    models.Article.find({_id: articleId}).exec((err, articles) => {
        let comments = articles[0].comments.filter((comment) => {
            // Check if commentId matches and if user is 
            // author of comment.
            return (comment.commentId == req.body.commentId && 
                    comment.author == req.user.username);
        });

        if (comments.length < 1) {
            return res.send(400);
        }
        
        comments.forEach((comment) => { 
            comment.text = req.body.text;
        })

        return saveAndSendArticle(res, articles[0]);
    });
}

const editArticle = (req, res, articleId) => {
    models.Article.find({_id: articleId, author: req.user.username})
        .exec(function(err, articles) {
            if (err) {
                return console.error(err);
            } else {
                if (articles.length < 1) {
                    return res.sendStatus(400);
                }

                // Editing the article text.
                articles[0].update({text: req.body.text})
                    .exec(function(err, raw) {
                        if (err) {
                            return console.error(err);
                        }

                        return sendArticleById(res, articleId);
                    });
            }
        });
}

const putArticles = (req, res) => {
    if (!req.params.id) {
        return res.sendStatus(400);
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.sendStatus(400);
    }

    let articleId = mongoose.Types.ObjectId(req.params.id);

    if (req.body.commentId) {
        // Editing a comment
        if (req.body.commentId == '-1' || req.body.commentId == -1) {
            // Creating a new comment.
            return createComment(req, res, articleId);

        } else {
            // Editing existing comment.
            return editComment(req, res, articleId);
        }

    } else {
        // Edit article
        return editArticle(req, res, articleId);
    }
}

const saveAndSendArticle = (res, article) => {
    article.save((err, article) => { 
        if (err) {
            return console.error(err);
        }
        return res.send({articles: [article]});
    })
}

const sendArticleById = (res, articleId) => {
    // Return the updated article.
    models.Article.find({_id: articleId}).exec(function(err, articles) {
        if (err) {
            return console.error(err);
        } else {
            return res.send({articles});
        }
    });
}

const postArticle = (req, res) => {

    // Used for node initDatabase.js
    /*
    let newArticle = new models.Article({
        author: req.body.author,
        date: req.body.date,
        text: req.body.text,
        comments: req.body.comments,
    })
    */
    
    let newArticle = new models.Article({
        author: req.user.username,
        date: new Date(),
        text: req.body.text,
    })

    newArticle.save(function(err, newArticle) {
        if (err) {
            return console.error(err);
        }

        let msg = {'articles': [newArticle]};
        return res.send(msg);
    })
}

var exports =  module.exports = {};

exports.endpoints = function(app) {
	app.get('/articles/:id*?', isLoggedIn, getArticles),
	app.put('/articles/:id', isLoggedIn, putArticles),
	app.post('/article', isLoggedIn, postArticle)
}

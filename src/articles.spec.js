/*
 * Test suite for articles.js
 */
const expect = require('chai').expect
const fetch = require('isomorphic-fetch')
const index = require('../index');

const resource = index.resource;

const url = path => `http://localhost:3000${path}`

describe('Validate article functionality', () => {

	it('should give me three or more articles', (done) => {
        resource('GET', 'articles')
        .then(body => {
            expect(body.articles.length).to.be.at.least(3);
        })
        .then(done)
        .catch(done)
 	}, 500)

	it('should add two articles with successive article ids, and return the article each time', (done) => {
        let firstId;

        resource('POST', 'article', {'text': 'one'})
        .then(body => {
            expect(body).to.be.ok;
            expect(body.articles.length).to.be.eql(1);
            expect(body.articles[0].text).to.be.eql('one');

            firstId = body.articles[0]._id;

            resource('POST', 'article', {'text': 'two'})
            .then(body => {
                expect(body).to.be.ok;
                expect(body.articles.length).to.be.eql(1);
                expect(body.articles[0].text).to.be.eql('two');

                expect(body.articles[0]._id).to.be.eql(firstId + 1);
            })
            .then(done)
            .catch(done)
        })

 	}, 500)

	it('should add one article', (done) => {
        // Counting number of articles first, adding an article, then checking 
        // the length of articles has increased by 1 and the new article is 
        // returned in the list of articles.
        
        let firstLength;
        let postedId;

        resource('GET', 'articles')
        .then(body => {
            expect(body).to.be.ok;
            firstLength = body.articles.length;

            resource('POST', 'article', {'text': 'new'})
            .then(body => {
                expect(body).to.be.ok;
                expect(body.articles.length).to.be.eql(1);
                expect(body.articles[0].text).to.be.eql('new');

                postedId = body.articles[0]._id;

                resource('GET', 'articles')
                .then(body => {
                    expect(body).to.be.ok;
                    expect(body.articles.length).to.be.eql(firstLength + 1);

                    let postedArticle = body.articles.filter(function(obj) {
                        return obj._id == postedId;
                    });

                    expect(postedArticle.length).to.be.eql(1);
                })
                .then(done)
                .catch(done)
            })
        })

 	}, 500)

	it('should return an article with a specified id', (done) => {
        let targetId;

        resource('GET', 'articles')
        .then(body => {
            expect(body.articles.length).to.be.at.least(3);
            targetId = body.articles[Math.floor(
                    Math.random() * body.articles.length)]._id;

            resource('GET', 'articles/' + targetId)
            .then(body => {
                expect(body.articles.length).to.be.eql(1);
                expect(body.articles[0]._id).to.be.eql(targetId);
            })
            .then(done)
            .catch(done)
        })

	}, 500)

	it('should return nothing for an invalid id', (done) => {
        resource('GET', 'articles/hi')
        .then(body => {
            expect(body.articles.length).to.be.eql(0);
        })
        .then(done)
        .catch(done)
	}, 500)

	it('should post, then update the article', (done) => {
        let articleId;

        resource('POST', 'article', {'text': 'original'})
        .then(body => {
            expect(body).to.be.ok;
            expect(body.articles.length).to.be.eql(1);
            expect(body.articles[0].text).to.be.eql('original');

            articleId = body.articles[0]._id;

            resource('PUT', 'articles/' + articleId, {'text': 'modified'})
            .then(body => {
                expect(body).to.be.ok;
                expect(body.articles.length).to.be.at.least(1);
                let postedArticle = body.articles.filter(function(article) {
                    return article._id == articleId;
                });
                expect(postedArticle.length).to.be.eql(1);
                expect(postedArticle[0].text).to.be.eql('modified');
            })
            .then(done)
            .catch(done)
        })

	}, 500)

	it('should post a new comment, then edit it', (done) => {
        let articleId;
        let commentId;
        let commentText;
        let newCommentText;

        resource('GET', 'articles')
        .then(body => {
            // Choosing a random article to post a comment on.
            expect(body.articles.length).to.be.at.least(3);
            articleId = body.articles[Math.floor(
                    Math.random() * body.articles.length)]._id;

            commentText = Date.now();

            resource('PUT', 'articles/' + articleId, {
                'text': commentText,
                'commentId': -1
            })
            .then(body => {
                // Posting a new comment and saving its id
                expect(body.articles.length).to.be.at.least(1);

                let postedArticle = body.articles.filter(function(article) {
                    return article._id == articleId;
                })
                expect(postedArticle.length).to.be.eql(1);
                expect(postedArticle[0].comments.length).to.be.at.least(1);

                let postedComment = postedArticle[0].comments.filter(
                    function(comment) {
                        return comment.text == commentText;
                    }
                );
                expect(postedComment.length).to.be.eql(1);

                commentId = postedComment[0].commentId;

                newCommentText = Date.now();

                resource('PUT', 'articles/' + articleId, {
                    'text': newCommentText,
                    commentId
                })
                .then(body => {
                    // Update the comment's text
                    let postedArticle = body.articles.filter(
                        function(article) {
                            return article._id == articleId;
                        }
                    );
                    expect(postedArticle.length).to.be.eql(1);
                    expect(postedArticle[0].comments.length).to.be.at.least(1);

                    let postedComment = postedArticle[0].comments.filter(
                        function(comment) {
                            return comment.text == newCommentText;
                        }
                    );
                    expect(postedComment.length).to.be.eql(1);

                })
                .then(done)
                .catch(done)

            })
        })

	}, 500)
});

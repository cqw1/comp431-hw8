
// Test suite for following.js

const expect = require('chai').expect
const fetch = require('isomorphic-fetch')
const index = require('../index');

const resource = index.resource;

const url = path => `http://localhost:3000${path}`

describe('Validate following functionality', () => {

	it('should GET following', done => {
		resource('GET', 'following').then(body => {
			expect(body.following).to.be.ok;
			expect(body.following.length).to.be.at.least(1);
			const user = body.following[0];
			expect(user).to.be.ok;
		})
        .then(done)
        .catch(done)
	})

	it('should GET following for a user', done => {
		resource('GET', 'following/me').then(body => {
			expect(body.username).to.be.eql('me');
			expect(body.following).to.be.ok;
			expect(body.following.length).to.be.at.least(1);
			const user = body.following[0];
			expect(user).to.be.ok;
		}).then(done).catch(done)
	})

	it('should PUT following user', done => {
		resource('PUT', 'following/you').then(body => {
			expect(body.username).to.be.ok;
			expect(body.following.length).to.be.at.least(1);
			expect(body.following).to.include('you');
		})
        .then(done)
        .catch(done)
	})

	it('should DELETE following user', done => {
		resource('DELETE', 'following/you').then(body => {
			expect(body.username).to.be.ok;
			expect(body.following).to.not.include('you');
		})
        .then(done)
        .catch(done)
	})

});

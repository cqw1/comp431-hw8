
// Test suite for auth.js

const expect = require('chai').expect
const fetch = require('isomorphic-fetch')
const index = require('../index');

const resource = index.resource;

const url = path => `http://localhost:3000${path}`

describe('Validate authentication functionality', () => {

	it('should POST login', done => {
		resource('POST', 'login', {
            'username': 'test username', 
            'password': 'test password'
        })
        .then(body => {
			expect(body.username).to.eql('test username');
			expect(body.result).to.eql('success');
		})
        .then(done)
        .catch(done)
	})

	it('should PUT logout', done => {
        fetch(url('/logout'), {
            method: 'PUT',
        })
        .then(res => {
            expect(res.status).to.eql(200);
            expect(res.statusText).to.eql('OK');
        })
        .then(done)
        .catch(done)
	})

	it('should POST register', done => {
		resource('POST', 'register', {
            'username': 'test username', 
            'password': 'test password',
            'email': 'test email',
            'dob': 'test dob',
            'zipcode': 'test zipcode'
        })
        .then(body => {
			expect(body.username).to.eql('test username');
			expect(body.result).to.eql('success');
		})
        .then(done)
        .catch(done)
	})

	it('should PUT password', done => {
		resource('PUT', 'password', {
            'password': 'new password',
        })
        .then(body => {
			expect(body.username).to.be.ok;
			expect(body.status).to.eql('will not change');
		})
        .then(done)
        .catch(done)
	})
});


// Test suite for profile.js

const expect = require('chai').expect
const fetch = require('isomorphic-fetch')
const index = require('../index');

const resource = index.resource;

const url = path => `http://localhost:3000${path}`

describe('Validate profile functionality', () => {

	it('should update a headline and verify it changed', (done) => {
        let originalHeadline;

        resource('GET', 'headlines')
        .then(body => {
            expect(body.headlines.length).to.be.eql(1);
            originalHeadline = body.headlines[0].headline;

            resource('PUT', 'headline', {
                headline: originalHeadline + ' revamped'
            })
            .then(body => {
                expect(body).to.ok;
                expect(body.headline).to.be.eql(originalHeadline + ' revamped');
            })
            .then(done)
            .catch(done)
        })

	}, 500)

	it('should GET headline', done => {
		resource('GET', 'headline')
        .then(body => {
			expect(body.headlines).to.be.ok;
			expect(body.headlines.length).to.be.at.least(1);
			const headline = body.headlines[0];
			expect(headline.username).to.be.ok;
			expect(headline.headline).to.be.ok;
		})
        .then(done)
        .catch(done)
	})

	it('should GET headline for a user', done => {
		resource('GET', 'headline/me')
        .then(body => {
			expect(body.headlines).to.be.ok;
			expect(body.headlines.length).to.be.at.least(1);
			const headline = body.headlines[0];
			expect(headline.username).to.be.eql('me');
			expect(headline.headline).to.be.ok;
		})
        .then(done)
        .catch(done)
	})

	it('should GET headlines', done => {
		resource('GET', 'headlines')
        .then(body => {
			expect(body.headlines).to.be.ok;
			expect(body.headlines.length).to.be.at.least(1);
			const headline = body.headlines[0];
			expect(headline.username).to.be.ok;
			expect(headline.headline).to.be.ok;
		})
        .then(done)
        .catch(done)
	})

	it('should GET headlines for a user', done => {
		resource('GET', 'headlines/me')
        .then(body => {
			expect(body.headlines).to.be.ok;
			expect(body.headlines.length).to.be.at.least(1);
			const headline = body.headlines[0];
			expect(headline.username).to.be.eql('me');
			expect(headline.headline).to.be.ok;
		})
        .then(done)
        .catch(done)
	})

	it('should PUT headline', done => {
		const now = new Date().getTime();
		resource('PUT', 'headline', {headline: now})
        .then(body => {
			expect(body.username).to.be.ok;
			expect(body.headline).to.be.eql(now);
		})
        .then(done)
        .catch(done)
	})

	it('should GET email', done => {
		resource('GET', 'email')
        .then(body => {
			expect(body.username).to.be.ok;
			expect(body.email).to.be.ok;
		})
        .then(done)
        .catch(done)
	})

	it('should GET email for a user', done => {
		resource('GET', 'email/me')
        .then(body => {
			expect(body.username).to.be.eql('me');
			expect(body.email).to.be.ok;
		})
        .then(done)
        .catch(done)
	})

	it('should PUT email', done => {
		const now = `${new Date().getTime()}@email.addr`;
		resource('PUT', 'email', {email: now})
        .then(body => {
			expect(body.username).to.be.ok;
			expect(body.email).to.be.eql(now);
		})
        .then(done)
        .catch(done)
	})

	it('should GET zipcode', done => {
		resource('GET', 'zipcode')
        .then(body => {
			expect(body.username).to.be.ok;
			expect(body.zipcode).to.be.ok;
		})
        .then(done)
        .catch(done)
	})

	it('should GET zipcode for a user', done => {
		resource('GET', 'zipcode/me')
        .then(body => {
			expect(body.username).to.be.eql('me');
			expect(body.zipcode).to.be.ok;
		})
        .then(done)
        .catch(done)
	})

	it('should PUT zipcode', done => {
		const now = new Date().getTime();
		resource('PUT', 'zipcode', {zipcode: now})
        .then(body => {
			expect(body.username).to.be.zipcode;
			expect(body.zipcode).to.be.eql(now);
		})
        .then(done)
        .catch(done)
	})

	it('should GET dob', done => {
		resource('GET', 'dob')
        .then(body => {
			expect(body.username).to.be.ok;
			expect(body.dob).to.be.ok;
		})
        .then(done)
        .catch(done)
	})

	it('should GET avatars', done => {
		resource('GET', 'avatars')
        .then(body => {
			expect(body.avatars).to.be.ok;
			expect(body.avatars.length).to.be.at.least(1);
			const avatar = body.avatars[0];
			expect(avatar.username).to.be.ok;
			expect(avatar.avatar).to.be.ok;
		})
        .then(done)
        .catch(done)
	})

	it('should GET avatars for a user', done => {
		resource('GET', 'avatars/me')
        .then(body => {
			expect(body.avatars).to.be.ok;
			expect(body.avatars.length).to.be.at.least(1);
			const avatar = body.avatars[0];
			expect(avatar.username).to.be.eql('me');
			expect(avatar.avatar).to.be.ok;
		})
        .then(done)
        .catch(done)
	
    })

    it('should PUT avatar', done => {
		const url = 'https://webdev-dummy.herokuapp.com/img/owl.png-' + 
            new Date().getTime();
		resource('PUT', 'avatar', { avatar: url })
        .then(body => {
			expect(body.username).to.be.zipcode;
			expect(body.avatar).to.be.eql(url);
		})
        .then(done)
        .catch(done)
	})

});

var should = require('should');
var assert = require('assert');
var request = require('supertest');

describe('index', function () {

    describe('welcome page', function () {
        var url = 'http://localhost:3000/';
        it('should render', function (done) {
            request(url)
                .get('/')
                .send()
                .expect(200) // OK
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    assert.notEqual(res.text.indexOf('<title>Express</title>'), -1);
                    done();
                });
        });
    })
})
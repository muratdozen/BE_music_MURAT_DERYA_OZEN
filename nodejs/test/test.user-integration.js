var should = require('should');
var assert = require('assert');
var request = require('supertest');
var userRoute = require('./../routes/user.js');
var userStore = require('./../data_store/user-store.js');

var url = 'http://localhost:3000';

var prepareResponseStub = function () {
    var res = {};
    res.send = function (status, body) {
        res.status = status;
        res.body = body || {};
    }
    return res;
}

describe('user route', function () {

    describe('POST /follow', function () {

        var prepareRequestStub = function (fromUserId, toUserId) {
            return {"body": {"from": fromUserId, "to": toUserId}};
        }

        describe('happy path', function () {

            describe('when "to" user does not exist in the store', function () {

                var fromUserId = "user1", toUserId = "user345";
                var req = prepareRequestStub(fromUserId, toUserId);
                var res = prepareResponseStub();

                before(function () {
                    userStore.clear();
                    userRoute.follow(req, res);
                })

                it('should respond with 200 OK', function (done) {
                    res.should.have.property("status", 200);
                    res.should.have.property("body");
                    done();
                });

                it('should create a new user object for "to"', function (done) {
                    userStore.size().should.be.equal(1);
                    var followeeUser = userStore.findById(toUserId);
                    should.exist(followeeUser);
                    done();
                });

                it('should add "from" as the only follower to "to"', function (done) {
                    var followeeUser = userStore.findById(toUserId);
                    should.exist(followeeUser.followers);
                    followeeUser.followers.should.have.a.lengthOf(1);
                    followeeUser.followers[0].should.be.equal(fromUserId);
                    done();
                });
            });

            describe('when "to" user is already in the store but has no followers', function () {

                var fromUserId = "user1333333", toUserId = "usernnnn345";
                var req = prepareRequestStub(fromUserId, toUserId);
                var res = prepareResponseStub();

                before(function () {
                    userStore.clear();
                    var toUser = userStore.newUserObject(toUserId);
                    userStore.save(toUser);

                    userRoute.follow(req, res);
                })

                it('should respond with 200 OK', function (done) {
                    res.should.have.property("status", 200);
                    res.should.have.property("body");
                    done();
                });

                it('should not create a new user object for "to"', function (done) {
                    userStore.size().should.be.equal(1);
                    var followeeUser = userStore.findById(toUserId);
                    should.exist(followeeUser);
                    done();
                });

                it('should add "from" as the only follower to "to"', function (done) {
                    var followeeUser = userStore.findById(toUserId);
                    should.exist(followeeUser.followers);
                    followeeUser.followers.should.have.a.lengthOf(1);
                    followeeUser.followers[0].should.be.equal(fromUserId);
                    done();
                });
            });

            describe('when "to" user is already in the store and has followers but not followed by "from"', function () {

                var fromUserId = "user756", toUserId = "userfghj",
                    existingFollowerId1 = "followerId3523", existingFollowerId2 = "followerId1111";
                var req = prepareRequestStub(fromUserId, toUserId);
                var res = prepareResponseStub();

                before(function () {
                    userStore.clear();
                    var toUser = userStore.newUserObject(toUserId);
                    toUser.followers = [existingFollowerId1, existingFollowerId2];
                    userStore.save(toUser);

                    userRoute.follow(req, res);
                })


                it('should respond with 200 OK', function (done) {
                    res.should.have.property("status", 200);
                    res.should.have.property("body");
                    done();
                });

                it('should not create a new user object for "to"', function (done) {
                    userStore.size().should.be.equal(1);
                    var followeeUser = userStore.findById(toUserId);
                    should.exist(followeeUser);
                    done();
                });

                it('should include "from" in the followers of "to"', function (done) {
                    var followeeUser = userStore.findById(toUserId);
                    should.exist(followeeUser.followers);
                    followeeUser.followers.should.have.a.lengthOf(3);
                    followeeUser.followers.should.containEql(fromUserId);
                    followeeUser.followers.should.containEql(existingFollowerId1);
                    followeeUser.followers.should.containEql(existingFollowerId2);
                    done();
                });
            });

            describe('when "to" user is already in the store and has followers and "from" is already a follower', function () {

                var fromUserId = "user7xxxx56", toUserId = "userfyyyyyghj",
                    existingFollowerId = "randomFollowerId3523";
                var req = prepareRequestStub(fromUserId, toUserId);
                var res = prepareResponseStub();

                before(function () {
                    userStore.clear();
                    var toUser = userStore.newUserObject(toUserId);
                    toUser.followers = [existingFollowerId, fromUserId];
                    userStore.save(toUser);

                    userRoute.follow(req, res);
                })


                it('should respond with 200 OK', function (done) {
                    res.should.have.property("status", 200);
                    res.should.have.property("body");
                    done();
                });

                it('should not create a new user object for "to"', function (done) {
                    userStore.size().should.be.equal(1);
                    var followeeUser = userStore.findById(toUserId);
                    should.exist(followeeUser);
                    done();
                });

                it('should not add "from" as a follower of "to" so as to not permit duplicate followers', function (done) {
                    var followeeUser = userStore.findById(toUserId);
                    should.exist(followeeUser.followers);
                    followeeUser.followers.should.have.a.lengthOf(2);
                    followeeUser.followers.should.containEql(fromUserId);
                    followeeUser.followers.should.containEql(existingFollowerId);
                    done();
                });
            });

        })

        describe('error path', function () {

            describe('when "from" request parameter is not valid', function () {

                var fromUserId = "user1_", toUserId = "user345";
                var req = prepareRequestStub(fromUserId, toUserId);
                var res = prepareResponseStub();

                before(function () {
                    userStore.clear();
                    userStore.save(userStore.newUserObject(toUserId));
                    userStore.save(userStore.newUserObject("randomUser7654"));
                    userRoute.follow(req, res);
                })

                it('should respond with 400 BAD REQUEST', function (done) {
                    res.should.have.property("status", 400);
                    res.should.have.property("error");
                    done();
                });

                it('should not save/update a user or follower in the userStore', function (done) {
                    userStore.size().should.be.equal(2);
                    var followeeUser = userStore.findById(toUserId);
                    should.exist(followeeUser);
                    should.exist(followeeUser.followers);
                    followeeUser.followers.should.have.a.lengthOf(0);
                    done();
                });
            });

            describe('when "to" request parameter is not valid', function () {

                var fromUserId = "user14", toUserId = "user-345";
                var req = prepareRequestStub(fromUserId, toUserId);
                var res = prepareResponseStub();

                before(function () {
                    userStore.clear();
                    userStore.save(userStore.newUserObject("randomUser7654"));
                    userRoute.follow(req, res);
                })

                it('should respond with 400 BAD REQUEST', function (done) {
                    res.should.have.property("status", 400);
                    res.should.have.property("error");
                    done();
                });

                it('should not save/update a user or follower in the userStore', function (done) {
                    userStore.size().should.be.equal(1);
                    var followeeUser = userStore.findById(toUserId);
                    should.not.exist(followeeUser);
                    done();
                });
            });

        })
    })
})
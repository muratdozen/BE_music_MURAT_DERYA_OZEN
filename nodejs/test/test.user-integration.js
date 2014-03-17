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

            describe('when "from" request parameter is not present', function () {

                var toUserId = "user345";
                var req = prepareRequestStub(undefined, toUserId);
                var res = prepareResponseStub();

                before(function () {
                    userStore.clear();
                    userStore.save(userStore.newUserObject(toUserId));
                    userStore.save(userStore.newUserObject("randomUser7654"));
                    userRoute.follow(req, res);
                })

                it('should respond with 400 BAD REQUEST', function (done) {
                    res.should.have.property("status", 400);
                    res.should.have.property("body");
                    res.body.should.have.property("error");
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
                    res.should.have.property("body");
                    res.body.should.have.property("error");
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

            describe('when "to" request parameter is not present', function () {

                var fromUserId = "user14";
                var req = prepareRequestStub(fromUserId, undefined);
                var res = prepareResponseStub();

                before(function () {
                    userStore.clear();
                    userStore.save(userStore.newUserObject("randomUser7654"));
                    userRoute.follow(req, res);
                })

                it('should respond with 400 BAD REQUEST', function (done) {
                    res.should.have.property("status", 400);
                    res.should.have.property("body");
                    res.body.should.have.property("error");
                    done();
                });

                it('should not save/update a user or follower in the userStore', function (done) {
                    userStore.size().should.be.equal(1);
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
                    res.should.have.property("body");
                    res.body.should.have.property("error");
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

    describe('POST /listen', function () {

        var prepareRequestStub = function (userId, musicId) {
            return {"body": {"user": userId, "music": musicId}};
        }

        describe('happy path', function () {

            describe('when user does not exist in the store', function () {

                var userId = "user1", musicId = "m345";
                var req = prepareRequestStub(userId, musicId);
                var res = prepareResponseStub();

                before(function () {
                    userStore.clear();
                    userRoute.listen(req, res);
                })

                it('should respond with 200 OK', function (done) {
                    res.should.have.property("status", 200);
                    res.should.have.property("body");
                    done();
                });

                it('should create a new user object', function (done) {
                    userStore.size().should.be.equal(1);
                    var user = userStore.findById(userId);
                    should.exist(user);
                    done();
                });

                it('should add "musicId" as the only music to list of musics', function (done) {
                    var user = userStore.findById(userId);
                    should.exist(user.musics);
                    user.musics.should.have.a.lengthOf(1);
                    user.musics[0].should.be.equal(musicId);
                    done();
                });
            });

            describe('when user is already saved in the store but has empty list of musics', function () {

                var userId = "user61", musicId = "m3456";
                var req = prepareRequestStub(userId, musicId);
                var res = prepareResponseStub();

                before(function () {
                    userStore.clear();
                    userStore.save(userStore.newUserObject(userId));
                    userRoute.listen(req, res);
                })

                it('should respond with 200 OK', function (done) {
                    res.should.have.property("status", 200);
                    res.should.have.property("body");
                    done();
                });

                it('should not create a new user object', function (done) {
                    userStore.size().should.be.equal(1);
                    var user = userStore.findById(userId);
                    should.exist(user);
                    done();
                });

                it('should add "musicId" as the only music to list of musics', function (done) {
                    var user = userStore.findById(userId);
                    should.exist(user.musics);
                    user.musics.should.have.a.lengthOf(1);
                    user.musics[0].should.be.equal(musicId);
                    done();
                });
            });

            describe('when user is already saved in the store but has non-empty list of musics', function () {

                var userId = "user6561", musicId = "m123222", existingMusicId = "mRandomMusic1234";
                var req = prepareRequestStub(userId, musicId);
                var res = prepareResponseStub();

                before(function () {
                    userStore.clear();
                    var user = userStore.newUserObject(userId);
                    user.musics = [existingMusicId];
                    userStore.save(user);
                    userRoute.listen(req, res);
                })

                it('should respond with 200 OK', function (done) {
                    res.should.have.property("status", 200);
                    res.should.have.property("body");
                    done();
                });

                it('should not create a new user object', function (done) {
                    userStore.size().should.be.equal(1);
                    var user = userStore.findById(userId);
                    should.exist(user);
                    done();
                });

                it('should append "musicId" to list of musics', function (done) {
                    var user = userStore.findById(userId);
                    should.exist(user.musics);
                    user.musics.should.have.a.lengthOf(2);
                    user.musics.should.containEql(existingMusicId);
                    user.musics.should.containEql(musicId);
                    done();
                });
            });

            describe('when user is already saved in the store but already has music in his list of musics', function () {

                var userId = "user6561", musicId = "m123222";
                var req = prepareRequestStub(userId, musicId);
                var res = prepareResponseStub();

                before(function () {
                    userStore.clear();
                    var user = userStore.newUserObject(userId);
                    user.musics = [musicId];
                    userStore.save(user);
                    userRoute.listen(req, res);
                })

                it('should respond with 200 OK', function (done) {
                    res.should.have.property("status", 200);
                    res.should.have.property("body");
                    done();
                });

                it('should not create a new user object', function (done) {
                    userStore.size().should.be.equal(1);
                    var user = userStore.findById(userId);
                    should.exist(user);
                    done();
                });

                it('should append "musicId" as a duplicate to list of musics', function (done) {
                    var user = userStore.findById(userId);
                    should.exist(user.musics);
                    user.musics.should.have.a.lengthOf(2);
                    user.musics.should.matchEach(musicId);
                    done();
                });
            });

        })

        describe('error path', function () {

            describe('when "user" request parameter is not present', function () {

                var musicId = "m345";
                var req = prepareRequestStub(undefined, musicId);
                var res = prepareResponseStub();

                before(function () {
                    userStore.clear();
                    userStore.save(userStore.newUserObject("randomUser7654"));
                    userRoute.listen(req, res);
                })

                it('should respond with 400 BAD REQUEST', function (done) {
                    res.should.have.property("status", 400);
                    res.should.have.property("body");
                    res.body.should.have.property("error");
                    done();
                });
            });

            describe('when "user" request parameter is not valid', function () {

                var userId = "user1_", musicId = "m345";
                var req = prepareRequestStub(userId, musicId);
                var res = prepareResponseStub();

                before(function () {
                    userStore.clear();
                    userStore.save(userStore.newUserObject("randomUser7654"));
                    userRoute.listen(req, res);
                })

                it('should respond with 400 BAD REQUEST', function (done) {
                    res.should.have.property("status", 400);
                    res.should.have.property("body");
                    res.body.should.have.property("error");
                    done();
                });

                it('should not save/update a user in the userStore', function (done) {
                    userStore.size().should.be.equal(1);
                    done();
                });
            });

            describe('when "music" request parameter is not present', function () {

                var userId = "user1";
                var req = prepareRequestStub(userId, undefined);
                var res = prepareResponseStub();

                before(function () {
                    userStore.clear();
                    userStore.save(userStore.newUserObject(userId));
                    userRoute.listen(req, res);
                })

                it('should respond with 400 BAD REQUEST', function (done) {
                    res.should.have.property("status", 400);
                    res.should.have.property("body");
                    res.body.should.have.property("error");
                    done();
                });

                it('should not save/update the user or musics list in the userStore', function (done) {
                    userStore.size().should.be.equal(1);
                    var user = userStore.findById(userId);
                    should.exist(user);
                    should.exist(user.musics);
                    user.musics.should.have.a.lengthOf(0);
                    done();
                });
            });

            describe('when "music" request parameter is not valid', function () {

                var userId = "user1", musicId = "m_345";
                var req = prepareRequestStub(userId, musicId);
                var res = prepareResponseStub();

                before(function () {
                    userStore.clear();
                    userStore.save(userStore.newUserObject(userId));
                    userRoute.listen(req, res);
                })

                it('should respond with 400 BAD REQUEST', function (done) {
                    res.should.have.property("status", 400);
                    res.should.have.property("body");
                    res.body.should.have.property("error");
                    done();
                });

                it('should not save/update the user or musics list in the userStore', function (done) {
                    userStore.size().should.be.equal(1);
                    var user = userStore.findById(userId);
                    should.exist(user);
                    should.exist(user.musics);
                    user.musics.should.have.a.lengthOf(0);
                    done();
                });
            });

        })
    })
})
var should = require('should');
var assert = require('assert');
var userRoute = require('./../routes/user.js');
var userStore = require('./../data_store/user-store.js');
var musicStore = require('./../data_store/music-store.js');

/**
 * Helper function to return a mock response object.
 */
var mockResponse = function () {

    var res = {};
    res.send = function (status, body) {
        res.status = status;
        res.body = body || {};
    }
    return res;
}

describe('user route', function () {

    describe('POST /follow', function () {

        var mockRequest = function (fromUserId, toUserId) {
            return {"body": {"from": fromUserId, "to": toUserId}};
        }

        describe('happy path', function () {

            describe('when "from" user does not exist in the store', function () {

                var fromUserId = "user1", toUserId = "user345";
                var req = mockRequest(fromUserId, toUserId);
                var res = mockResponse();

                before(function () {
                    userStore.clear();
                    userRoute.follow(req, res);
                })

                it('should respond with 200 OK', function (done) {
                    res.should.have.property("status", 200);
                    res.should.have.property("body");
                    done();
                });

                it('should create a new user object for "from"', function (done) {
                    userStore.size().should.be.equal(1);
                    var followerUser = userStore.findById(fromUserId);
                    should.exist(followerUser);
                    done();
                });

                it('should add "to" as the only followed user to "from"', function (done) {
                    var followerUser = userStore.findById(fromUserId);
                    should.exist(followerUser.followedUsers);
                    Object.keys(followerUser.followedUsers).should.have.a.lengthOf(1);
                    should.exist(followerUser.followedUsers[toUserId]);
                    done();
                });

            });

            describe('when "from" user is already in the store but follows noone', function () {

                var fromUserId = "user1333333", toUserId = "usernnnn345";
                var req = mockRequest(fromUserId, toUserId);
                var res = mockResponse();

                before(function () {
                    userStore.clear();
                    var fromUser = userStore.newUserObject(fromUserId);
                    userStore.save(fromUser);
                    userRoute.follow(req, res);
                })

                it('should respond with 200 OK', function (done) {
                    res.should.have.property("status", 200);
                    res.should.have.property("body");
                    done();
                });

                it('should not create a new user object for "from"', function (done) {
                    userStore.size().should.be.equal(1);
                    var followerUser = userStore.findById(fromUserId);
                    should.exist(followerUser);
                    done();
                });

                it('should add "to" as the only followed user to "from"', function (done) {
                    var followerUser = userStore.findById(fromUserId);
                    should.exist(followerUser.followedUsers);
                    Object.keys(followerUser.followedUsers).should.have.a.lengthOf(1);
                    should.exist(followerUser.followedUsers[toUserId]);
                    done();
                });

            });

            describe('when "from" user is already in the store and has followedUsers but does not follow "to"', function () {

                var fromUserId = "user756", toUserId = "userfghj", existingFollowedId1 = "followerId3523", existingFollowedId2 = "followerId1111";
                var req = mockRequest(fromUserId, toUserId);
                var res = mockResponse();

                before(function () {
                    userStore.clear();
                    var fromUser = userStore.newUserObject(fromUserId);
                    fromUser.followedUsers[existingFollowedId1] = true;
                    fromUser.followedUsers[existingFollowedId2] = true;
                    userStore.save(fromUser);
                    userRoute.follow(req, res);
                })

                it('should respond with 200 OK', function (done) {
                    res.should.have.property("status", 200);
                    res.should.have.property("body");
                    done();
                });

                it('should not create a new user object for "from"', function (done) {
                    userStore.size().should.be.equal(1);
                    var followerUser = userStore.findById(fromUserId);
                    should.exist(followerUser);
                    done();
                });

                it('should include "to" in the followedUsers of "from"', function (done) {
                    var followerUser = userStore.findById(fromUserId);
                    should.exist(followerUser.followedUsers);
                    Object.keys(followerUser.followedUsers).should.have.a.lengthOf(3);
                    should.exist(followerUser.followedUsers[toUserId]);
                    should.exist(followerUser.followedUsers[existingFollowedId1]);
                    should.exist(followerUser.followedUsers[existingFollowedId2]);
                    done();
                });

            });

            describe('when "from" user is already in the store and follows several users and "to" is already followed', function () {

                var fromUserId = "user7xxxx56", toUserId = "userfyyyyyghj", existingFollowedId = "randomFollowerId3523";
                var req = mockRequest(fromUserId, toUserId);
                var res = mockResponse();

                before(function () {
                    userStore.clear();
                    var fromUser = userStore.newUserObject(fromUserId);
                    fromUser.followedUsers[existingFollowedId] = true;
                    fromUser.followedUsers[toUserId] = true;
                    userStore.save(fromUser);
                    userRoute.follow(req, res);
                })

                it('should respond with 200 OK', function (done) {
                    res.should.have.property("status", 200);
                    res.should.have.property("body");
                    done();
                });

                it('should not create a new user object for "from"', function (done) {
                    userStore.size().should.be.equal(1);
                    var followerUser = userStore.findById(fromUserId);
                    should.exist(followerUser);
                    done();
                });

                it('should not add "to" as a followedUser for "from" so as to not permit duplicate followers', function (done) {
                    var followerUser = userStore.findById(fromUserId);
                    should.exist(followerUser.followedUsers);
                    Object.keys(followerUser.followedUsers).should.have.a.lengthOf(2);
                    should.exist(followerUser.followedUsers[toUserId]);
                    should.exist(followerUser.followedUsers[existingFollowedId]);
                    done();
                });

            });

        })

        describe('error path', function () {

            describe('when "to" request parameter is not present', function () {

                var fromUserId = "user345";
                var req = mockRequest(undefined, fromUserId);
                var res = mockResponse();

                before(function () {
                    userStore.clear();
                    userStore.save(userStore.newUserObject(fromUserId));
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
                    var followerUser = userStore.findById(fromUserId);
                    should.exist(followerUser);
                    should.exist(followerUser.followedUsers);
                    Object.keys(followerUser.followedUsers).should.have.a.lengthOf(0);
                    done();
                });

            });

            describe('when "to" request parameter is not valid', function () {

                var fromUserId = "user1", toUserId = "user345_";
                var req = mockRequest(fromUserId, toUserId);
                var res = mockResponse();

                before(function () {
                    userStore.clear();
                    userStore.save(userStore.newUserObject(fromUserId));
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
                    var followerUser = userStore.findById(fromUserId);
                    should.exist(followerUser);
                    should.exist(followerUser.followedUsers);
                    Object.keys(followerUser.followedUsers).should.have.a.lengthOf(0);
                    done();
                });

            });

            describe('when "from" request parameter is not present', function () {

                var toUserId = "user14";
                var req = mockRequest(undefined, toUserId);
                var res = mockResponse();

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

            describe('when "from" request parameter is not valid', function () {

                var fromUserId = "user-14", toUserId = "user345";
                var req = mockRequest(fromUserId, toUserId);
                var res = mockResponse();

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
                    var followerUser = userStore.findById(fromUserId);
                    should.not.exist(followerUser);
                    done();
                });

            });

        })
    })
    describe('POST /listen', function () {

        var mockRequest = function (userId, musicId) {
            return {"body": {"user": userId, "music": musicId}};
        }

        describe('happy path', function () {

            describe('when user does not exist in the store', function () {

                var userId = "user1", musicId = "m345";
                var req = mockRequest(userId, musicId);
                var res = mockResponse();

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
                    Object.keys(user.musics).should.have.a.lengthOf(1);
                    should.exist(user.musics[musicId]);
                    user.musics[musicId].should.be.equal(1);
                    done();
                });

            });

            describe('when user is already saved in the store but has empty list of musics', function () {

                var userId = "user61", musicId = "m3456";
                var req = mockRequest(userId, musicId);
                var res = mockResponse();

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
                    Object.keys(user.musics).should.have.a.lengthOf(1);
                    should.exist(user.musics[musicId]);
                    user.musics[musicId].should.be.equal(1);
                    done();
                });

            });

            describe('when user is already saved in the store but has non-empty list of musics', function () {

                var userId = "user6561", musicId = "m123222", existingMusicId = "mRandomMusic1234";
                var req = mockRequest(userId, musicId);
                var res = mockResponse();

                before(function () {
                    userStore.clear();
                    var user = userStore.newUserObject(userId);
                    user.musics[existingMusicId] = 1;
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
                    Object.keys(user.musics).should.have.a.lengthOf(2);
                    user.musics[existingMusicId].should.be.equal(1);
                    user.musics[musicId].should.be.equal(1);
                    done();
                });

            });

            describe('when user is already saved in the store but already has this musicId in his list of musics', function () {

                var userId = "user6561", musicId = "m123222";
                var req = mockRequest(userId, musicId);
                var res = mockResponse();

                before(function () {
                    userStore.clear();
                    var user = userStore.newUserObject(userId);
                    user.musics[musicId] = 1;
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
                    Object.keys(user.musics).should.have.a.lengthOf(1);
                    user.musics[musicId].should.be.equal(2);
                    done();
                });

            });

        })

        describe('error path', function () {

            describe('when "user" request parameter is not present', function () {

                var musicId = "m345";
                var req = mockRequest(undefined, musicId);
                var res = mockResponse();

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
                var req = mockRequest(userId, musicId);
                var res = mockResponse();

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
                var req = mockRequest(userId, undefined);
                var res = mockResponse();

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
                    Object.keys(user.musics).should.have.a.lengthOf(0);
                    done();
                });

            });

            describe('when "music" request parameter is not valid', function () {

                var userId = "user1", musicId = "m_345";
                var req = mockRequest(userId, musicId);
                var res = mockResponse();

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
                    Object.keys(user.musics).should.have.a.lengthOf(0);
                    done();
                });

            });

        })
    })
    describe('GET /recommendations', function () {

        var mockRequest = function (userId) {
            return {"query": {"user": userId}};
        }

        describe('happy path', function () {

            describe('should return 5 recommendations when music store has at least 5 musics', function () {

                var userId = "a";
                var req = mockRequest(userId);
                var res = mockResponse();

                before(function () {
                    userStore.clear();
                    userStore.save({
                        "userId": "a",
                        "followedUsers": {
                            "b": true,
                            "c": true
                        },
                        "musics": {
                            "m2": 1,
                            "m6": 1
                        }
                    });

                    userStore.save({
                        "userId": "b",
                        "followedUsers": {
                            "c": true,
                            "d": true,
                            "e": true
                        },
                        "musics": {
                            "m4": 1,
                            "m9": 1
                        }
                    });

                    userStore.save({
                        "userId": "c",
                        "followedUsers": {
                            "a": true
                        },
                        "musics": {
                            "m8": 1,
                            "m7": 1
                        }
                    });

                    userStore.save({
                        "userId": "d",
                        "followedUsers": {},
                        "musics": {
                            "m2": 1,
                            "m6": 1,
                            "m7": 1
                        }
                    });

                    userStore.save({
                        "userId": "e",
                        "followedUsers": {},
                        "musics": {
                            "m11": 1
                        }
                    });

                    musicStore.clear();
                    musicStore.save(musicStore.newMusicObject("m1", ["jazz", "old school", "instrumental"]));
                    musicStore.save(musicStore.newMusicObject("m2", ["samba", "60s"]));
                    musicStore.save(musicStore.newMusicObject("m3", ["rock", "alternative"]));
                    musicStore.save(musicStore.newMusicObject("m4", ["rock", "alternative"]));
                    musicStore.save(musicStore.newMusicObject("m5", ["folk", "instrumental"]));
                    musicStore.save(musicStore.newMusicObject("m6", ["60s", "rock", "old school"]));
                    musicStore.save(musicStore.newMusicObject("m7", ["alternative", "dance"]));
                    musicStore.save(musicStore.newMusicObject("m8", ["electronic", "pop"]));
                    musicStore.save(musicStore.newMusicObject("m9", ["60s", "rock"]));
                    musicStore.save(musicStore.newMusicObject("m10", ["60s", "jazz"]));
                    musicStore.save(musicStore.newMusicObject("m11", ["samba"]));
                    musicStore.save(musicStore.newMusicObject("m12", ["jazz", "instrumental"]));

                    userRoute.recommendations(req, res);
                })

                it('should respond with 200 OK', function (done) {
                    res.should.have.property("status", 200);
                    done();
                });

                it('should have exactly 5 elements in the list of recommendations', function (done) {
                    res.should.have.property("body");
                    var body = res.body;
                    body.should.have.property("list");
                    var list = body.list;
                    list.should.be.an.instanceOf(Array);
                    list.should.have.a.lengthOf(5);
                    done();
                });

            });

            describe('should return all musics when music store has fewer than 5 musics', function () {

                var userId = "a";
                var req = mockRequest(userId);
                var res = mockResponse();

                before(function () {
                    userStore.clear();
                    userStore.save({
                        "userId": "a",
                        "followedUsers": {
                            "b": true,
                            "c": true
                        },
                        "musics": {
                            "m2": 1
                        }
                    });

                    userStore.save({
                        "userId": "b",
                        "followedUsers": {
                            "c": true,
                            "d": true,
                            "e": true
                        },
                        "musics": {}
                    });

                    userStore.save({
                        "userId": "c",
                        "followedUsers": {
                            "a": true
                        },
                        "musics": {}
                    });

                    userStore.save({
                        "userId": "d",
                        "followedUsers": {},
                        "musics": {
                            "m2": 1
                        }
                    });

                    userStore.save({
                        "userId": "e",
                        "followedUsers": {},
                        "musics": {}
                    });

                    musicStore.clear();
                    musicStore.save(musicStore.newMusicObject("m2", ["samba", "60s"]));
                    musicStore.save(musicStore.newMusicObject("m3", ["rock", "alternative"]));
                    musicStore.save(musicStore.newMusicObject("m5", ["folk", "instrumental"]));

                    userRoute.recommendations(req, res);
                })

                it('should respond with 200 OK', function (done) {
                    res.should.have.property("status", 200);
                    done();
                });

                it('should have at least 5 elements in the list of recommendations', function (done) {
                    res.should.have.property("body");
                    var body = res.body;
                    body.should.have.property("list");
                    var list = body.list;
                    list.should.be.an.instanceOf(Array);
                    list.should.have.a.lengthOf(3);
                    done();
                });

            });

        })
        describe('error path', function () {

            describe('when "user" request parameter is not present', function () {

                var req = mockRequest(undefined);
                var res = mockResponse();

                before(function () {
                    userStore.clear();
                    userRoute.recommendations(req, res);
                })

                it('should respond with 400 BAD REQUEST', function (done) {
                    res.should.have.property("status", 400);
                    res.should.have.property("body");
                    res.body.should.have.property("error");
                    done();
                });

            });

            describe('when "user" request parameter is not valid', function () {

                var userId = "user1_";
                var req = mockRequest(userId);
                var res = mockResponse();

                before(function () {
                    userStore.clear();
                    userRoute.recommendations(req, res);
                })

                it('should respond with 400 BAD REQUEST', function (done) {
                    res.should.have.property("status", 400);
                    res.should.have.property("body");
                    res.body.should.have.property("error");
                    done();
                });

            });

            describe('when "user" request parameter points to a non-existant userId', function () {

                var userId = "user1";
                var req = mockRequest(userId);
                var res = mockResponse();

                before(function () {
                    userStore.clear();
                    userRoute.recommendations(req, res);
                })

                it('should respond with 404 NOT FOUND', function (done) {
                    res.should.have.property("status", 404);
                    done();
                });

                it('should not save/update a user or musics list in the userStore', function (done) {
                    userStore.size().should.be.equal(0);
                    done();
                });

            });

        })
    })
})
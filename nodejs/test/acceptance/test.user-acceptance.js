var should = require('should');
var assert = require('assert');
var request = require('supertest');
var fs = require('fs');
var userStore = require('./../../data_store/user-store.js');

var url = 'http://localhost:3000';

describe('user-acceptance', function () {

    var followInputFilePath = __dirname + '/input/follows.json';
    var listenInputFilePath = __dirname + '/input/listen.json';
    var followData, listenData;

    before(function () {

        // Start the test with an empty set of users.
        userStore.usersIndexedByUserId = {};

        var fileContent;

        // load follows.json
        fileContent = fs.readFileSync(followInputFilePath, 'utf8');
        followData = JSON.parse(fileContent);

        // load listen.json
        fileContent = fs.readFileSync(listenInputFilePath, 'utf8');
        listenData = JSON.parse(fileContent);

    })


    var prepareFollowRequestBody = function (fromUserId, toUserId) {
        return {"from": fromUserId, "to": toUserId}
    }

    var prepareListenRequestBody = function (userId, musicId) {
        return {"user": userId, "music": musicId}
    }

    it('should not throw any exceptions', function (done) {

        // feed in follows.json to POST/follow endpoint

        var operations = followData["operations"];
        var lenOperations = operations.length;

        for (var i = 0; i < lenOperations; ++i) {
            // parse each from and to user ids
            var operation = operations[i];
            var fromUserId = operation[0];
            var toUserId = operation[1];
            // prepare request body
            var body = prepareFollowRequestBody(fromUserId, toUserId);
            // issue request
            request(url).post('/follow').send(body).expect(200).end(function (err, res) {
                if (err) throw err;
            });
        }

        // feed in listen.json to POST/listen endpoint

        var userIds = listenData["userIds"];

        for (var userId in userIds) {
            // parse each from and to user ids
            var musicList = userIds[userId];
            var lenMusicList = musicList.length;
            for (var j = 0; j < lenMusicList; ++j) {
                var musicId = musicList[j];
                // prepare request body
                var body = prepareListenRequestBody(userId, musicId);
                // issue request
                request(url).post('/listen').send(body).expect(200).end(function (err, res) {
                    if (err) throw err;
                });
            }
        }

        // GET recommendations recommendations
        request(url).get('/recommendations').query({"user": "a"})
            .expect(200)
            .end(function (err, res) {
                if (err) throw err;
                console.log("");
                console.log("Recommendations result for userId 'a':");
                console.log(JSON.stringify(res.body, undefined, 2));
                done();
            });

    });
})
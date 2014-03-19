var userService = require('./../services/user-service.js');
var userStore = require('./../data_store/user-store.js');
var recommendationService = require('./../services/recommendation-service.js');
var validator = require('./../util/validator.js');

/*
 * POST /follow
 */
exports.follow = function (req, res) {
    var followerId = req.body.from;
    var followeeId = req.body.to;

    console.log("user.follow started with fromUserId", followerId, "toUserId", followeeId);

    // validate user input - if invalid, respond with 400 BAD REQUEST
    var isFollowerIdValid = validator.validate(followerId, validator.alphaNumericPattern, false, 32);
    if (!isFollowerIdValid) {
        res.send(400, validationError("from"));
        return;
    }
    var isFolloweeIdValid = validator.validate(followeeId, validator.alphaNumericPattern, false, 32);
    if (!isFolloweeIdValid) {
        res.send(400, validationError("to"));
        return;
    }

    // delegate to userService and respond 200 OK
    userService.addFollower(followerId, followeeId);

    res.send(200);
};

/*
 * POST /listen
 */
exports.listen = function (req, res) {
    var userId = req.body.user;
    var musicId = req.body.music;

    console.log("user.listen started with userId", userId, "musicId", musicId);

    // validate user input - if invalid, respond with 400 BAD REQUEST
    var isUserIdValid = validator.validate(userId, validator.alphaNumericPattern, false, 32);
    if (!isUserIdValid) {
        res.send(400, validationError("user"));
        return;
    }
    var isMusicIdValid = validator.validate(musicId, validator.alphaNumericPattern, false, 32);
    if (!isMusicIdValid) {
        res.send(400, validationError("music"));
        return;
    }

    // delegate to userService and respond 200 OK
    userService.addListenedMusic(userId, musicId);

    res.send(200);
};

/*
 * GET /recommendations
 */
exports.recommendations = function (req, res) {
    var userId = req.query.user;

    console.log("user.recommendations started with userId", userId);

    // validate user input - if invalid, respond with 400 BAD REQUEST
    var isUserIdValid = validator.validate(userId, validator.alphaNumericPattern, false, 32);
    if (!isUserIdValid) {
        res.send(400, validationError("user"));
        return;
    }

    // make sure the requested resource exists
    if (!userStore.findById(userId)) {
        // if a non-existent resource is requested, respond with 404 NOT FOUND
        res.send(404);
        return;
    }

    // delegate to recommendationService
    // respond with 200 OK upon successful async callback or if err exists, 500 INTERNAL SERVER ERROR
    recommendationService.recommendMusicFor(userId, function (err, result) {
        if (err) {
            res.send(500, internalError(err));
            return;
        }
        res.send(200, {"list": result});
    });
};

function validationError(invalidFieldName) {
    return {
        error: {
            code: "ValidationError",
            message: "Invalid request parameter: '" + invalidFieldName + "'"
        }
    };
}

function internalError(error) {
    return {
        error: {
            code: "InternalError",
            message: error
        }
    };
}
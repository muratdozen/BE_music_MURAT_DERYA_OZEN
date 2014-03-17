var userService = require('./../services/user-service');
var validator = require('./../util/validator.js');

/*
 * POST /follow
 */
exports.follow = function (req, res) {
    var followerId = req.body.from;
    var followeeId = req.body.to;

    console.log("user.follow started with fromUserId", followerId, "toUserId", followeeId);

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

    res.send(200);
};

/*
 * GET /recommendations
 */
exports.recommendations = function (req, res) {
    var userId = req.query.user;
    console.log("user.recommendations started with userId", userId);

    res.send(200, {list: ["abc", "xyz", "123"]});
};

function validationError(invalidFieldName) {
    return {
        error: {
            code: "ValidationError",
            message: "Invalid request parameter: '" + invalidFieldName + "'"
        }
    };
}
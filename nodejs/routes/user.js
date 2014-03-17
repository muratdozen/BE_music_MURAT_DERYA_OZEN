/*
 * POST /follow
 */
exports.follow = function (req, res) {
    var followerId = req.body.from;
    var followeeId = req.body.to;
    console.log("user.follow started with fromUserId", followerId, "toUserId", followeeId);

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
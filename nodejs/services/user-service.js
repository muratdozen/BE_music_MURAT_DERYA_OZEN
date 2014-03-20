var userStore = require('./../data_store/user-store.js');

/**
 * Add user with id followerId as a follower to the user with id followeeId.
 * If no user exists with id followerId, create a new user and save it in userStore.
 * @param followerId - Id of the user that follows.
 * @param followeeId - Id of the user being followed.
 */
exports.addFollower = function (followerId, followeeId) {
    // look up followerUser or create a new user
    var followerUser = userStore.findById(followerId) || userStore.newUserObject(followerId);
    // check if followerUser already follows followeeId
    var followedUsers = followerUser.followedUsers;
    if (!followedUsers[followeeId]) {
        // if not, add followeeId to the list of followed users
        followedUsers[followeeId] = true;
        followerUser.followedUsers = followedUsers;
    }
    // save to db
    userStore.save(followerUser);
}

/**
 * Add musicId to musics for user with userId. If musicId already exists, increment the count.
 * If no user exists with id userId, create a new user and save it in userStore.
 * @param userId - Id of the user.
 * @param musicId - Id of the music.
 */
exports.addListenedMusic = function (userId, musicId) {
    var user = userStore.findById(userId) || userStore.newUserObject(userId);

    if (user.musics[musicId]) user.musics[musicId] += 1;
    else user.musics[musicId] = 1;

    userStore.save(user);
}


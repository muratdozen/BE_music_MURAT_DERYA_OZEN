var userStore = require('./../data_store/user-store.js');

/**
 * Add user with id followerId as a follower to the user with id followeeId.
 * If no user exists with id followeeId, create a new user and save it in userStore.
 * @param followerId - Id of the user that follows.
 * @param followeeId - Id of the user being followed.
 */
exports.addFollower = function (followerId, followeeId) {
    var followeeUser = userStore.findById(followeeId) || userStore.newUserObject(followeeId);
    var followers = followeeUser.followers;
    if (followers.indexOf(followerId) == -1) {
        followers.push(followerId);
        followeeUser.followers = followers;
    }
    userStore.save(followeeUser);
}

/**
 * Add musicId to the list of musics for user with userId.
 * If no user exists with id userId, create a new user and save it in userStore.
 * @param userId - Id of the user.
 * @param musicId - Id of the music.
 */
exports.addListenedMusic = function (userId, musicId) {
    var user = userStore.findById(userId) || userStore.newUserObject(userId);
    user.musics.push(musicId);
    userStore.save(user);
}


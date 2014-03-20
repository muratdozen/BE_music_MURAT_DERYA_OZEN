/**
 * Map of userIds to user objects. The main in-memory storage for all users.
 */
var usersIndexedByUserId = {};
var size = 0;

/**
 * Search the users in the index and return the user object associated with the given userId.
 * @param userId
 * @returns The user object associated with the given userId or undefined if no such user is indexed.
 */
exports.findById = function (userId) {
    var result = usersIndexedByUserId[userId];
    return result;
}

/**
 * @returns All userIds in the index.
 */
exports.getAllUserIds = function () {
    return Object.keys(usersIndexedByUserId);
}

/**
 * Add a new user to the index if the given userId does not exist in the index,
 * otherwise, update the user object associated with the given userId.
 * @param user
 */
exports.save = function (user) {
    var userId = user.userId;
    if (!usersIndexedByUserId[userId]) ++size;
    usersIndexedByUserId[userId] = user;
}

/**
 * Remove all users from the index.
 */
exports.clear = function() {
    usersIndexedByUserId = {};
    size = 0;
}

/**
 * Returns the number of unique user objects in the index.
 * @param userId
 * @returns The size of the user store.
 */
exports.size = function() {
    return size;
}

/**
 * Returns (but does not save to index) a new user object.
 * The new object will be initialized with given userId and empty lists of followedUsers and musics.
 * @param userId
 * @returns A new user object.
 */
exports.newUserObject = function (userId) {
    var newUser = {};
    newUser.userId = userId;
    newUser.followedUsers = {};
    newUser.musics = {};
    return newUser;
}

/**
 * Expose the index object only if it's a development environment.
 * Used for testing purposes.
 */
if (process.env.NODE_ENV == 'development') {
    exports.usersIndexedByUserId = usersIndexedByUserId;
}